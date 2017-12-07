const PageLoader = (function () {
    var __instance;

    function PageLoader() {
    }

    __instance = null;

    PageLoader.getInstance = function () {
        if (this.__instance == null) {
            this.__instance = new this;
        }
        return this.__instance;
    };

    PageLoader.prototype.init = function (chapter) {
        this.chapter = chapter;
        this.user = UserSimple.getInstance();
        this.build();
        return this.fillContent();
    };

    PageLoader.prototype.build = function () {
        $('body').append(['<div class="page-loader">', '<div class="page-loader-map">', '<div class="page-loader-progress">', '<canvas width="100" height="100"></canvas>', '<img src="assets/images/avatars/avatar-1.png" width="74" height="74" class="page-loader-avatar">', '</div>', '<div class="page-loader-content center-vertical">', '<div class="centered">', '<p class="text-center page-loader-loading"></p>', '<p class="text-center page-loader-message"></p>', '</div></div></div></div>'].join(''));
        return this.dom = $('.page-loader');
    };

    PageLoader.prototype.fillContent = function () {
        let mapIndex = this.chapter + 1;
        $('.page-loader-map').css('background-image', "url('assets/images/loading/" + lang + "/map-" + mapIndex + ".png')");
        $('.page-loader-loading').html('Chargement...');
        // $('.page-loader-message').html('');
    };

    PageLoader.prototype.show = function () {
        return this.dom.addClass('in');
    };

    PageLoader.prototype.hide = function () {
        return this.dom.removeClass('in');
    };

    PageLoader.prototype.destroy = function () {
        return this.dom.remove();
    };

    return PageLoader;

})();

export {PageLoader};
