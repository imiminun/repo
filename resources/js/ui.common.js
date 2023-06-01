import Accordion from './components/accordion';
import Tab from './components/tab';
import Select from './components/select';
import Dialog from './components/dialog';
import DialogWrapper from './components/dialogWrapper';
import EventHandler from './vendor/event-handler';
import commonInit from './ui.hitai';
import PhoneCalculator from './components/phoneCalculator';
import ReplyWrite from './components/replyWrite';

Select.DATA_OPTIONS = `[data-select="select"]`;
Accordion.DATA_OPTIONS = `[data-autoset="toggle"]`;
Tab.DATA_TRIGGER_NAME = `[data-autoset="tab"]`;
Dialog.DATA_TRIGGER_NAME = `[data-dialog-trigger]`;
PhoneCalculator.DATA_TRIGGER_NAME = `[data-autoset="phoneCalculator"]`;
ReplyWrite.DATA_TRIGGER_NAME = `[data-autoset="replyWrite"]`;

// 전역설정
Select.GLOBAL_OPTIONS = {
  openClass: 'expanded',
  closeClass: 'folded',
};
Dialog.GLOBAL_OPTIONS = {
  openClass: 'open',
  closeClass: 'close',
};

// 각 컴포넌트 초기화 헬퍼
const UIInitializer = (target, UI, options = {}, parent = null) => {
  const elements = parent === null ? document.querySelectorAll(target) : parent.querySelectorAll(target);
  elements.forEach(el => {
    if (!UI.getInstance(el)) {
      const ui = new UI(el, getOptions(el, UI, options));
      ui.init();
    }
  });
};

const getOptions = (target, UI, options) => {
  let _options = { ...options };
  if (target.getAttribute('data-toggle') === 'group' && UI.NAME === 'ui.accordion') {
    _options = { ..._options, multiple: false };
  }
  return _options;
};

const initialize = (parent = null) => {
  console.log('initialize');
  // Select
  UIInitializer(Select.DATA_TRIGGER_NAME, Select, {}, parent);
  // Tab
  UIInitializer(Tab.DATA_TRIGGER_NAME, Tab, {}, parent);
  // Accordion
  UIInitializer(Accordion.DATA_TRIGGER_NAME, Accordion, {}, parent);
  // Calculator
  UIInitializer(PhoneCalculator.DATA_TRIGGER_NAME, PhoneCalculator, {}, parent);
  // ReplyWrite
  UIInitializer(ReplyWrite.DATA_TRIGGER_NAME, ReplyWrite, {}, parent);

  // 재사용가능성이 있는 함수의 경우 HitaiUI에 등록후 재실행
  commonInit.uiInitialize();
};

const SwiperA11y = (el, options = {}) => {
  return new window.Swiper(el, {
    ...options,
    threshold: 10, // 10px 이상 움직여야 슬라이드 기능작동
    a11y: {
      nextSlideMessage: '다음 슬라이드',
      prevSlideMessage: '이전 슬라이드',
      firstSlideMessage: '첫번째 슬라이드',
      lastSlideMessage: '마지막 슬라이드',
    },
    on: {
      init: function () {
        const slides = this.slides;
        const swiper = this;
        const wrapper = this.el;
        [].forEach.call(slides, (el, i) => {
          const elTarget = options.a11yTarget ? el.querySelector(options.a11yTarget) : el;

          elTarget.setAttribute('tabindex', 0);
          EventHandler.on(elTarget, 'focusin', () => {
            setTimeout(() => {
              wrapper.scrollLeft = 0;
              swiper.slideTo(i, 100);
            }, 0);
          });
        });

        if (options.init) {
          options.init.apply(this);
        }
      },
      afterInit: function () {
        if (options.afterInit) {
          options.afterInit.apply(this);
        }
      },
      ...options.on,
    },
  });
};

const Alert = (message, callback = null) => {
  const dialog = new DialogWrapper({ message: message, dialog: 'alert' });
  if (callback) {
    if (callback['ui.dialog.open']) {
      EventHandler.one(dialog.getElement(), Dialog.EVENT.OPEN, event => {
        callback['ui.dialog.open'].apply(event.component, []);
      });
    }
    if (callback['ui.dialog.close']) {
      EventHandler.one(dialog.getElement(), Dialog.EVENT.CLOSE, event => {
        callback['ui.dialog.close'].apply(event.component, []);
      });
    }
    if (callback['ui.dialog.opened']) {
      EventHandler.one(dialog.getElement(), Dialog.EVENT.OPENED, event => {
        callback['ui.dialog.opened'].apply(event.component, []);
      });
    }
    if (callback['ui.dialog.closed']) {
      EventHandler.one(dialog.getElement(), Dialog.EVENT.CLOSED, event => {
        setTimeout(() => {
          callback['ui.dialog.closed'].apply(event.component, []);
        }, 10);
      });
    }
  }
  dialog.open();
};

const Confirm = (message, callback = null) => {
  const dialog = new DialogWrapper({ message: message, dialog: 'confirm' });
  EventHandler.one(dialog.getElement(), Dialog.EVENT.OPEN, event => {
    const confirm = dialog.getElement().querySelector('[data-dialog-confirm]');
    if (confirm) {
      EventHandler.one(confirm, 'click', () => {
        if (callback) {
          callback.apply(event.component);
        }
      });
    }
  });
  dialog.open();
};

if (window.HitaiUI) {
  console.warn('');
  console.warn('   [ui.common.js] Overloading!');
  console.warn('');
  console.warn('   이 경고 문구는 [ui.common.js] 파일이 중복으로 로드되는 경우에 출력됩니다.');
  console.warn('   중복로드를 찾아 제거하세요.');
  console.warn('');
} else {
  document.addEventListener('DOMContentLoaded', () => {
    // Dialog Trigger
    EventHandler.on(document, 'click', event => {
      Dialog.trigger(event);
    });
    window.addEventListener('load', function winload(e) {
      EventHandler.trigger(window, 'resize');
      window.removeEventListener('load', winload);
    });
    window.addEventListener('resize', () => {
      commonInit.setViewportSize();
    });

    initialize();
    commonInit.uiFunc();
    EventHandler.trigger(document, 'UILoaded');
    console.log('UI Initialized!');
  });
}

const windowResize = () => {
  window.dispatchEvent(new window.Event('resize'));
};

window.HitaiUI = {
  initialize,
  Select,
  Accordion,
  PhoneCalculator,
  Tab,
  Dialog,
  ReplyWrite,
  Alert,
  Confirm,
  windowResize,
  SwiperA11y,
};
