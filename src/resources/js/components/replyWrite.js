import UI from './ui-base';
import EventHandler from '../vendor/event-handler';
import { dataSetToObject, getElement } from '../util/dom-util';

const NAME = 'ui.replyWrite';

const dataAttrOptions = {};

const defaultOptions = {
  ...dataAttrOptions,
};

class ReplyWrite extends UI {
  constructor(element, options = {}) {
    super(element, options);
    this._initOptions(options);
    this._element = element;
    this._init();
  }

  static GLOBAL_OPTIONS = {};
  static DATA_NAME = 'replyWrite';
  static get NAME() {
    return NAME;
  }

  static get EVENT() {
    return {
      WRITE: `${NAME}.write`,
      SAVE: `${NAME}.save`,
      MODIFY: `${NAME}.modify`,
      DELETE: `${NAME}.delete`,
    };
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
    let instance = ReplyWrite.getInstance(_el);
    if (!instance && initialize) {
      instance = new ReplyWrite(_el);
    }
    return instance;
  }

  destroy() {
    EventHandler.off(this._element, super._eventName('click'));
    super.destroy();
  }

  getElement() {
    return this._element;
  }

  _initOptions(options) {
    this._options = {
      ...defaultOptions,
      ...ReplyWrite.GLOBAL_OPTIONS,
      ...options,
      ...dataSetToObject(this._element, dataAttrOptions, ReplyWrite.DATA_NAME),
    };
  }

  _init() {
    this._initEvent();
  }

  _initEvent() {
    EventHandler.on(this._element, super._eventName('click'), event => {
      if (!event.target.tagName.match(/^A$|AREA|INPUT|TEXTAREA|SELECT|BUTTON|LABEL/gim)) {
        event.preventDefault();
      }

      const container = event.target.closest('[data-autoset="replyWrite"]');
      const target = event.target.closest('.review__con--reply');
      const reply = target;

      if (container !== this._element) return;

      // 답변등록
      if (event.target.getAttribute('data-reply-btn') === 'write') {
        this._initReg(reply);
      }
      // 답변수정
      if (event.target.getAttribute('data-reply-btn') === 'mod') {
        this._modify(reply);
      }
      // 답변저장
      if (event.target.getAttribute('data-reply-btn') === 'save') {
        this._save(reply);
      }
      // 답변삭제
      if (event.target.getAttribute('data-reply-btn') === 'del') {
        this._delete(reply);
      }
    });
  }

  _initReg(target) {
    EventHandler.trigger(this._element, ReplyWrite.EVENT.WRITE, {
      target: target,
    });
  }

  _save(target) {
    EventHandler.trigger(this._element, ReplyWrite.EVENT.SAVE, {
      target: target,
    });
  }

  _modify(target) {
    EventHandler.trigger(this._element, ReplyWrite.EVENT.MODIFY, {
      target: target,
    });
  }

  _delete(target) {
    EventHandler.trigger(this._element, ReplyWrite.EVENT.DELETE, {
      target: target,
    });
  }
}

export default ReplyWrite;
