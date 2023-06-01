import UI from './ui-base';
import EventHandler from '../vendor/event-handler';
import { dataSetToObject, qs, qsAll, getIndex, getElement } from '../util/dom-util';

const NAME = 'ui.select';

const OPENNER = `[data-select="btn"]`;
const VALUE_HOLDER = `[data-select="value"]`;
const SELECT_AREA = `[data-select="text"]`;
const LIST_WRAP = `[data-select="list"]`;
const AREA = `[data-select="option"]`;

const dataAttrOptions = {
  openClass: 'open',
  closeClass: 'close',
  animate: true,
};

const defaultOptions = {
  ...dataAttrOptions,
  directionChange: null,
};

class Select extends UI {
  constructor(element, options = {}) {
    super(element, options);
    this._initOptions(options);
  }

  static GLOBAL_OPTIONS = {};
  static DATA_NAME = 'select';
  static DATA_TRIGGER_NAME = `[data-select="select"]`;

  static get EVENT() {
    return {
      CHANGE: `onChange.${NAME}`,
      CLOSE: `onClose.${NAME}`,
    };
  }

  static get NAME() {
    return NAME;
  }

  static trigger(event) {
    const el = event.target.closest(SelectBox.DATA_TRIGGER_NAME);
    if (el) {
      const isInstance = Select.get(el);
      if (!isInstance) {
        const Select = new Select(el);
        Select.init()._open();
      }
    }
  }

  /**
   * 셀렉트 박스 객체 반환
   * 인스턴스 반환
   * @param {*} element 셀렉트박스 엘리먼트
   * @param {*} initialize 초기화되지 않은 대상에 대해서 초기화 후 인스턴스를 반환할지 여부
   * @returns
   */
  static get(element, initialize = false) {
    const _el = getElement(element);
    if (!_el) {
      console.warn(`\n  warning from [${NAME}] ---> [element] not found.\n\n`);
      return;
    }
    let instance = Select.getInstance(_el);
    if (!instance && initialize) {
      instance = new Select(_el);
      instance.init();
    }
    return instance;
  }

  /**
   * 선택된 항목 value 반환
   * @param {*} value
   */
  value() {
    return this._valueHolder.getAttribute('value');
  }
  /**
   * 선택된 항목 텍스트 반환
   * @param {*} value
   * @returns
   */
  text() {
    if (this._currentItem) return this._currentItem?.textContent;
    return null;
  }

  /**
   * 선택된 항목 인덱스 반환
   * @returns
   */
  index() {
    return getIndex(this._currentItem);
  }

  _open() {
    if (this._isDisable) return;
    this._isOpen = true;

    this._element.classList.add(this._options.openClass);
    this._openner.setAttribute('aria-expanded', true);
  }

  /**
   * disable 처리
   * @param {*} isDisable
   */
  disable(isDisable) {
    this._isDisable = isDisable;
    if (this._isDisable) {
      this._openner.setAttribute('aria-disabled', 'true');
      this._openner.setAttribute('tabindex', -1);
    } else {
      this._openner.removeAttribute('aria-disabled');
      this._openner.setAttribute('tabindex', 0);
    }
  }

  /**
   * 현재 선택된 값 반환, 또는 선택
   * @returns
   */
  selectValue(value) {
    this._optionItems = this._getOptions();
    for (let i = 0; i < this._optionItems.length; i++) {
      const item = this._optionItems[i];
      if (item.getAttribute('value') === String(value)) {
        this._currentItem = item;
        break;
      }
    }

    this._select(this._currentItem, true);
  }

  /**
   * text를 통해 업데이트
   * @param {*} value
   */
  selectText(value) {
    this._optionItems = this._getOptions();
    for (let i = 0; i < this._optionItems.length; i++) {
      const item = this._optionItems[i];
      if (item.textContent === String(value)) {
        this._currentItem = item;
        break;
      }
    }
    this._select(this._currentItem, true);
  }

  /**
   * 인덱스로 선택
   * @param {*} index
   * @returns
   */
  selectIndex(index) {
    this._optionItems = this._getOptions();
    this._currentIndex = this._optionItems[index];
    this._select(this._currentIndex, true);
    return this._currentIndex;
  }

  setDefault() {
    this._currentIndex = -1;
    this._currentItem = undefined;
    const selectedItem = this._element.querySelector('[aria-selected="true"]');
    this._valueHolder.removeAttribute('value');
    this._valueHolder.removeAttribute('text');
    if (selectedItem) selectedItem.removeAttribute('aria-selected');
    const btn = this._element.querySelector('[data-empty]');
    btn.innerHTML = '';
  }

  destroy() {
    EventHandler.off(this._element, super._eventName('click'));
    EventHandler.off(this._element, super._eventName('focusin'));
    EventHandler.off(this._element, super._eventName('focusout'));
    EventHandler.off(this._element, super._eventName('keydown'));
    this._childObserver.disconnect();
    this._childObserver = null;
    this._valueObserver.disconnect();
    this._valueObserver = null;
  }

  _close(goFocus = false) {
    this._isOpen = false;
    this._element.classList.remove(this._options.openClass);
    EventHandler.trigger(this._element, Select.EVENT.CLOSE);

    this._openner.setAttribute('aria-expanded', false);
    if (goFocus) {
      this._openner.focus();
    }
  }

  _select(item) {
    // this._valueObserverState(false);
    if (!item || (this._isDisable && isForce === false)) return;
    this._optionItems.forEach((el, i) => {
      // 현재 인덱스 처리
      /**
       * @todo 같은 속성 내용으로 option이 설정되면 이 로직 변경필요
       */
      if (el === item) {
        this._currentIndex = i;
      }
      el.removeAttribute('aria-selected');
    });
    this._currentItem = item;
    this._currentItem.setAttribute('aria-selected', true);
    this._selectArea.innerHTML = this._currentItem.innerHTML;
    this._valueHolder.value = this._currentItem.getAttribute('value');
    this._valueHolder.setAttribute('text', this._currentItem.textContent);
    this._element.value = this._currentItem.textContent;

    this._valueObserverState(true);
  }

  _toggle() {
    if (this._element.classList.contains(this._options.openClass)) {
      this._close();
    } else {
      this._open();
    }
  }

  init() {
    this._initVars();
    this._initEvents();
    this._select(this._currentItem, true, true);
    return this;
  }

  _initEvents() {
    EventHandler.on(this._element, super._eventName('focusin'), () => this._setTimer(false));
    EventHandler.on(this._element, super._eventName('focusout'), () => this._setTimer(true));
    EventHandler.on(this._element, super._eventName('click'), event => {
      if (!event.target.tagName.match(/^A$|AREA|INPUT|TEXTAREA|SELECT|BUTTON|LABEL/gim)) {
        event.preventDefault();
      }
      const openner = event.target.closest(OPENNER);
      const item = event.target.closest(`[class*="select"] ${LIST_WRAP} ${AREA} button`);

      // 오프너 토글
      if (openner) {
        this._toggle();
      }

      // class="select"내부에 data-select="list" > data-select="options" > button클릭시 실행
      if (item) {
        this._select(item, false);
        this._close(true);
      }
    });
  }

  // focus가 변경될시 닫음
  _setTimer(isStart = true) {
    if (isStart) {
      if (this._isOpen) this._closeTimer = setTimeout(() => this._close(), 50);
    } else {
      if (this._closeTimer) {
        clearTimeout(this._closeTimer);
        this._closeTimer = null;
      }
    }
  }

  // 옵션 엘리먼트리스트 반환
  _getOptions = () => {
    return qsAll(this._box, `button`);
  };

  _initVars() {
    this._valueObserverState(false);
    this._currentIndex = -1;
    this._openner = qs(this._element, OPENNER);
    this._selectArea = qs(this._element, SELECT_AREA);
    this._boxWrap = qs(this._element, LIST_WRAP);
    this._box = qs(this._element, AREA);
    this._valueHolder = qs(this._element, VALUE_HOLDER);
    this._optionItems = this._getOptions();
    this._closeTimer = null;
    this._isDisable = this._openner.getAttribute('aria-disabled') === 'true';
    if (this._isDisable) {
      this._openner.setAttribute('tabindex', -1);
    }

    if (!this._valueObserver) {
      this._valueObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          const oldValue = mutation.oldValue;
          // if (mutation.attributeName === "aria-invalid") return;
          if (mutation.attributeName === 'text') {
            const selectedText = this._valueHolder.getAttribute('text');
            if (selectedText && oldValue !== selectedText) {
              this._currentItem = Array.from(this._optionItems).filter(item => item.textContent === selectedText)[0];
              this._select(this._currentItem);
            }
          } else if (mutation.attributeName === 'value') {
            const selectedValue = this._valueHolder.getAttribute('value');
            if (selectedValue && oldValue !== selectedValue) {
              this._currentItem = Array.from(this._optionItems).filter(item => item.getAttribute('value') === selectedValue)[0];
              this._select(this._currentItem);
            }
          }
        });
      });
    }

    // 디폴트값 셋팅 ( 디폴트값이 있는경우 위의 플레이스홀더처리를 덮어씌우고 디폴트값으로 셋팅 )
    // value 값으로 셋팅
    const selectedValue = this._valueHolder.getAttribute('value');
    // text 값으로 셋팅
    const selectedText = this._valueHolder.getAttribute('text');
    if (selectedValue) {
      this._currentItem = Array.from(this._optionItems).filter(item => item.getAttribute('value') === selectedValue)[0];
    } else if (selectedText) {
      this._currentItem = Array.from(this._optionItems).filter(item => item.textContent === selectedText)[0];
    }
  }

  _valueObserverState(isObserve = true) {
    if (isObserve) {
      if (this._valueObserver) {
        this._valueObserver.disconnect();
        this._valueObserver.observe(this._valueHolder, {
          attributes: true,
          attributeOldValue: true,
        });
      }
    } else {
      if (this._valueObserver) this._valueObserver.disconnect();
    }
  }

  _initOptions(options) {
    this._options = {
      ...defaultOptions,
      ...Select.GLOBAL_OPTIONS,
      ...options,
      ...dataSetToObject(this._element, dataAttrOptions, Select.DATA_NAME),
    };
  }
}

export default Select;
