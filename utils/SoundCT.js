"use strict";

import {Howl} from 'howler'
import {SoundManager} from './SoundManager'
import {SceneManager} from "../SceneManager";

const SoundCT = (function () {
    SoundCT.prototype.loop = false;

    SoundCT.prototype.fadeInTime = 1;

    SoundCT.prototype.fadeOutTime = 1;

    SoundCT.prototype.vol = 0.0;

    SoundCT.prototype.maxVol = 1.0;

    function SoundCT(url, id, muted = false, ambient = true) {
        this.id = id;
        this.muted = muted;
        this.loop = ambient;
        this.isPlaying = false;
        this.soundPlayer = new Howl({
            src: [url],
            autoplay: false,
            loop: this.loop,
            volume: 0,
            buffer: false
        });
        this.isLoaded = true;

        SoundManager.register(this);
    }

    SoundCT.prototype.dispose = function () {
        SoundManager.unregister(this);

        this.isPlaying = false;
        this.isLoaded = false;
        return delay(0, (function (_this) {
            return function () {
                _this.soundPlayer.stop();
                return delay(100, function () {
                    _this.soundPlayer.unload();
                    return delay(100, function () {
                        return _this.soundPlayer = null;
                    });
                });
            };
        })(this));
    };


    /*
     loop a sound
     */

    SoundCT.prototype._playLoop = function () {
        // unmute global controller
        if (Howler && Howler.mute) {
            Howler.mute(false);
        }

        this.soundPlayer.play();
    };

    SoundCT.prototype.play = function () {
        // unmute global controller
        if (Howler && Howler.mute) {
            Howler.mute(false);
        }

        this.isPlaying = true;
        this.soundPlayer._volume = this.maxVol;
        this.soundPlayer.play();
    };

    SoundCT.prototype.pause = function () {
        this.isPlaying = false;
        this.soundPlayer._volume = this.maxVol;
        this.soundPlayer.pause();
    };

    SoundCT.prototype.stop = function () {
        this.isPlaying = false;
        this.soundPlayer._volume = this.maxVol;
        this.soundPlayer.stop();
    };

    SoundCT.prototype.mute = function () {
        this.muted = true;
        if (this.fadeTween) {
            this.fadeTween.pause();
        }
        this.soundPlayer.volume(0);
        if (this.isPlaying) {
            return this.soundPlayer.pause();
        }
    };


    /*
     reset volume to regular value
     */

    SoundCT.prototype.unmute = function () {
        this.muted = false;
        if (this.fadeTween) {
            this.fadeTween.pause();
        }
        if (this.isPlaying && this.loop) {
            this.soundPlayer._volume = this.maxVol;
            this._playLoop();
        }
    };


    /**
     * fade a sound in using TweenMax
     *
     * @param {number} time tween duration
     * @param {number} vol target volume
     */
    SoundCT.prototype.fadeIn = function (time = 1, vol = this.maxVol) {
        this.isPlaying = true;
        if (!this.muted) {
            if (this.loop) {
                this._playLoop();
            } else {
                this.soundPlayer.play();
            }
        }
        if (this.fadeTween) {
            this.fadeTween.pause();
        }
        return this.fadeTween = TweenMax.to(this, time, {
            vol: vol,
            ease: Linear.easeNone,
            onUpdate: (function (_this) {
                return function () {
                    if (!_this.muted) {
                        return _this.soundPlayer.volume(_this.vol);
                    }
                };
            })(this)
        });
    };

    /**
     * fade a sound out using TweenMax
     * @param {number} time tween duration
     */
    SoundCT.prototype.fadeOut = function (time = 2) {
        this.isPlaying = false;
        if (this.fadeTween) {
            this.fadeTween.pause();
        }
        let soundPlayer = this.soundPlayer;
        setTimeout((function (_this) {
            return function () {
                soundPlayer.stop();
                return soundPlayer.volume(0);
            };
        })(this), time * 1000);
        return this.fadeTween = TweenMax.to(this, time, {
            vol: 0,
            ease: Linear.easeNone,
            onUpdate: (function (_this) {
                return function () {
                    if (!_this.muted) {
                        return _this.soundPlayer.volume(_this.vol);
                    }
                };
            })(this),
            onComplete: (function (_this) {
                return function () {
                    if (!_this.muted) {
                        return _this.soundPlayer.stop();
                    }
                };
            })(this)
        });
    };

    return SoundCT;

})();

export {SoundCT};
