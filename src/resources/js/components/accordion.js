import UI from './ui-base';
import EventHandler from '../vendor/event-handler';
import { dataSetToObject, isVisible, getElement, qs, qsAll } from '../util/dom-util';

const NAME = 'ui.accordion';

const dataAttrOptions = {
  defaultsOpen: '',
  animate: true,
  toggle: true,
  multiple: true,
  openClass: 'is-active',
};

const defaultOptions = {
  ...dataAttrOptions,
  opennerSelector: `[aria-controls]`,
  contentWrap: null,
  contentSelector: null,
  className: {
    expand: 'expand',
    expanding: 'expanding',
    expanded: 'expanded',
  },
};

class Accordion extends UI {
  constructor(element, options = {}) {
    super(element, options);
    this._initOptions(options);
    this._animating = false;
    this._current = {
      header: null,
      headers: [],
      content: null,
    };
    this._before = {
      header: null,
      headers: [],
      content: null,
    };
  }

  static GLOBAL_OPTIONS = {};
  static DATA_NAME = 'accordion';
  static DATA_TRIGGER_NAME = `[data-autoset="accordion"]`;
  static HOOK = {
    OPEN: null,
    OPENED: null,
    CLOSE: null,
    CLOSED: null,
  };
  static get EVENT() {
    return {
      OPEN: `open.${NAME}`,
      OPENED: `opend.${NAME}`,
      CLOSE: `close.${NAME}`,
      CLOSED: `closed.${NAME}`,
    };
  }

  static get NAME() {
    return NAME;
  }

  /**
   * 초기화 되어있는 모든 드롭다운메뉴 옵션을 업데이트합니다.
   * @param {*} options
   */
  static updateOption(options) {
    const insList = Accordion.getInstances();
    if (insList.length > 0) {
      insList.forEach(ins => {
        ins.updateOption({
          ...options,
        });
      });
    }
  }

  /**
   * 옵션값을 업데이트합니다.
   * @param {*} options
   */
  updateOption(options) {
    this._options = {
      ...this._options,
      ...options,
    };
  }

  open(target, force = false) {
    this._selectCurrent(target);
    this._open(force);
  }

  close(target) {
    this._selectCurrent(target);
    this._close();
  }

  init(isDefault = true) {
    this._initEvents();
    this._current = null;
    this._before = null;
    isDefault && this._defaultActive();
    return this;
  }

  _defaultActive() {
    // 기본으로 열릴 때 애니메이션을 생략한다.
    const beforeState = this._options.animate;

    if (this._options.defaultsOpen !== '') {
      this._options.animate = false;
      const headerIndexList = this._options.defaultsOpen.split(',');
      Array.from(headerIndexList).forEach(n => {
        this.open(n);
        this._animating = false;
      });
      this._options.animate = beforeState;
      return;
    }

    const headers = qsAll(this._element, this._options.opennerSelector);
    this._options.animate = false;
    headers.forEach(el => {
      if (el.getAttribute('aria-expanded') === 'true') {
        this.open(el, true);
        this._animating = false;
      }
    });
    this._options.animate = beforeState;
  }

  getElement() {
    return this._element;
  }

  // 오픈 함수
  _open(force = false) {
    const { openClass, animate, multiple, className } = this._options;
    const possibleAnimation = isVisible(this._element);
    if (this._animating === true && animate === true) return;
    const { header, headers, content } = this._current;
    if (force === false && header.classList.contains(openClass)) {
      this._animating = false;
      this._before = {
        header,
        headers,
        content,
      };
      return;
    }

    if (headers && headers.length > 1) {
      headers.forEach(el => el.classList.add(openClass));
    } else {
      header.classList.add(openClass);
    }

    Accordion.HOOK.OPEN && Accordion.HOOK.OPEN(this);
    this._dispatch(Accordion.EVENT.OPEN, {
      component: this,
      current: this._current,
      eventType: Accordion.EVENT.OPEN,
    });
    EventHandler.trigger(document, Accordion.EVENT.ALL, {
      component: this,
      eventType: Accordion.EVENT.OPEN,
    });

    if (animate && possibleAnimation) {
      this._animating = false;
      content.classList.add(className.expanding);
      content.classList.remove(className.expand);
      content.style.height = `${content.scrollHeight}px`;
      EventHandler.off(content, 'transitionend');
      EventHandler.one(content, 'transitionend', () => {
        content.classList.remove(className.expanding);
        content.classList.add(className.expand);
        content.classList.add(className.expanded);
        content.style.height = '';
        this._animating = false;
        Accordion.HOOK.OPENED && Accordion.HOOK.OPENED(this);
        this._dispatch(Accordion.EVENT.OPENED, {
          component: this,
          current: this._current,
          eventType: Accordion.EVENT.OPENED,
        });
        EventHandler.trigger(document, Accordion.EVENT.ALL, {
          component: this,
          eventType: Accordion.EVENT.OPENED,
        });
      });
    } else {
      content.classList.add(className.expanded);
      content.classList.add(className.expand);

      if (headers && headers.length > 1) {
        headers.forEach(el => el.classList.add(openClass));
      } else {
        header.classList.add(openClass);
      }
      Accordion.HOOK.OPENED && Accordion.HOOK.OPENED(this);
      this._dispatch(Accordion.EVENT.OPENED, {
        component: this,
        current: this._current,
        eventType: Accordion.EVENT.OPENED,
      });
      EventHandler.trigger(document, Accordion.EVENT.ALL, {
        component: this,
        eventType: Accordion.EVENT.OPENED,
      });
    }

    if (multiple !== true) {
      if (this._before && this._before.header !== this._current.header) {
        this._animating = false;
        this._close(this._before);
      }
    }

    this._before = {
      header,
      headers,
      content,
    };

    this._aria(this._current, true);
  }

  /**
   * @private
   * 아코디언 닫기
   * @param {*} target
   * @returns void
   */
  _close(target) {
    const { openClass, animate, className } = this._options;
    if (this._animating === true && animate === true) return;
    const closeTarget = !!target ? target : this._current;
    if (!closeTarget || !closeTarget.header) return;
    const { header, headers, content } = closeTarget;
    const possibleAnimation = isVisible(content);

    if (!header.classList.contains(openClass)) {
      this._animating = false;
      return;
    }

    if (headers && headers.length > 1) {
      headers.forEach(el => el.classList.remove(openClass));
    } else {
      header.classList.remove(openClass);
    }

    Accordion.HOOK.CLOSE && Accordion.HOOK.CLOSE(this);
    this._dispatch(Accordion.EVENT.CLOSE, {
      component: this,
      current: closeTarget,
      eventType: Accordion.EVENT.CLOSE,
    });
    EventHandler.trigger(document, Accordion.EVENT.ALL, {
      component: this,
      eventType: Accordion.EVENT.CLOSE,
    });
    this._aria(closeTarget, false);
    if (animate && possibleAnimation) {
      this._animating = false;
      content.style.height = `${content.getBoundingClientRect().height}px`;
      content.heightCache = content.offsetHeight;
      content.style.height = ``;
      content.classList.add(className.expanding);
      content.classList.remove(className.expand);
      content.classList.remove(className.expanded);
      EventHandler.off(content, 'transitionend');
      EventHandler.one(content, 'transitionend', () => {
        content.classList.remove(className.expanding);
        content.classList.add(className.expand);
        this._animating = false;
        Accordion.HOOK.CLOSED && Accordion.HOOK.CLOSED(this);
        this._dispatch(Accordion.EVENT.CLOSED, {
          component: this,
          current: closeTarget,
          eventType: Accordion.EVENT.CLOSED,
        });
        EventHandler.trigger(document, Accordion.EVENT.ALL, {
          component: this,
          eventType: Accordion.EVENT.CLOSED,
        });
      });
      return;
    } else {
      content.classList.remove(className.expanding);
      content.classList.remove(className.expanded);
      content.classList.add(className.expand);
      Accordion.HOOK.CLOSED && Accordion.HOOK.CLOSED(this);
      this._dispatch(Accordion.EVENT.CLOSED, {
        component: this,
        current: closeTarget,
        eventType: Accordion.EVENT.CLOSED,
      });
      // EventHandler.trigger(document, Accordion.EVENT.ALL, {
      //   component: this,
      //   eventType: Accordion.EVENT.CLOSED,
      // });
    }
  }

  /**
   * @private
   * 현제 아이템을 선택 _current에 할당
   * @param {*} target
   * @returns void
   */
  _selectCurrent(target) {
    // 인덱스
    if (!isNaN(target)) {
      const accHeaders = qsAll(this._element, this._options.opennerSelector);
      this._current = {
        header: accHeaders[target],
        content: this._getContent(accHeaders[target]),
      };
    } else {
      // 셀렉터 스트링
      if (typeof target === 'string') {
        const header = qs(this._element, target);
        this._current = {
          header,
          content: this._getContent(header),
        };
      } else {
        // 엘리먼트
        const _header = getElement(target);
        this._current = {
          header: _header,
          content: this._getContent(_header),
        };
      }
    }
  }

  _initEvents() {
    EventHandler.on(this._element, super._eventName('click'), event => {
      const { toggle, openClass, opennerSelector } = this._options;

      if (!event.target.tagName.match(/^A$|AREA|INPUT|TEXTAREA|SELECT|BUTTON|LABEL/gim) && event.target.classList.contains('accordion__content')) {
        event.preventDefault();
      }

      const target = event.target.closest(opennerSelector);
      if (target) {
        const container = target.closest('[data-autoset="accordion"]');
        if (container !== this._element) return;

        this._selectContentBySelector(target, event.target);

        if (toggle) {
          if (this._current.header.classList.contains(openClass)) {
            this._close(this._current);
          } else {
            this._open();
          }
        } else {
          if (!this._current.header.classList.contains(openClass)) {
            this._open();
          }
        }
      }
    });
  }

  _selectContentBySelector(target) {
    const { opennerSelector } = this._options;
    if (opennerSelector === '[aria-controls]') {
      const controlsName = target.getAttribute(`aria-controls`);
      const controls = qsAll(document, `[aria-controls="${controlsName}"]`);
      this._current = {
        header: target,
        headers: controls,
        content: this._getContent(target),
      };
    } else {
      this._current = {
        header: target,
        headers: [],
        content: this._getContent(target),
      };
    }
  }

  _getContent(target) {
    if (!target) {
      super._warn(`[${target}] not found!`);
      return;
    }
    const { opennerSelector, contentSelector, contentWrap } = this._options;
    let content;
    if (opennerSelector === '[aria-controls]') {
      const contentName = this._getAttributeBySelector(target, this._options.opennerSelector);
      content = qs(document, `#${contentName}`);
    } else {
      if (!contentWrap) {
        const cWrap = target.closest(`[data-autoset="accordion"]`);
        if (cWrap) {
          content = qs(cWrap, contentSelector);
        }
      } else {
        const cWrap = target.closest(contentWrap);
        if (cWrap) {
          content = qs(cWrap, contentSelector);
        }
      }
    }

    if (!content) {
      super._warn(`[${contentName}] does not match any content element! `);
    }

    return content;
  }

  destory() {
    this._removeEvents();
    this._removeAttributes();
  }

  _removeEvents() {
    EventHandler.off(this._element, super._eventName('click'));
  }

  _removeAttributes() {
    const controls = qsAll(this._element, this._options.opennerSelector);
    const { openClass, className } = this._options;
    controls.forEach(el => {
      const content = this._getContent(el);
      if (content) {
        if (content.classList.contains(className.expanded)) {
          content.classList.remove(className.expanded);
          content.setAttribute('aria-hidden', true);
          // content.setAttribute("tabIndex", -1);
        }
      }
      el.setAttribute('aria-expanded', false);
      if (el.classList.contains(openClass)) {
        el.classList.remove(openClass);
      }
    });
  }

  /**
   * @private
   * 웹 접근성 aria 속성 및 tabindex 설정
   * @param {*} target
   * @param {*} isActive
   * @returns void
   */
  _aria(target, isActive = true) {
    const { toggle } = this._options;
    const { header, headers, content } = target;
    const isSelected = isActive ? true : false;
    const isHidden = isActive ? false : true;
    // const tabIndex = isActive ? 0 : -1;
    if (headers && headers.length > 1) {
      headers.forEach(el => el.setAttribute('aria-expanded', isSelected));
    } else {
      header.setAttribute('aria-expanded', isSelected);
    }

    if (toggle === false) {
      if (headers && headers.length > 1) {
        headers.forEach(el => el.setAttribute('aria-disabled', isActive));
      } else {
        header.setAttribute('aria-disabled', isActive);
      }
    }
    content.setAttribute('aria-hidden', isHidden);
    // content.setAttribute("tabIndex", tabIndex);
  }

  _getAttributeBySelector(target, selector) {
    return target.getAttribute(selector.replace('[', '').replace(']', ''));
  }

  _dispatch(event, params) {
    EventHandler.trigger(this._element, event, params);
  }

  _initOptions(options) {
    this._options = {
      ...defaultOptions,
      ...Accordion.GLOBAL_OPTIONS,
      ...options,
      ...dataSetToObject(this._element, dataAttrOptions, Accordion.DATA_NAME),
    };
  }
}

export default Accordion;
