"use strict";

import {SoundCT} from "./SoundCT";

const SoundLayer = (function () {
    function SoundLayer() {
    }

    SoundLayer.prototype.muted = false;

    SoundLayer.init = function () {
        this.cts = [];
        this.clear();
        this.activeLoop = null;
    };

    SoundLayer.clear = function () {
        var ct, i, len, ref;
        if (!((this.cts != null) && this.cts.length)) {
            return;
        }
        ref = this.cts;
        for (i = 0, len = ref.length; i < len; i++) {
            ct = ref[i];
            ct.dispose();
        }
        return this.cts = [];
    };

    SoundLayer.stopAll = function(){
        console.log("> stopAll");
        if(this.cts) for(let ct of this.cts){
          ct.stop();
        }
    };

    SoundLayer.pauseAll = function(){
        console.log("> pauseAll");

        if(this.cts) for(let ct of this.cts){
          ct.pause();
        }
    };

    /**
     * Convert the sound URL to an id
     *
     * @param {string} url
     * @param {string} prefix
     * @return {string}
     */
    SoundLayer.urlToId = function (url, prefix = 'sound_') {
        return prefix + url.split("/").pop().split('.').shift();
    };

    /*
     get a sound its ID
     returns the object if a sound object is passed instead of a string
     @param (string|object)
     @return (object|null)
     */

    SoundLayer.getSoundFromId = function (id) {
        var ct, i, len, ref;
        if (!((this.cts != null) && this.cts.length)) {
            return null;
        }
        if (typeof id === 'object') {
            return id;
        }
        ref = this.cts;
        for (i = 0, len = ref.length; i < len; i++) {
            ct = ref[i];
            if (ct.id === id) {
                return ct;
            }
        }
        return null;
    };


    /*
     mute a sound
     */

    SoundLayer.mute = function () {
        var ct, i, len, ref, results;
        if (this.muted) {
            return;
        }
        this.muted = true;
        ref = this.cts;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
            ct = ref[i];
            results.push(ct.mute());
        }
        return results;
    };


    /*
     unmute a sound
     */

    SoundLayer.unmute = function () {
        var ct, i, len, ref, results;
        if (this.muted) {
            return;
        }
        this.muted = false;

        // unmute global controller
        if (Howler && Howler.mute) {
            Howler.mute(false);
        }

        ref = this.cts;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
            ct = ref[i];
            results.push(ct.unmute());
        }
        return results;
    };

    /**
     * add a sound to the current stack
     *
     * @param {string} url
     * @param {boolean} ambient
     * @param {string} id
     * @return {SoundCT}
     */
    SoundLayer.addSoundToStack = function (url, ambient = true, id = '') {
        if (!id || id === '') {
            id = this.urlToId(url);
        }

        let ct = this.getSoundFromId(id);
        if (!ct) {
            ct = new SoundCT(url, id, this.muted, ambient);
            this.cts.push(ct);
        }

        ct.maxVol = 1;

        return ct;
    };

    /**
     * play a SoundLayer object
     *
     * @param {string} id sound ID
     * @param {boolean} exclusive
     */
    SoundLayer.playSound = function (id, exclusive = false) {
        console.log("> play sound");
        let ct = this.getSoundFromId(id);

        if (!ct) {
            throw "Sound " + id + " is missing";
        }

        // stop other registered sounds if exclusive
        if (exclusive && this.cts) {
            this.cts.map(c => {
                if (c.id !== ct.id) {
                    c.pause();
                }
            })
        }

        // unmute global controller
        if (Howler && Howler.mute) {
            Howler.mute(false);
        }

        if (ct.loop) {
            if (this.activeLoop && this.activeLoop !== ct) {
                this.activeLoop.fadeOut();
            }
            this.activeLoop = ct;
            ct.fadeIn();
        } else {
            ct.fadeIn(0.1);
        }
    };

    /**
     * pause a sound
     *
     * @param {string} id
     */
    SoundLayer.pauseSound = function (id = null) {
        console.log("> pause sound");
        let ct = this.getSoundFromId(id);

        if (!ct) {
            throw "Sound " + id + " is missing";
        }

        ct.pause();
    };
    /**
     * stop the active loop
     *
     * @param {string} id
     */
    SoundLayer.stopActiveLoop = function (id = null) {
        console.log("> stop sound");
        if (this.activeLoop) {
            if (id) {
                let ct = this.getSoundFromId(id);
                if (ct === this.activeLoop) {
                    this.activeLoop.fadeOut();
                }
            } else {
                this.activeLoop.fadeOut();
            }
        }
    };

    return SoundLayer;

})();

export {SoundLayer};
