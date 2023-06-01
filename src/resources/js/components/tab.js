import UI from './ui-base';
import EventHandler from '../vendor/event-handler';
import { dataSetToObject, getElement } from '../util/dom-util';

const NAME = 'ui.tab';

const dataAttrOptions = {
  activeIndex: 0,
  activeClass: 'is-active',
};

const defaultOptions = {
  ...dataAttrOptions,
};

class Tab extends UI {
  constructor(element, options = {}) {
    super(element, options);
    this._initOptions(options);
    this._element = element;
    this._tablist = null;
    this._current = {
      tab: null,
      content: null,
    };
  }

  static GLOBAL_OPTIONS = {};
  static DATA_NAME = 'tab';

  static get EVENT() {
    return {
      CHANGED: `${NAME}.changed`,
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
    let instance = Tab.getInstance(_el);
    if (!instance && initialize) {
      instance = new Tab(_el);
      instance.init();
    }
    return instance;
  }

  _initVars() {
    this._tablist = this._element;
  }

  _initEvent() {
    EventHandler.on(this._tablist, super._eventName('click'), event => {
      if (!event.target.tagName.match(/^A$|AREA|INPUT|TEXTAREA|SELECT|BUTTON|LABEL/gim)) {
        event.preventDefault();
      }
      if (event.target.closest(`[data-autoset="tab"]`) === this._tablist) {
        this._clickEventHandler(event);
      }
    });
  }

  _initOptions(options) {
    this._options = {
      ...defaultOptions,
      ...Tab.GLOBAL_OPTIONS,
      ...options,
      ...dataSetToObject(this._element, dataAttrOptions, Tab.DATA_NAME),
    };
  }

  _clickEventHandler(event) {
    const target = event.target.closest(`[role="tab"]`);
    const parent = event.target.closest(`[role="tablist"]`);
    if (target) {
      event.preventDefault();
      this._current = {
        tab: target,
        content: document.querySelector(target.getAttribute('href')),
      };
      this._options.activeIndex = [...parent.querySelectorAll('li')].indexOf(target.parentNode);
      this.select();
    }
  }

  _select() {
    const { tab, content } = this._current;
    const tabs = tab.closest('[role="tablist"]');

    tabs.querySelectorAll('li').forEach(tab => {
      const target = tab.querySelector('a');
      target.setAttribute('aria-selected', '');
    });
    [...this._tablist.children].filter(item => {
      if (item.classList.contains('tabs__panel')) {
        item.classList.remove(this._options.activeClass);
      }
    });
    tab.setAttribute('aria-selected', true);
    content.classList.add(this._options.activeClass);
  }

  init() {
    this._initVars();
    this._initEvent();
    return this;
  }

  select(activeIndex) {
    if (typeof activeIndex === 'number') {
      const tabs = this._tablist.querySelectorAll('[role="tablist"]')[0];
      if (activeIndex >= tabs.querySelectorAll('li').length) {
        throw new Error('not found !!!!');
      }
      this._options.activeIndex = activeIndex;
      tabs.querySelectorAll('li').forEach((tab, index) => {
        const target = tab.querySelector('a');
        if (index === this._options.activeIndex) {
          this._current = {
            tab: target,
            content: document.querySelector(target.getAttribute('href')),
          };
        }
      });
    }
    this._select();

    // 탭 변경이벤트시 trigger
    EventHandler.trigger(this._tablist, Tab.EVENT.CHANGED, {
      activeIndex: this._options.activeIndex,
      current: this._current,
    });
  }

  destroy() {
    EventHandler.off(this._tablist, super._eventName('click'), this._clickEventHandler);
    this._options = null;
    this._current = null;
    this._tablist = null;
    super.destroy();
  }

  getElement() {
    return this._element;
  }
}

export default Tab;
