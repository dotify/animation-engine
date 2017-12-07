const URL = (function () {
    function URL() {
    }


    /*
     get the basename without args
     */

    URL.getBasenameClean = function () {
        var url;
        url = window.location.basename;
        url = URL.stripQuestionMark(url);
        return url;
    };


    /*
     remove args after ?
     */

    URL.stripQuestionMark = function (url) {
        var markPosition;
        markPosition = url.indexOf('?');
        if (-1 === markPosition) {
            return url;
        }
        return url.substr(0, markPosition);
    };

    return URL;

})();

export {URL};
