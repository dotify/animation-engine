"use strict";

import _ from "lodash"
import {Howler} from "howler"

const SoundManager = (function () {
    // @formatter:off
    function SoundManager() {}
    // @formatter:on

    let muted = false;

    // list of SoundCT instances
    let sounds = [];

    _.assign(SoundManager, {
        register(sound) {
            sounds.push(sound);
        },

        unregister(sound) {
            if (!sound || !sound.id) {
                return;
            }

            const index = _.findIndex(sounds, s => s.id === sound.id);
            sounds.splice(index, 1);
        },

        unmute() {
            muted = true;
            Howler.mute(false);
        },

        mute() {
            muted = false;
            Howler.mute(true);
        },

        stopAll() {
        },

        toggle() {
            if (this.muted) {
                this.unmute();
            } else {
                this.mute();
            }
        },

        isMuted() {
            return Howler._muted;
        }
    });

    return SoundManager;
})();

export {SoundManager};
