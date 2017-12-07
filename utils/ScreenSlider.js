const ScreenSlider = (function () {
    function ScreenSlider(screens) {
        this.screens = screens;
        this.currentIndex = -1;
        this.currentScreen = null;
    }


    /*
     go to slide index
     @param (number) slide to move to
     @param (boolean) force next slide to be current
     @return (number) new current index
     */

    ScreenSlider.prototype.go = function (index) {
        index = index % this.screens.length;
        if (index < 0) {
            index = this.screens.length + index;
        }
        if (index === this.currentIndex) {
            return;
        }
        if (this.currentIndex === -1) {
            this.currentIndex = index;
        }
        this._setPropsToSelection({
            top: '-100%'
        }, 0, index - 1, this.currentIndex);
        this._setPropsToSelection({
            top: '100%'
        }, index + 1, null, this.currentIndex);
        if (index > this.currentIndex) {
            this.animTo(this.currentIndex, {
                top: '-100%'
            });
        } else {
            this.animTo(this.currentIndex, {
                top: '100%'
            });
        }
        this.animTo(index, {
            top: '0%'
        });
        return this.currentIndex = index;
    };


    /*
     get or set the currentIndex
     @param (number) index or nada
     @return (number) current index
     */

    ScreenSlider.prototype.current = function (index) {
        if (index == null) {
            index = null;
        }
        if (index != null) {
            index = parseInt(index);
            if (index >= 0 && index < this.screens.length) {
                return this.currentIndex = index;
            }
            return false;
        } else {
            return this.currentIndex;
        }
    };


    /*
     TweenMax to animation
     */

    ScreenSlider.prototype.animTo = function (index, props, duration) {
        if (duration == null) {
            duration = .5;
        }
        return TweenMax.to(this.screens[index].dom[0], duration, props);
    };


    /*
     set properties to current layer
     */

    ScreenSlider.prototype.setCurrent = function (props) {
        return this._setPropsToSelection(props, this.currentIndex, this.currentIndex);
    };


    /*
     set properties to all layers
     */

    ScreenSlider.prototype.setAll = function (props) {
        return this._setPropsToSelection(props);
    };


    /*
     set properties to previous layers
     */

    ScreenSlider.prototype.setPrevious = function (props) {
        return this._setPropsToSelection(props, 0, this.currentIndex - 1);
    };


    /*
     set properties to next layers
     */

    ScreenSlider.prototype.setNext = function (props) {
        return this._setPropsToSelection(props, this.currentIndex + 1);
    };


    /*
     set properties a defined set of entries
     */

    ScreenSlider.prototype._setPropsToSelection = function (props, start, end, exclude) {
        var i, j, len, ref, results, screen;
        if (start == null) {
            start = 0;
        }
        if (end == null) {
            end = null;
        }
        if (exclude == null) {
            exclude = null;
        }
        ref = this.screens;
        results = [];
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
            screen = ref[i];
            i = parseInt(i);
            if (i < start) {
                continue;
            }
            if ((end != null) && i > end) {
                continue;
            }
            if (i === exclude) {
                continue;
            }
            results.push(TweenMax.set(screen.dom[0], props));
        }
        return results;
    };


    /*
     get the slide index
     @param (string) screen name
     @return (number|boolean) index or false
     */

    ScreenSlider.prototype.getIndex = function (name) {
        var i, j, len, ref, screen;
        ref = this.screens;
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
            screen = ref[i];
            if (screen.name === name) {
                return parseInt(i);
            }
        }
        return false;
    };


    /*
     get slide by index or name
     @param (number|string)
     @return (Screen|boolean) found screen or false
     */

    ScreenSlider.prototype.getSlide = function (key) {
        var j, len, ref, screen;
        if ('number' === typeof key) {
            return this.screens[key];
        }
        ref = this.screens;
        for (j = 0, len = ref.length; j < len; j++) {
            screen = ref[j];
            if (screen.name === key) {
                return screen;
            }
        }
        return false;
    };


    /*
     add a screen to the list
     @param (Screen)
     @return (array) list of registered screens
     */

    ScreenSlider.prototype.addScreen = function (screen) {
        this.screens.push(screen);
        return this.screens;
    };

    return ScreenSlider;

})();

export {ScreenSlider};
