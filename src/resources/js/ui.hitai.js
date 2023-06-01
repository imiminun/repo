import { qsAll } from './util/dom-util';
import EventHandler from './vendor/event-handler';

// 년월
$.datepicker.setDefaults({
  prevText: '이전달',
  nextText: '다음달',
  monthNamesShort: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
  dayNames: ['일', '월', '화', '수', '목', '금', '토'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
  dateFormat: 'yy.mm.dd',
  showMonthAfterYear: true,
  yearSuffix: '',
  showButtonPanel: false, // 이전달 다음달 옵션
  changeMonth: true,
  changeYear: true,
});

// switch
const a11ySwitch = () => {
  const ARIA_CHECKED = 'aria-checked';
  const elSwitch = document.querySelectorAll('.label--switch label input[type="checkbox"]');

  const _aria = (event, el) => {
    const checked = event.target.checked;
    el.setAttribute(`${ARIA_CHECKED}`, checked ? true : false);
  };

  elSwitch.forEach(item => {
    if (item) {
      const el = item.closest('label').querySelector('span');
      EventHandler.on(item, 'change', event => {
        _aria(event, el);
      });
    }
  });
};

// menu 펼침/닫기
window.foldMenuInit = () => {
  const openClass = 'open';
  const toggle = `data-toggle`;
  const closeTrigger = `data-menu-close`;
  const menuName = `[data-autoset="menu"]`;
  const menuContentName = `[data-menu="con"]`;

  const _initVarioble = () => {
    const menuElement = qsAll(document.body, menuName);
    return {
      menuElement,
    };
  };

  const menuElement = _initVarioble().menuElement;
  let _before = null;
  let _current = null;
  let _element = null;

  const _hasMenuCloseAttribute = element => {
    return element.dataset.menuClose !== undefined;
  };

  const _initEvent = () => {
    EventHandler.on(document, 'click.menu', event => {
      _element = event.target;
      const target = event.target.closest(menuName);
      const content = event.target.closest(menuContentName);

      // 현재값 셋팅
      _current = target;

      if (target) {
        // type은 default true로 셋팅
        const type = target.getAttribute(toggle) ? target.getAttribute(toggle) : 'true';
        // toggle을 사용안할 경우
        if (type === 'false') {
          _open(target);
          _setClose();
          const closeBtn = event.target.getAttribute(closeTrigger);
          if (closeBtn !== null) {
            _close(target);
          }
        }
        // toggle을 사용할 경우
        else {
          _toggle(target, content);
        }

        EventHandler.trigger(_element, 'foldMenu.item', {
          element: _element,
          currentTarget: _element.closest('button') || _element.closest('a'),
        });
      }

      // 이전값 셋팅
      _before = target;
    });
  };

  /**
   * 전체닫기
   */
  const _closeAll = () => {
    menuElement.forEach(element => {
      element.classList.remove(openClass);
    });

    _removeClose();
  };

  /**
   * 이벤트 삭제
   */
  const _removeClose = () => {
    EventHandler.off(window, 'click.menu');
  };

  /**
   * 셀렉터 이외 클릭시
   */
  const _setClose = () => {
    EventHandler.on(window, 'click.menu', event => {
      if (event.target.closest(menuName)) return;
      if (event.target.closest(menuContentName)) return;
      _closeAll();
    });
  };

  /**
   *
   * @param {*} target
   * @returns
   */
  const _open = target => {
    target.classList.add(openClass);

    // 현재값과 이전값이 같을때 처리하지 않음
    if (_before === _current) {
      return;
    } else {
      // 현재 값과 이전값이 같지 않고 이전값이 존재할때
      if (_before) {
        _before.classList.remove(openClass);
      }
    }
  };

  /**
   *
   * @param {*} target
   */
  const _close = target => {
    target.classList.remove(openClass);

    EventHandler.trigger(_element, 'foldMenu.close', {
      element: _element,
    });
  };

  /**
   *
   * @param {*} target
   */
  const _toggle = (target, content) => {
    if (target.classList.contains(openClass)) {
      if (content) {
        if (_hasMenuCloseAttribute(_element)) {
          _close(target);
        } else {
          return;
        }
      } else {
        _close(target);
      }
    } else {
      _open(target);
      _setClose();
    }
  };

  const init = () => {
    _initEvent();
  };

  return {
    init: init,
  };
};

// 비밀번호 숨기기/보이기
const passwordInput = () => {
  const btn = document.querySelectorAll('.input-wrap.input-wrap--password [data-toggle-btn]');
  if (!btn) return;

  const clickEvent = event => {
    const input = event.target.closest('.input-wrap').querySelector('.input');
    if (event.target.classList.contains('is-active')) {
      input.setAttribute('type', 'password');
      event.target.classList.remove('is-active');
    } else {
      input.setAttribute('type', 'text');
      event.target.classList.add('is-active');
    }
  };

  // deafult is-active가 입력되있을시에 type을 text로 변경
  const _setDefault = el => {
    if (el) {
      const input = el.closest('.input-wrap').querySelector('.input');
      if (el.classList.contains('is-active')) {
        input.setAttribute('type', 'text');
      } else {
        input.setAttribute('type', 'password');
      }
    }
  };

  btn.forEach(el => {
    _setDefault(el);
    EventHandler.on(el, 'click', clickEvent);
  });
};

// 뷰포트 vh 크기 설정
const setViewportSize = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// 툴팁
const tooltip = () => {
  const tooltipElements = document.querySelectorAll('[data-autoset="tooltip"]');
  if (!tooltipElements) return;

  /**
   * 전체닫기
   */
  const _closeAll = () => {
    tooltipElements.forEach(element => {
      element.classList.remove('is-active');
    });
  };

  tooltipElements.forEach(element => {
    const btn = element.querySelector('.tooltip__btn');
    const closeBtn = element.querySelector('.tooltip__close');
    EventHandler.on(btn, 'click', () => {
      _closeAll();
      element.classList.add('is-active');
    });
    EventHandler.on(closeBtn, 'click', () => {
      element.classList.remove('is-active');
    });
  });
};

// 메인 헤더 고정 스타일 변경
const headerSticky = () => {
  const header = document.querySelector('#header');
  const tabSticky = document.querySelector('[data-tab-sticky]');
  if (!header || tabSticky) return;
  const scrollEvent = () => {
    const scollTop = window.pageYOffset;
    if (scollTop > 20) {
      header.classList.add('is-active');
    } else {
      header.classList.remove('is-active');
    }
  };
  EventHandler.on(window, 'scroll', scrollEvent);
  return () => window.removeEventListener('scroll', scrollEvent);
};

/**
 * 초기화를 사용하지 않을 함수 모음
 */
const uiFunc = () => {
  passwordInput();
  a11ySwitch();
  tooltip();
  window.foldMenuInit().init();
  headerSticky();
};

/**
 * 초기화를 사용할 함수 모음
 */
const uiInitialize = () => {};

const commonInit = {
  uiFunc,
  uiInitialize,
  setViewportSize,
};

export default commonInit;
