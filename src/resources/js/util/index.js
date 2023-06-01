import { confineTab } from "./a11y";
import { expandHelper, toggleHelper } from "./data-helper";
import { toHTML, getSelectorName, getIndex, isVisible, isDisabled, getElement, focusableElements } from "./dom-util";
import { userAgent, isIe, isMobile, isIphone } from "./env";
import { randomIntRange, randomSort } from "./math-util";
import { isEmptyObject } from "./object-util";
import { getRandomID } from "./string-util";

const ally = {
  confineTab,
};

const helper = {
  expand: expandHelper,
  toggle: toggleHelper,
};

const dom = {
  toHTML,
  getSelectorName,
  getIndex,
  isVisible,
  isDisabled,
  getElement,
  focusableElements,
};

const env = {
  userAgent,
  isIe,
  isMobile,
  isIphone,
};

const math = {
  randomIntRange,
  randomSort,
};

const obj = {
  isEmptyObject,
};

const str = {
  getRandomID,
};

export { ally, helper, dom, env, math, obj, str };
