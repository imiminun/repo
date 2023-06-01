import UI from './ui-base';
import EventHandler from '../vendor/event-handler';
import { dataSetToObject, getElement } from '../util/dom-util';

const NAME = 'ui.phoneCalculator';

const dataAttrOptions = {};

const defaultOptions = {
  ...dataAttrOptions,
  dataNumber: 'data-number',
  input: '[data-element="input"]',
  dataRemove: '[data-element="remove"]',
  dataSubmit: '[data-element="submit"]',
  dataDefaultValue: 'data-defaultValue',
};

class PhoneCalculator extends UI {
  constructor(element, options = {}) {
    super(element, options);

    this._result = null;
    this._trigger = null;
    this._delete = null;
    this._observer = null;
    this._defaultValue = null;
    this._oberserValue = '';
    this._originValue = '';

    this._initOptions(options);
  }

  static DATA_NAME = 'phoneCalculator';
  static DATA_TRIGGER_NAME = `[data-autoset="phoneCalculator"]`;

  static get EVENT() {
    return {
      CHANGED: `changed.${NAME}`,
      SUBMIT: `submit.${NAME}`,
      ALL: `all.${NAME}`,
    };
  }

  static get NAME() {
    return NAME;
  }

  static trigger(event) {
    const el = event.target.closest(PhoneCalculator.DATA_TRIGGER_NAME);
    if (el) {
      const isInstance = PhoneCalculator.get(el);
      if (!isInstance) {
        const PhoneCalculator = new PhoneCalculator(el);
        PhoneCalculator.init()._open();
      }
    }
  }

  /**
   * PhoneCalculator 객체 반환
   * 인스턴스 반환
   * @param {*} element PhoneCalculator 엘리먼트
   * @param {*} initialize 초기화되지 않은 대상에 대해서 초기화 후 인스턴스를 반환할지 여부
   * @returns
   */
  static get(element, initialize = false) {
    const _el = getElement(element);

    if (!_el) {
      console.warn(`\n  warning from [${NAME}] ---> [element] not found.\n\n`);
      return;
    }

    let instance = PhoneCalculator.getInstance(_el);

    if (!instance && initialize) {
      instance = new PhoneCalculator(_el);
      instance.init();
    }

    return instance;
  }

  /**
   * dataNumber클릭시 value에 값추가
   * @param {*} num
   * @returns
   */
  _addCharFromString = num => {
    this._trigger.value += num;

    this._originValue = this._trigger.value;
    const value = this._addDotToPhoneNumber(this._trigger.value);
    return value;
  };

  /**
   * 입력한 phoneNumber 자릿수가 11일때 '.' 쩜추가
   * @param {*} phoneNumber
   * @returns
   */
  _addDotToPhoneNumber = phoneNumber => {
    if (typeof phoneNumber !== 'string') {
      return;
    }
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength === 11) {
      const dotAddedPhoneNumber = phoneNumber.substring(0, 3) + '.' + phoneNumber.substring(3, 7) + '.' + phoneNumber.substring(7);
      return dotAddedPhoneNumber;
    } else if (phoneNumberLength > 11) {
      return phoneNumber.replace(/\./g, '');
    }
    return phoneNumber;
  };

  /**
   * 인풋 벨류 remove
   * @param {*} str
   * @returns
   */
  _removeLastCharFromString = str => {
    if (typeof str !== 'string') {
      return;
    }
    const strLength = str.length;
    if (this._defaultValue && strLength === 3) {
      return this._defaultValue;
    }
    const strArray = str.split('');
    strArray.splice(strLength - 1, 1);
    const newStr = strArray.join('');
    return this._addDotToPhoneNumber(newStr);
  };

  /**
   * 키보드 넘버 입력
   * @param {*} key
   */
  _handlerNumberKey = key => {
    switch (key) {
      case 105:
      case 57:
        this._addValues(this._trigger, 9);
        break;
      case 104:
      case 56:
        this._addValues(this._trigger, 8);
        break;

      case 103:
      case 55:
        this._addValues(this._trigger, 7);
        break;

      case 102:
      case 54:
        this._addValues(this._trigger, 6);
        break;

      case 101:
      case 53:
        this._addValues(this._trigger, 5);
        break;

      case 100:
      case 52:
        this._addValues(this._trigger, 4);
        break;

      case 99:
      case 51:
        this._addValues(this._trigger, 3);
        break;

      case 98:
      case 50:
        this._addValues(this._trigger, 2);
        break;

      case 97:
      case 49:
        this._addValues(this._trigger, 1);
        break;

      case 96:
      case 48:
        this._addValues(this._trigger, 0);
        break;
    }
  };

  /**
   * 백스페이스 입력
   */
  _handlerBackSpaceKey = () => {
    this._removeValues(this._trigger);
  };

  /**
   * 엔터 입력
   */
  _handlerEnterKey = () => {
    EventHandler.trigger(this._element, PhoneCalculator.EVENT.SUBMIT);

    EventHandler.trigger(document, PhoneCalculator.EVENT.ALL, {
      component: this,
      eventType: PhoneCalculator.EVENT.SUBMIT,
    });
  };

  _valueObserver = () => {
    const config = { attributes: true, childList: false, subtree: false };

    const callback = mutationList => {
      for (const mutation of mutationList) {
        if (mutation.type === 'attributes') {
          this._oberserValue = mutationList[0].target.value;

          EventHandler.trigger(document, PhoneCalculator.EVENT.CHANGED, {
            component: this,
            value: this._oberserValue,
          });
        }
      }
    };

    const observer = new MutationObserver(callback);

    observer.observe(this._trigger, config);
    this._observer = observer;
  };

  _setValueAttribute(element) {
    element.setAttribute('value', element.value);
  }

  /**
   * 초기값 설정
   */
  _variobles = () => {
    const { dataRemove, dataDefaultValue, dataSubmit, input } = this._options;
    const trigger = this._element.querySelector(`${input}`);
    const removeEl = this._element.querySelector(`${dataRemove}`);
    const submitEl = this._element.querySelector(`${dataSubmit}`);
    const defaultValue = trigger.getAttribute(`${dataDefaultValue}`);

    this._trigger = trigger;
    this._delete = removeEl;
    this._defaultValue = defaultValue;
    this._submit = submitEl;

    if (this._defaultValue && this._defaultValue.length === 3) {
      this._trigger.value = this._defaultValue;
    }

    if (this._defaultValue && this._defaultValue.length > 3) {
      console.error('default Value error', '기본값은 3자리만 입력해주세요.');
    }
  };

  /**
   * setAdd Value
   * @param {*} element
   * @param {*} number
   */
  _addValues = (element, number) => {
    element.value = this._addCharFromString(number);
    this._setValueAttribute(element);
  };

  /**
   * setRemove Value
   * @param {*} element
   */
  _removeValues = element => {
    element.value = this._removeLastCharFromString(element.value);
    this._setValueAttribute(element);
  };

  /**
   * 이벤트 등록
   */
  _initEvents = () => {
    // 클릭 이벤트 touch미구현
    EventHandler.on(this._element, super._eventName('click'), event => {
      if (event.target.tagName.match('BUTTON')) {
        const { dataNumber } = this._options;
        const num = event.target.getAttribute(`${dataNumber}`);

        if (num) {
          if (this._trigger.value.length < 11) {
            this._addValues(this._trigger, num);
          }
        } else {
          if (this._delete === event.target) {
            this._removeValues(this._trigger);
          }

          if (this._submit === event.target) {
            this._handlerEnterKey();
          }
        }
      }
    });

    // 키보드 이벤트
    EventHandler.on(document, super._eventName('keydown'), event => {
      const numberKeyCodes = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105];
      const backSpaceKeyCodes = [8, 46, 110];
      const numberKey = numberKeyCodes.includes(event.keyCode);
      const backSpaceKey = backSpaceKeyCodes.includes(event.keyCode);

      if (this._trigger.value.length < 11) {
        if (numberKey) {
          this._handlerNumberKey(event.keyCode);
        }
      }

      if (backSpaceKey) {
        this._handlerBackSpaceKey();
      }

      if (event.keyCode === 13) {
        event.preventDefault();
        this._handlerEnterKey();
      }
    });
  };

  /**
   * 옵저버 disconnect
   */
  _valueObserverDisconnect() {
    this._observer.disconnect();
  }

  /**
   * 이벤트 제거
   */
  destroy() {
    this._valueObserverDisconnect();
    this._removeEvents();
  }

  _removeEvents() {
    EventHandler.off(this._element, super._eventName('click'));
    EventHandler.off(document, super._eventName('keydown'));
  }

  init() {
    this._variobles();
    this._initEvents();
    this._valueObserver();

    return this;
  }

  _initOptions(options) {
    this._options = {
      ...options,
      ...defaultOptions,
      ...dataSetToObject(this._element, dataAttrOptions, PhoneCalculator.DATA_NAME),
    };
  }
}

export default PhoneCalculator;
