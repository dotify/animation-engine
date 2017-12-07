/**
 * TODO Refactor all uses as regular setTimeout
 *
 * @param ms
 * @param fn
 * @return {number}
 */
window.delay = (ms, fn) => setTimeout(fn, ms);

// /**
//  * TODO use ES6 imports to rename and use the helper
//  * @param key
//  * @return {string|*|XML|void}
//  * @private
//  */
// window.__ = function (key) {
//     let trans = Translation.getInstance();
//     trans.setSource(window.translations);
//     return trans.translation(key).replace(/&nbsp;/, ' ');
// };

// /**
//  * TODO move events to a proper file
//  * @type {Number}
//  */
// let resizeBuffer = 0;
// $(window).resize(() => {
//     clearTimeout(resizeBuffer);
//     resizeBuffer = setTimeout(() => {
//         $(window).trigger('resize-buffered')
//     }, 100);
// });
//
// $(window).load(function () {
//     $(window).trigger('resize');
// });


/**
 * Wrapper for func.apply()
 * Missing scopes are replaced by window
 *
 * @param scope
 * @param func
 * @return {*}
 */
const delegate = (scope, func) => {
    if (null === scope || 'undefined' === typeof scope) {
        scope = window;
    }

    if (null === func || 'undefined' === typeof func) {
        return;
    }

    return func.apply(scope, arguments);
};

export {delegate};
