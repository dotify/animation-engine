"use strict";

import _ from "lodash"
import {ScrollIcon} from "./ScrollIcon"
import {SceneManager} from "../SceneManager"

const ScrollHelper = (function () {
    // @formatter:off
    function ScrollHelper() {}
    // @formatter:on

    _.assign(ScrollHelper, {
        locked: false,
        scrollTimingFunction: Power0.easeNone,
        scrollForward: true,
        init() {
            document.onmousewheel = function (e) {
                ScrollHelper.scrollForward = e.wheelDelta < 0;
            };

            // Mouse scroll handling
            let body = document.getElementsByClassName('body')[0];
            body.addEventListener("mousewheel", SceneManager.mouseWheelHandler, false);
            body.addEventListener("DOMMouseScroll", SceneManager.mouseWheelHandler, false);
            body.addEventListener("onmousewheel", SceneManager.mouseWheelHandler);
        },

        /**
         * Lock animation scrolling
         * @param {boolean} withScrollIcon
         */
        lock(withScrollIcon = true) {
            const x = window.scrollX;
            const y = window.scrollY;

            ScrollHelper.locked = true;
            if (withScrollIcon) ScrollIcon.lock();

            document.ontouchmove = function (e) {
                return false;
            };

            window.onscroll = function () {
                window.scrollTo(x, y);
            };
        },

        /**
         * Unlock animation scrolling
         * @param {boolean} withScrollIcon
         */
        unlock(withScrollIcon = true) {
            ScrollHelper.locked = false;
            if (withScrollIcon) ScrollIcon.unlock();
            document.ontouchmove = null;
        }
    });

    return ScrollHelper;

})();

export {ScrollHelper};
