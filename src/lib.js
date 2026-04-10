/**
 * Equivalent to the document.querySelector() method
 * @param {string} selector
 * @returns {HTMLElement | null}
 */
function $(selector) {
    return document.querySelector(selector);
}

/**
 * Replace certain HTML characters of a given string with HTML-entities.
 * @param {string} text
 * @returns {string}
 */
function x(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

function serialize(number) {
    return Math.max(Math.abs(number), 1);
}

function lerp(from, to, weight) {
    return from + weight * (to - from);
}

function hide(element) {
    element.style.visibility = 'hidden';
}

function show(element) {
    element.style.visibility = 'visible';
}

/**
 * Get a whole number from given range defined by min and max.
 * @param {number} min - Start of the range
 * @param {number} max - End of the range
 * @returns {number}
 */
function getNumberFromRange(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}
