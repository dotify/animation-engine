"use strict";

import _ from "lodash"
import {VideoCT} from '../utils/VideoCT'
import {SoundLayer} from '../utils/SoundLayer'

const VideoLayer = (function () {
    // @formatter:off
    function VideoLayer() {}
    // @formatter:on

    _.assign(VideoLayer, {
        init() {
            this.cts = [];
            this.clear();
        },

        /**
         * Clear all video controllers
         */
        clear() {
            if (!Array.isArray(this.cts)) {
                return;
            }

            this.cts.map(ct => ct.dispose());
            this.cts = [];
        },

        /**
         * Convert a url to video ID
         *
         * @param url
         * @param prefix
         */
        urlToId(url, prefix = 'video_') {
            return prefix + url.split('/').pop().split('.').shift();
        },

        /**
         * Find a video by ID in the controllers' list
         *
         * @param id
         * @return {object}
         */
        getVideoById(id) {
            if (!Array.isArray(this.cts)) {
                return null;
            }

            if (_.isObject(id)) {
                return id;
            }

            let ct = _.find(this.cts, ct => ct.id == id);

            if (!ct) throw `Missing video ${id}`;

            return ct;
        },

        mute() {
            if (this.muted) {
                return;
            }

            this.muted = true;
            this.cts.map(ct => ct.mute());
        },

        unmute() {
            if (!this.muted) {
                return;
            }

            this.muted = false;
            this.cts.map(ct => ct.unmute());
        },

        /**
         * Add video to the controllers' list
         *
         * @param url
         * @param id
         * @return {VideoCT}
         */
        addVideoToStack(url, id = '') {
            if (!id || id === '') {
                id = this.urlToId(url);
            }

            let ct;
            try {
                ct = this.getVideoById(id);
            } catch (e) {
                ct = VideoCT.create(url, id, this.muted);
                this.cts.push(ct);
            }

            return ct;
        },

        /**
         * Play the video
         * @param {string} id
         */
        playVideo(id) {
            console.log("> play video");
            SoundLayer.pauseAll();
            this.getVideoById(id).play();

        },

        /**
         * Play the video
         * @param {string} id
         */
        pauseVideo(id) {
            console.log("> pause video");
            this.getVideoById(id).pause();
        },

        /**
         * Stop a video
         * @param {string} id
         */
        stopVideo(id) {
            console.log("> stop video");
            this.getVideoById(id).stop();
        },

        /**
         * Is the video playing ?
         * @param id
         * @return {boolean}
         */
        isPlaying(id) {
            return !!this.getVideoById(id).isPlaying;
        }
    });

    _.assign(VideoLayer.prototype, {
        muted: false
    });

    return VideoLayer;
})();

export {VideoLayer}
