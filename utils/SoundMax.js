"use strict";

import _ from "lodash"
import {SceneManager} from "../SceneManager"
import {SoundLayer} from "./SoundLayer"

const SoundMax = (function () {
    // @formatter:off
    function SoundMax() {}
    // @formatter:on

    _.assign(SoundMax, {
        /**
         * Play a short sound once
         * End of sound is defined by its duration
         *
         * @param {string} sound
         */
        short(sound) {
            return TweenMax.to(_.noop, 0, {
                onStart: this._onStartForward,
                onStartParams: [sound]
            });
        },

        /**
         * Play a long sound (ambience, music...)
         * End of sound is defined by the duration
         *
         * @param {string} sound
         * @param {number} duration in seconds
         */
        long(sound, duration) {
            return TweenMax.to(_.noop, duration, {
                onStart: this._onStartForward,
                onUpdate: this._onStartBackward,
                onComplete: this._onStopForward,
                onReverseComplete: this._onStopBackward,
                onStartParams: [sound],
                onUpdateParams: ['{self}', sound],
                onCompleteParams: [sound],
                onReverseCompleteParams: [sound]
            });
        },

        _onStartForward(sound) {
            return SoundLayer.playSound(sound);
        },

        _onStopBackward(sound) {
            return SoundLayer.stopActiveLoop(sound);
        },

        _onStopForward(sound) {
            return SoundLayer.stopActiveLoop(sound);
        },

        _onStartBackward(tween, sound) {
            if (SceneManager.direction > 0) {
                return;
            }
            if (0.9 > tween._time / tween._duration) {
                return;
            }
            if (SoundLayer.getSoundFromId(sound).isPlaying) {
                return;
            }
            return SoundLayer.playSound(sound);
        },
    });

    return SoundMax;
})();

export {SoundMax};
