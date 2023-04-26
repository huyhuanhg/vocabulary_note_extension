'use strict';

const script = document.createElement("script");
script.setAttribute("type", "module");
script.setAttribute("src", chrome.runtime.getURL("/assets/js/main.js"));
const head =
  document.head ||
  document.getElementsByTagName("head")[0] ||
  document.documentElement;
head.insertBefore(script, head.lastChild);
