// ==UserScript==
// @name         Auto add space between CJK and English
// @namespace    pangu-userscript
// @version      1.2.4
// @license      MIT
// @description  Automatically add spaces between CJK (Chinese, Japanese, and Korean) characters and English letters, taking into account situations like code blocks and dynamic DOM updates.
// @match        http*://*/*
// @grant        none
// @homepageURL  https://github.com/iCross/auto-spacing-script
// @doownloadURL https://raw.githubusercontent.com/iCross/auto-spacing-script/main/index.js
// @exclude      https://jsfiddle.net/*
// @exclude      https://www.notion.so/*
// @require      https://unpkg.com/pangu@4.0.7/dist/browser/pangu.min.js
// @require      https://cdn.jsdelivr.net/npm/@violentmonkey/shortcut@1
// @grant        GM_getValue
// @grant        GM_setValue

// ==/UserScript==

const ignores = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'PRE', 'CODE', 'INPUT']

const isIgnore = name => ignores.includes(name)
const isEditable = el => el.getAttribute('contenteditable')?.toLowerCase() === 'true'
const isMonaco = el => el.getAttribute('class')?.includes("monaco-editor")

function acceptNode(node) {
    const isAccept = isIgnore(node.tagName) || isEditable(node) || isMonaco(node)
    return isAccept ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
}

/**
 * Adds spacing between CJK and English characters
 */
function spacingFunction() {
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_ELEMENT,
        { acceptNode },
        false
    )

    const elements = []

    while (walker.nextNode()) {
        elements.push(walker.currentNode)
    }
    Array.from(elements).forEach((element) => {
        // Only space text nodes
        if (
            element.childNodes.length === 1 &&
            element.childNodes[0].nodeType === Node.TEXT_NODE
        ) {
            const originalText = element.textContent
            const newText = pangu.spacing(originalText)
            if (originalText !== newText) {
                element.textContent = newText;
            }
        }
    });
}

/**
 * Start observing the DOM for changes
 */
function observeDOM(observer) {
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

/**
 * Debounce utility function
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
}

const spacingFunctionDebounced = debounce(spacingFunction, 300);

// Run once when the script is loaded
//spacingFunction();

// Observe DOM changes
const observer = new MutationObserver(() => {
    requestAnimationFrame(() => {
        spacingFunctionDebounced();
    });
});



(function() {
    "use strict";


    function executeMainAction() {
        spacingFunction();
        console.log("You just pressed Shortcut in violetmonkey.");
        // Start observing
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => {
                observeDOM(observer);
            });
        } else {
            observeDOM(observer);
        }
    }


    // Register a keyboard shortcut (a-e) using Violentmonkey's
    const { register } = VM.shortcut;
    register("a-keye", executeMainAction);

    const autoExecuteUrlsinREGEX = GM_getValue("autoExecuteUrlsinREGEX", []);
    const vanillaPanguUrls = GM_getValue("vanillaPanguUrls", []);

    for (let regex of vanillaPanguUrls) {
        console.debug("Current vanilla REGEX：", regex);

        if (new RegExp(regex).test(window.location.href)) {
            console.debug("Matched url: ", regex);

            pangu.autoSpacingPage();
            return;
        }
    }
    for (let regex of autoExecuteUrlsinREGEX) {
        console.debug("Current REGEX：", regex);
        if (new RegExp(regex).test(window.location.href)) {
            console.debug("Matched url: ", regex);
            executeMainAction();
            return;
        }
    }

})();






