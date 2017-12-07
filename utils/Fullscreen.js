const Fullscreen = (function () {
    function Fullscreen(element) {
        this.element = element;
        this.impacts = $('.fs-impact');
        this.setTarget();
        this.bindClose();
    }

    Fullscreen.init = function () {
        return $('.fullscreen').each(function (i, el) {
            return new Fullscreen($(el));
        });
    };

    Fullscreen.prototype.setTarget = function () {
        var ref;
        if ((ref = this.element.data('target')) != null ? ref.length : void 0) {
            return $(this.element.data('target')).on('click', (function (_this) {
                return function (e) {
                    e.preventDefault();
                    _this.element.addClass('fs-active');
                    _this.impacts.addClass('fs-active');
                    return _this.element.trigger('fullscreen.open');
                };
            })(this));
        }
    };

    Fullscreen.prototype.bindClose = function () {
        return this.element.on('click', '.close', (function (_this) {
            return function (e) {
                e.preventDefault();
                _this.element.removeClass('fs-active');
                _this.impacts.removeClass('fs-active');
                return _this.element.trigger('fullscreen.close');
            };
        })(this));
    };

    return Fullscreen;

})();

export {Fullscreen};
