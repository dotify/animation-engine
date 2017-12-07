"use strict";

import _ from "lodash"
import {SceneManager} from "../SceneManager"

const ScrollIcon = (function () {
    let __instance;

    // @formatter:off
    function ScrollIcon() {}
    // @formatter:on

    __instance = null;

    _.assign(ScrollIcon, {
        // scrolling: false,
        // keep the icon visible even when scrolling
        keep: true,

        // is the icon shown?
        shown: false,

        // the icon is locked away. not visible at all
        locked: false,

        // should the label be cleared on click?
        ephemeral: false,

        getInstance() {
            if (!this.__instance) {
                this.__instance = new this;
                this.__instance.dom = $('#' + this.id);
            }
            return this.__instance;
        },
        init() {
            let scrollIcon = ScrollIcon.getInstance(),
                icon = $('#scroll-icon'),
                label = $('#scroll-icon-label');

            // create the nodes if they're missing
            scrollIcon.dom = icon.length ? icon : $("<div id=\"scroll-icon\"></div>").prependTo('.body');
            scrollIcon.txt = label.length ? label : $("<div id=\"scroll-icon-label\"></div>").prependTo('.body');

            // bind clicks
            scrollIcon.dom.on('click', ScrollIcon.onClick);
            scrollIcon.txt.on('click', ScrollIcon.onClick);
        },
        onClick(event) {
            if (event) event.stopPropagation();
            SceneManager.skip();
            return false;
        },
        lock() {
            ScrollIcon.locked = true;
            ScrollIcon.hide();
        },
        unlock() {
            ScrollIcon.locked = false;
            ScrollIcon.show();
        },
        show() {
            ScrollIcon.getInstance().show();
        },
        hide() {
            ScrollIcon.getInstance().hide();
        },
        setLabel(label, ephemeral) {
            if (ephemeral === null) {
                ephemeral = false;
            }
            ScrollIcon.getInstance().setLabel(label, ephemeral);
        },
        resetLabel() {
            ScrollIcon.getInstance().resetLabel();
        },
    });

    _.assign(ScrollIcon.prototype, {
        setLabel(label, ephemeral) {
            ephemeral = !!ephemeral;
            this.txt.html(label);
            ScrollIcon.ephemeral = ephemeral;
        },

        resetLabel() {
            this.txt.html('');
            ScrollIcon.ephemeral = false;
        },

        show() {
            if (!ScrollIcon.locked) {
                this.dom.addClass('in');
                this.txt.addClass('in');
                ScrollIcon.shown = true;
            }
        },

        hide() {
            this.dom.removeClass('in');
            this.txt.removeClass('in');
            ScrollIcon.shown = false;
        },
    });

    return ScrollIcon;

})();

export {ScrollIcon};
