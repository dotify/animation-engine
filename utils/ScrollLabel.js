// Generated by CoffeeScript 1.12.4
const ScrollLabel = (function () {
    ScrollLabel.init = function () {
        this.stack = [];
        return $(window).on('resize-buffered', (function (_this) {
            return function () {
                return _this.refreshScrollPos();
            };
        })(this));
    };


    /*
     return the scroll position
     @param (number)
     */

    ScrollLabel._getScrollPos = function (pos) {
        if (pos == null) {
            pos = null;
        }
        if (pos != null) {
            return pos;
        }
        return window.scrollY;
    };

    ScrollLabel.refreshScrollPos = function () {
        var i, label, len, ref, results;
        ref = this.stack;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
            label = ref[i];
            results.push(label._refreshScrollPos());
        }
        return results;
    };

    ScrollLabel.getLabelBefore = function (pos) {
        var i, ind, label, len, ref;
        if (pos == null) {
            pos = null;
        }
        pos = this._getScrollPos(pos);
        ref = this.stack;
        for (ind = i = 0, len = ref.length; i < len; ind = ++i) {
            label = ref[ind];
            if (label.absolutePos > pos) {
                if (ind) {
                    return this.stack[ind - 1];
                } else {
                    return null;
                }
            }
        }
        return null;
    };

    ScrollLabel.getLabelCurrent = function (pos) {
        var i, ind, label, len, ref;
        if (pos == null) {
            pos = null;
        }
        pos = this._getScrollPos(pos);
        ref = this.stack;
        for (ind = i = 0, len = ref.length; i < len; ind = ++i) {
            label = ref[ind];
            if (label.absolutePos >= pos) {
                if (ind != null) {
                    return this.stack[ind];
                } else {
                    return null;
                }
            }
        }
        return null;
    };

    ScrollLabel.getLabelAfter = function (pos) {
        var i, ind, label, len, ref;
        if (pos == null) {
            pos = null;
        }
        pos = this._getScrollPos(pos);
        ref = this.stack;
        for (ind = i = 0, len = ref.length; i < len; ind = ++i) {
            label = ref[ind];
            if (label.absolutePos > pos) {
                return label;
            }
        }
        return null;
    };

    ScrollLabel.getLabelFromName = function (name) {
        var i, label, len, ref;
        ref = ScrollLabel.stack;
        for (i = 0, len = ref.length; i < len; i++) {
            label = ref[i];
            if (label.name === name) {
                return label;
            }
        }
        return null;
    };

    function ScrollLabel(name, scene, pos) {
        if (ScrollLabel.getLabelFromName(name)) {
            return;
        }
        this.name = name;
        this.scene = scene;
        this.pos = pos;
        this.dom = scene.dom;
        if (this.dom.parent().hasClass("scrollmagic-pin-spacer")) {
            this.dom = this.dom.parent();
        }
        ScrollLabel.stack.push(this);
        this._refreshScrollPos();
    }

    ScrollLabel.prototype._refreshScrollPos = function () {
        return this.absolutePos = Math.floor(this.dom.offset().top + this.dom.outerHeight() * this.pos) - this.dom.height();
    };

    ScrollLabel.prototype.scrollPos = function () {
        if (this.absolutePos == null) {
            this._refreshScrollPos();
        }
        return this.absolutePos;
    };

    return ScrollLabel;

})();

export {ScrollLabel};
