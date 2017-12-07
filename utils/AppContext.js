"use strict";

import _ from "lodash";

const AppContext = (function () {

    /**
     * Detect Internet Explorer
     *
     * @return {boolean|integer} IE version
     * @private
     */
    function _isIE() {
        let ua, re, rv = -1;
        if (navigator.appName === 'Microsoft Internet Explorer') {
            ua = navigator.userAgent;
            re = new RegExp('MSIE ([0-9]{1,}[.0-9]{0,})');
            if (re.exec(ua) !== null) {
                rv = parseFloat(RegExp.$1);
            }
        } else if (navigator.appName === 'Netscape') {
            ua = navigator.userAgent;
            re = new RegExp('Trident/.*rv:([0-9]{1,}[.0-9]{0,})');
            if (re.exec(ua) !== null) {
                rv = parseFloat(RegExp.$1);
            }
        }

        return (rv === -1) ? false : rv;
    }

    /**
     * Detect if WebGL is supported
     *
     * @param return_context
     * @return {object|boolean}
     * @private
     */
    function _webgl_detect(return_context = false) {
        if (!!window.WebGLRenderingContext) {
            const canvas = document.createElement('canvas');
            const names = ['webgl', 'experimental-webgl', 'moz-webgl', 'webkit-3d'];
            let context = false;
            let i = 0;
            while (i < 4) {
                try {
                    context = canvas.getContext(names[i]);
                    if (context && typeof context.getParameter === 'function') {
                        return return_context ? {name: names[i], gl: context} : true;
                    }
                } catch (error) {
                    console.log(error);
                }
                i++;
            }
            return false;
        }
        return false;
    }

    /**
     * Detect visibilityChange events when the user switches windows
     * Adds classes to the <body> element
     *
     * http://stackoverflow.com/questions/1060008/is-there-a-way-to-detect-if-a-browser-window-is-not-currently-active#1060034
     */
    function bindWindowVisibilityChange() {
        let hidden = "hidden";

        // Standards:
        if (hidden in document) {
            document.addEventListener("visibilitychange", onchange);
        } else if ((hidden = "mozHidden") in document) {
            document.addEventListener("mozvisibilitychange", onchange);
        } else if ((hidden = "webkitHidden") in document) {
            document.addEventListener("webkitvisibilitychange", onchange);
        } else if ((hidden = "msHidden") in document) {
            document.addEventListener("msvisibilitychange", onchange);
        }

        // IE 9 and lower:
        else if ("onfocusin" in document) {
            document.onfocusin = document.onfocusout = onchange;
        }

        // All others:
        else {
            window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;
        }

        function onchange(evt) {
            const v = "visible", h = "hidden",
                evtMap = {
                    focus: v, focusin: v, pageshow: v, blur: h, focusout: h, pagehide: h
                };

            // clean up body classes before updating
            document.body.className = document.body.className.replace(/\s?win-[^\s]+/g, '').trim();

            evt = evt || window.event;
            if (evt.type in evtMap) {
                document.body.className += ` win-${evtMap[evt.type]}`;
                switch (evtMap[evt.type]) {
                    case 'visible' :
                        if (_.isFunction(AppContext.onWindowShow)) {
                            AppContext.onWindowShow();
                        }
                        break;
                    case 'hidden' :
                        if (_.isFunction(AppContext.onWindowHide)) {
                            AppContext.onWindowHide();
                        }
                        break;
                }
            } else {
                document.body.className += this[hidden] ? " win-hidden" : " win-visible";
                if (this[hidden]) {
                    if (_.isFunction(AppContext.onWindowHide)) {
                        AppContext.onWindowHide();
                    }
                } else {
                    if (_.isFunction(AppContext.onWindowShow)) {
                        AppContext.onWindowShow();
                    }
                }
            }

            if (this) console.log("> onChange", this[hidden] ? "hidden" : "visible");
        }

        // set the initial state (but only if browser supports the Page Visibility API)
        if (document[hidden] !== undefined) {
            onchange({type: document[hidden] ? "blur" : "focus"});
        }
    }

    function init(image_directory) {
        this.ieVersion = _isIE();
        this.isLowIE = this.ieVersion && this.ieVersion < 10;
        this.isIE = this.ieVersion !== false;
        this.isMobile = /iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(navigator.userAgent.toLowerCase());
        this.isTablet = /ipad|android|android 3.0|xoom|sch-i800|playbook|tablet|kindle/i.test(navigator.userAgent.toLowerCase());
        this.lowSpec = this.isMobile || this.isTablet || this.isLowIE;
        this.isSafari = /safari/i.test(navigator.userAgent.toLowerCase());
        this.isDesktop = !this.isMobile && !this.isTablet;
        this.supportWebGL = _webgl_detect();
        if (this.isIE) {
            document.body.className += ' ie';
        }
        if (this.lowSpec) {
            document.body.className += ' low-spec';
        }
        if (this.lowSpec || (this.ieVersion && this.ieVersion < 11)) {
            document.body.className += ' no-fullscreen';
        }

        this.isTouch = this.isMobile || this.isTablet;

        this.image_directory = image_directory || "assets/images/";
        this.image_directory += (this.isTablet ? "SD" : "HD") + "/";

        bindWindowVisibilityChange();
    }

    function imageDir(filename) {
        return this.image_directory + filename;
    }

    return {
        init: init,
        imageDir: imageDir
    };
})();

export {AppContext};
