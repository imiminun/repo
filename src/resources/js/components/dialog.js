import UI from './ui-base';
import EventHandler from '../vendor/event-handler';
import { dataSetToObject, getElement } from '../util/dom-util';

const NAME = 'ui.dialog';

const dataAttrOptions = {
  openClass: 'open',
  closeClass: 'close',
  animate: true,
  destroy: false,
};

const defaultOptions = {
  ...dataAttrOptions,
};

class Dialog extends UI {
  constructor(element, options = {}) {
    super(element, options);
    this._initOptions(options);
    this._element = element;
    this._isOpen = false;
    this._closeButton = null;
    this._trigger = null;
    this._init();

    EventHandler.trigger(this._element, Dialog.EVENT.INIT, {
      component: this,
    });
  }

  static GLOBAL_OPTIONS = {};
  static DATA_NAME = 'dialog';

  static get EVENT() {
    return {
      INIT: `${NAME}.init`,
      OPEN: `${NAME}.open`,
      OPENED: `${NAME}.opened`,
      CLOSE: `${NAME}.close`,
      CLOSED: `${NAME}.closed`,
    };
  }

  static get NAME() {
    return NAME;
  }

  /**
   * 다이얼로그 객체 반환
   * 인스턴스 반환
   * @param {*} element 다이얼로그 엘리먼트
   * @param {*} initialize 초기화되지 않은 대상에 대해서 초기화 후 인스턴스를 반환할지 여부
   * @returns
   */
  static get(element, initialize = false) {
    const _el = getElement(element);
    if (!_el) {
      console.warn(`\n  warning from [${NAME}] ---> [element] not found.\n\n`);
      return;
    }
    let instance = Dialog.getInstance(_el);
    if (!instance && initialize) {
      instance = new Dialog(_el);
    }
    return instance;
  }

  /**
   * 초기화 되어있는 모든 다이얼로그의 옵션을 업데이트합니다.
   * @param {*} options
   */
  static updateOption(options) {
    const insList = Dialog.getInstances();
    if (insList.length > 0) {
      insList.forEach(ins => {
        ins.updateOption(options);
      });
    }
  }

  static trigger(event) {
    const target = event.target;
    const trigger = target.closest('[data-dialog-trigger]');
    if (trigger) {
      const dialogID = trigger.getAttribute('data-dialog-trigger');
      const dialog = document.querySelector(dialogID);
      if (dialog) {
        if (!Dialog.getInstance(dialog)) {
          new Dialog(dialog).open();
        } else {
          Dialog.getInstance(dialog).open();
        }
      }
    }
  }

  static COUNT = 0;

  static closeAll() {
    if (Dialog.getInstances().length > 0) {
      Dialog.getInstances().forEach(dialog => {
        if (dialog && dialog._isOpen === true) dialog.close();
      });
    }
  }

  open() {
    if (this._isOpen) return;
    if (this._options.animate) this._element.classList.add('animate');
    this._isOpen = true;
    this._trigger = document.activeElement;
    this._element.classList.add(this._options.openClass);

    EventHandler.on(this._element, super._eventName('keydown'), event => {
      this._focusTrap(event, this);
    });

    this._scrollHidden();

    EventHandler.trigger(this._element, Dialog.EVENT.OPEN, {
      component: this,
    });

    const openEventHandler = () => {
      EventHandler.trigger(this._element, Dialog.EVENT.OPENED, {
        component: this,
      });
      this._element.removeEventListener('animationend', openEventHandler);
      this._closeButton.focus();
    };

    if (this._options.animate) {
      this._element.addEventListener('animationend', openEventHandler);
    } else {
      this._closeButton.focus();
    }

    Dialog.COUNT++;
  }

  _focusTrap(event) {
    const focusableEls = this._element.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])');
    const firstFocusableEl = focusableEls[0];
    const lastFocusableEl = focusableEls[focusableEls.length - 1];
    const KEYCODE_TAB = 9;
    const isTabPressed = event.key === 'Tab' || event.keycode === KEYCODE_TAB;
    if (!isTabPressed) return;
    /* shift + tab */
    if (event.shiftKey) {
      if (document.activeElement === firstFocusableEl) {
        lastFocusableEl.focus();
        event.preventDefault();
      }
      /* tab */
    } else {
      if (document.activeElement === lastFocusableEl) {
        firstFocusableEl.focus();
        event.preventDefault();
      }
    }
  }

  close() {
    if (!this._isOpen) return;
    this._isOpen = false;
    this._element.classList.remove(this._options.openClass);
    EventHandler.trigger(this._element, Dialog.EVENT.CLOSE, {
      component: this,
    });
    Dialog.COUNT--;
    // console.log('Dialog.COUNT:' + Dialog.COUNT);

    const closeEventHandler = () => {
      this._element.classList.remove(this._options.closeClass);
      this._element.removeEventListener('animationend', closeEventHandler);
      EventHandler.trigger(this._element, Dialog.EVENT.CLOSED, {
        component: this,
      });

      this._scrollVisible();
      this._trigger.focus();
      if (this._options.destroy) this.destroy();
    };

    if (this._options.animate) {
      this._element.classList.add(this._options.closeClass);
      this._element.addEventListener('animationend', closeEventHandler);
    } else {
      this._scrollVisible();
      this._trigger.focus();
      if (this._options.destroy) this.destroy();
    }

    EventHandler.off(this._element, super._eventName('keydown'));
  }

  updateOption(options) {
    this._options = {
      ...this._options,
      ...options,
    };
    return this;
  }

  destroy() {
    this._element.remove();
    this._isOpen = null;
    this._closeButton = null;
    this._trigger = null;
    EventHandler.off(this._element, super._eventName('click'));
    EventHandler.off(this._element, super._eventName('keydown'));
    EventHandler.off(this._element, Dialog.EVENT.OPEN);
    EventHandler.off(this._element, Dialog.EVENT.OPENED);
    EventHandler.off(this._element, Dialog.EVENT.CLOSE);
    EventHandler.off(this._element, Dialog.EVENT.CLOSED);
    super.destroy();
  }

  getElement() {
    return this._element;
  }

  _initOptions(options) {
    this._options = {
      ...defaultOptions,
      ...Dialog.GLOBAL_OPTIONS,
      ...options,
      ...dataSetToObject(this._element, dataAttrOptions, Dialog.DATA_NAME),
    };
  }

  _init() {
    EventHandler.on(this._element, super._eventName('click'), event => this._initEvent(event));
    this._closeButton = this._element.querySelector('.modal__btn-close');
  }

  _initEvent(event) {
    if (event.target.closest('[data-dialog-close]')) this.close();
  }

  _scrollHidden() {
    document.body.classList.add('dialog-open');
  }

  _scrollVisible() {
    if (Dialog.COUNT <= 0) {
      document.body.classList.remove('dialog-open');
    }
  }
}

export default Dialog;
