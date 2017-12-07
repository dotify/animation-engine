"use strict";

import _ from "lodash"
import videojs from "video.js";
import {SceneManager} from "../SceneManager";

const VideoCT = (function () {
    // @formatter:off
    function VideoCT() {}
    // @formatter:on

    _.assign(VideoCT, {
        create(url, id, muted = false) {
            let __instance = new VideoCT(url, id, muted);
            __instance.id = id;
            __instance.muted = muted;
            __instance.isPlaying = false;
            __instance.isLoaded = false;

            const element = $(`[data-layer-name="${id}"]`);
            const container = $(`<video class="video-js"><source src="${element.data('load-video')}" type="video/mp4"/></video>`).appendTo(element);
            __instance.videoPlayer = videojs(container[0], {
                controls: true,
                preload: true
            }, function () {
                __instance.isLoaded = true;
                $('.video-js', element).css({width: '100%', height: '100%'});
                $('style.vjs-styles-dimensions').remove();
            });

            // unlock scroll on video end
            __instance.videoPlayer.on('ended', () => {
                SceneManager.unlockScroll();
            });

            return __instance;
        }
    });

    _.assign(VideoCT.prototype, {
        play() {
            this.isPlaying = true;
            this.videoPlayer.play();
        },

        pause() {
            this.isPlaying = false;
            this.videoPlayer.pause();
        },

        stop() {
            this.isPlaying = false;
            this.videoPlayer.pause();
            this.videoPlayer.currentTime(0);
        },

        duration() {
            return this.videoPlayer.duration() || 10;
        },

        dispose() {
            this.isPlaying = false;
            this.isLoaded = false;
            return delay(0, () => {
                this.videoPlayer.stop();
                setTimeout(() => {
                    this.videoPlayer.unload();
                    setTimeout(() => {
                        this.videoPlayer = null
                    }, 100);
                }, 100);
            });
        }
    });

    return VideoCT;
})();

export {VideoCT};
