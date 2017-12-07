"use strict";

import _ from "lodash"
import {AppContext} from "./utils/AppContext"
import {AssetLoader} from "./AssetLoader"
import {ScrollIcon} from "./utils/ScrollIcon"
import {StepLabel} from "./StepLabel"
import {ScrollHelper} from "./utils/ScrollHelper"
import {SoundManager} from "./utils/SoundManager"
import {SoundLayer} from "./utils/SoundLayer"

let SceneManager = (function () {
    let __instance,
        mainTimeline,
        stepLabels = [],
        direction = 1,
        // lastIndex = 0,
        labelIndex = 0,
        scenesType,
        scenes = [],
        newScenes = [],
        scenesToLoad = [],
        scenesToLoadLength = 0,
        isPlaying,
        stepsLeft,
        currentStepLabel,
        _sTime,
        _noInertial,
        _lastScrollTime,
        windowHideState = {};

    function SceneManager() {
        // constructor - keep me
    }

    function __getInstance() {
        if (!__instance) {
            __instance = new SceneManager;
        }

        return __instance;
    }

    function init(_scenesType, onSceneInit) {
        // create a Timeline
        mainTimeline = new TimelineMax({
            onComplete() {
                pause();
                labelIndex = stepLabels.length;
            },
            onReverseComplete() {
                pause();
                labelIndex = 0;
            }
        });

        mainTimeline.stop();
        scenesType = _scenesType;

        for (let alias in scenesType) {
            if (scenesType.hasOwnProperty(alias)) {
                if (scenesType[alias] && scenesType[alias].init) {
                    scenesToLoad.push(scenesType[alias]);
                }
            }
        }

        scenesToLoadLength = scenesToLoad.length;

        if (scenesToLoadLength) {
            let _initScene = function _initScene() {
                let ind = scenesToLoad.length - scenesToLoadLength;
                if (ind < scenesToLoad.length) {
                    return scenesToLoad[ind].init(() => {
                        scenesToLoadLength--;
                        _initScene();
                    });
                } else {
                    // TODO replace with a resolve
                    return onSceneInit();
                }
            };
            _initScene();

        } else {
            // TODO replace with a resolve
            onSceneInit();
        }

        // Configure WindowShow and WindowHide callbacks
        if (_.isObject(AppContext)) {
            AppContext.onWindowHide = function () {
                // store previous state
                windowHideState = {
                    scenePlaying: isPlaying,
                    soundPlaying: !SoundManager.isMuted()
                };

                pause();
                SoundManager.mute();
            };

            AppContext.onWindowShow = function () {
                if (windowHideState.scenePlaying) {
                    play();
                }
                if (windowHideState.soundPlaying) {
                    SoundManager.unmute();
                }
            };
        }
    }

    function play(steps = 1) {
        if (!ScrollHelper.locked) {
            stepsLeft = steps;
            mainTimeline.timeScale(1);

            if (labelIndex < stepLabels.length) {
                mainTimeline.play();
                $(document).trigger("sceneplay");

                setTimeout(function () {
                    mainTimeline.play();
                    direction = 1;
                    isPlaying = true;
                    labelIndex += steps;
                    ScrollIcon.hide();
                }, 100);
            }
        }
    }

    function reverse(steps = 1) {
        if (!ScrollHelper.locked) {
            stepsLeft = steps;

            if (labelIndex > 0) {
                mainTimeline.timeScale(2);
                mainTimeline.reverse();
                $(document).trigger("scenereverse");

                setTimeout(function () {
                    mainTimeline.reverse();
                    direction = -1;
                    isPlaying = true;
                    labelIndex -= steps;
                    ScrollIcon.hide();
                }, 100);
            }
        }
    }

    function pause() {
        direction = 0;
        isPlaying = false;
        mainTimeline.stop();
    }

    function skip() {
        if (currentStepLabel.skipBt) {
            currentStepLabel.block = false;
            play();
        }
    }

    function lockScroll() {
        currentStepLabel = currentStepLabel || {};
        currentStepLabel.block = true;
        currentStepLabel.skipBt = false;
        ScrollHelper.lock();
    }

    function unlockScroll(autoplay) {
        autoplay = !!autoplay;
        currentStepLabel = currentStepLabel || {};
        currentStepLabel.block = false;
        currentStepLabel.skipBt = true;
        ScrollHelper.unlock();
        if (autoplay) {
            play();
        }
    }

    function addStepLabel(timeline, name, options, position) {
        let label = new StepLabel(timeline, name, options, position);

        stepLabels.push(label);

        let self = this;
        timeline.addCallback(function () {
            return self.labelCallback(label);
        }, position);

        timeline.addLabel("step_" + name, position);

        if (!currentStepLabel) {
            currentStepLabel = label;
        }

        return currentStepLabel;
    }

    function labelCallback(label) {
        currentStepLabel = label;
        labelIndex = stepLabels.indexOf(currentStepLabel);

        if (label.block) {
            ScrollIcon.lock();
        }

        if (label.skipBt) {
            ScrollIcon.show();
        }

        stepsLeft--;

        if (stepsLeft <= 0) {
            pause();
        }
    }

    function createSceneOfDom(dom) {
        newScenes = [];
        $("*[data-scene]", dom).each(function (ind, element) {
            let $element = $(element);
            let sceneType = $element.data("scene");
            if (!scenesType[sceneType]) {
                throw `Error scene with type alias ${sceneType} is not available`;
            } else {
                let scene = scenesType[sceneType].create($element, sceneType);
                scene.mainWrapper = dom;
                newScenes.push(scene);
                if (!scenes.length) {
                    scene.dom.parent('.page').addClass('active');
                }
                scenes.push(scene);
            }
        });
    }

    function createSceneTransition(scene1, scene2, duration = 1.5) {
        let transition = new TimelineMax({
            onStart: function () {
                scene1.dom.css("display", "block");
                scene2.dom.css("display", "block");
            },
            onUpdate: function () {
                scene1.dom.css("display", "block");
                scene2.dom.css("display", "block");
            },
            onComplete: function () {
                SoundLayer.stopAll();
                transition.started = false;
                scene1.dom.css("display", "none");
                scene1.dom.removeClass('current');
                scene2.dom.addClass('current');

                // update hud
                if (window.hudUpdate) window.hudUpdate(scene2);

                // load N+1 and unload N-1
                if (scene2.dom.next().length) AssetLoader.loadAssets(scene2.dom.next(), false);
                if (scene1.dom.prev().length) AssetLoader.unloadAssets(scene1.dom.prev());
            },
            onReverseComplete: function () {
                SoundLayer.stopAll();
                transition.started = false;
                scene2.dom.css("display", "none");
                scene1.dom.addClass('current');
                scene2.dom.removeClass('current');

                // update hud
                if (window.hudUpdate) window.hudUpdate(scene1);

                // load N-1 and unload N+1
                if (scene1.dom.prev().length) AssetLoader.loadAssets(scene1.dom.prev(), false);
                if (scene2.dom.next().length) AssetLoader.unloadAssets(scene2.dom.next());
            }
        });

        transition.add(TweenMax.to(scene1.dom.get(0), duration, {
            x: 0,
            y: "-100%",
            ease: Power1.easeOut
        }));

        transition.add(TweenMax.to(scene2.dom.get(0), duration, {
            x: 0,
            y: "0%",
            ease: Power1.easeOut
        }), "-=" + duration);

        mainTimeline.add(transition);
    }

    /**
     * Build the scenes
     * Call when all assets are ready
     *
     * @return {boolean}
     */
    function buildNewScenes() {
        if (!newScenes || !newScenes.length) {
            throw 'No new scenes to build';
        }

        for (let i = 0; i < newScenes.length; i++) {
            const ind = scenes.indexOf(newScenes[i]);
            if (ind > 0) {
                createSceneTransition(scenes[ind - 1], newScenes[i]);
            }
            newScenes[i].build();
        }

        newScenes = [];

        play();
    }

    function touchSwipeHandler(ev) {
        if (ScrollHelper.locked) return;

        if (!isPlaying) {
            let direction = ev.velocityY > 0 ? -1 : 1;
            if (direction > 0) {
                reverse();
            } else if (currentStepLabel && currentStepLabel.block === false) {
                play();
            }
        }
    }

    function mouseWheelHandler(e) {
        if (ScrollHelper.locked) return;

        e = window.event ? window.event : e;

        const delta = Math.max(-1, Math.min(1, (e.wheelDelta ? e.wheelDelta : -e.detail)));
        if (_lastScrollTime !== null) {
            _sTime = (new Date).getTime();
            _noInertial = (_sTime - _lastScrollTime) > 50;
            _lastScrollTime = _sTime;
        } else {
            _lastScrollTime = (new Date).getTime();
            _noInertial = true;
        }

        if (!isPlaying && _noInertial) {
            if (delta > 0) {
                reverse();
            } else if (currentStepLabel && currentStepLabel.block === false) {
                play();
            }
        }
    }

    return {
        getInstance: __getInstance,
        init: init,
        play: play,
        pause: pause,
        skip: skip,
        addStepLabel: addStepLabel,
        unlockScroll: unlockScroll,
        labelCallback: labelCallback,
        createSceneOfDom: createSceneOfDom,
        buildNewScenes: buildNewScenes,
        createSceneTransition: createSceneTransition,
        mainTimeline() {
            return mainTimeline;
        },
        touchSwipeHandler: touchSwipeHandler,
        mouseWheelHandler: mouseWheelHandler
    }
})();

export {SceneManager};
