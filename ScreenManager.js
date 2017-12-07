const ScreenManager = {

    /*
     * init au démarrage de l'application
     * @param {object} déclaration des alias doit être fourni ex {myAlias:MyScreen}
     * @param {function} callback lorsque tout les factory sont initialisé
     * @return {void}
     */
    init: function (screensType, onScreenInit) {
        var alias, cl, onInit, ref, screensToLoad, screensToLoadLength;
        this.screensType = screensType;
        this.screens = [];
        screensToLoad = [];
        ref = this.screensType;
        for (alias in ref) {
            cl = ref[alias];
            if ((cl.init != null)) {
                screensToLoad.push(cl);
            }
        }
        screensToLoadLength = screensToLoad.length;
        onInit = (function (_this) {
            return function () {
                screensToLoadLength--;
                return _this._initScreen();
            };
        })(this);
        if (screensToLoadLength) {
            this._initScreen = (function (_this) {
                return function () {
                    var ind;
                    ind = screensToLoad.length - screensToLoadLength;
                    if (ind < screensToLoad.length) {
                        return screensToLoad[ind].init(onInit);
                    } else {
                        return onScreenInit();
                    }
                };
            })(this);
            return this._initScreen();
        } else {
            return onScreenInit();
        }
    },

    /*
     * créé tous les screen de la scène
     * @param {Scene} scene dans lequel on veut créer les screen
     * @return {array} liste des écrans généré
     */
    createScreenOfScene: function (scene) {
        var dom, screens;
        dom = scene.dom;
        screens = [];
        $("*[data-screen]", dom).each((function (_this) {
            return function (ind, element) {
                var $element, screen, screenType;
                $element = $(element);
                $element.css("z-index", ind * 10 + 10);
                screenType = $element.data("screen");
                if (_this.screensType[screenType] == null) {
                    throw "Error screen with type alias " + screenType + " is not available";
                } else {
                    screen = _this.screensType[screenType].create($element, scene, screenType);
                    screens.push(screen);
                    return _this.screens.push(screen);
                }
            };
        })(this));
        return screens;
    }
};

export {ScreenManager};
