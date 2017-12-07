const FullscreenAPI = (function () {
    function FullscreenAPI() {
    }

    FullscreenAPI.init = function () {
        this.exitBtn = $('<div class="fs-exit"><a href="#" class="fs-close icon icon_fullscreen-exit"></a></div>').prependTo('.body');
        this.exitBtn.on('click', function (e) {
            e.preventDefault();
            return FullscreenAPI.exit();
        });
        return $(document).on('fullscreenchange fullscreenChange webkitfullscreenchange onwebkitfullscreenchange mozfullscreenchange MSFullscreenChange', function () {
            if (!FullscreenAPI.isActive()) {
                return FullscreenAPI.exitBtn.removeClass('active');
            } else {
                return FullscreenAPI.exitBtn.addClass('active');
            }
        });
    };

    FullscreenAPI.request = function (element) {
        if (element == null) {
            element = null;
        }
        if (element == null) {
            element = $('body').get(0);
        }
        if (element instanceof jQuery) {
            this.element = element.get(0);
        } else {
            this.element = element;
        }
        if (this.element.requestFullscreen) {
            this.element.requestFullscreen();
        } else if (this.element.msRequestFullscreen) {
            this.element.msRequestFullscreen();
        } else if (this.element.mozRequestFullScreen) {
            this.element.mozRequestFullScreen();
        } else if (this.element.webkitRequestFullscreen) {
            this.element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        if (window.AppContext.isSafari) {
            return $(document).trigger('fullscreenChange');
        }
    };

    FullscreenAPI.exit = function () {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        if (window.AppContext.isSafari) {
            return $(document).trigger('fullscreenChange');
        }
    };

    FullscreenAPI.toggle = function () {
        if (FullscreenAPI.isActive()) {
            return FullscreenAPI.exit();
        } else {
            return FullscreenAPI.request();
        }
    };

    FullscreenAPI.isActive = function () {
        if (document.fullscreen != null) {
            return document.fullscreen;
        } else if (document.webkitIsFullScreen != null) {
            return document.webkitIsFullScreen;
        } else if (document.mozFullScreenElement !== void 0) {
            return document.mozFullScreenElement !== null;
        } else if (document.webkitFullScreenElement !== void 0) {
            return document.webkitFullScreenElement !== null;
        } else if (document.msFullscreenElement !== void 0) {
            return document.msFullscreenElement !== null;
        } else if (document.fullscreenElement !== void 0) {
            return document.fullscreenElement !== null;
        }
    };

    FullscreenAPI.isSupported = function () {
        if (document.fullscreenEnabled != null) {
            return document.fullscreenEnabled;
        } else if (document.mozFullScreenEnabled != null) {
            return document.mozFullScreenEnabled;
        } else if (document.webkitFullScreenEnabled != null) {
            return document.webkitFullScreenEnabled;
        } else if (document.webkitFullscreenEnabled != null) {
            return document.webkitFullscreenEnabled;
        } else if (document.msFullscreenEnabled != null) {
            return document.msFullscreenEnabled;
        } else if (document.fullscreenEnabled != null) {
            return document.fullscreenEnabled;
        }
    };

    return FullscreenAPI;

})();

export {FullscreenAPI};
