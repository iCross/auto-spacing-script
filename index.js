// ==UserScript==
// @name         Auto add space between CJK and English
// @namespace    pangu-userscript
// @version      1.2.0
// @license      MIT
// @description  Automatically add spaces between CJK (Chinese, Japanese, and Korean) characters and English letters, taking into account situations like code blocks and dynamic DOM updates.
// @match        http*://*/*
// @grant        none
// @homepageURL  https://github.com/iCross/auto-spacing-script
// @doownloadURL https://raw.github.comusercontent/iCross/auto-spacing-script/main/index.js
// @exclude      https://jsfiddle.net/*
// @require      https://unpkg.com/pangu@4.0.7/dist/browser/pangu.min.js
// @require      https://cdn.jsdelivr.net/npm/@violentmonkey/shortcut@1
// ==/UserScript==
(function () {
  "use strict";
  const { register } = VM.shortcut;

  register("c-e", () => {
    // Run once when the script is loaded
    addSpacing();
    console.log("You just pressed Shortcut in violetmonkey.");
  });

  function addSpacing() {
    const elements = document.querySelectorAll(
      'body *:not(script):not(style):not(noscript):not(pre):not(code):not(input):not([contenteditable="true"]'
    );
    elements.forEach((element) => {
      if (
        element.childNodes.length === 1 &&
        element.childNodes[0].nodeType === Node.TEXT_NODE
      ) {
        const originalText = element.textContent;
        const newText = pangu.spacing(originalText);
        if (originalText !== newText) {
          element.textContent = newText;
        }
      }
    });
  }

  function observeDOM(observer) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function debounce(func, wait, immediate) {
    let timeout;
    return function () {
      const context = this,
        args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  const addSpacingDebounced = debounce(addSpacing, 300);

  // Run every time the content of the page is changed
  const observer = new MutationObserver(() => {
    requestAnimationFrame(() => {
      addSpacingDebounced();
    });
  });

  // Start observing when the DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      observeDOM(observer);
    });
  } else {
    observeDOM(observer);
  }
})();
