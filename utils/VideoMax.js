"use strict";

import _ from "lodash"
import {SceneManager} from "../SceneManager"
import {VideoLayer} from "./VideoLayer"

const VideoMax = (function () {
    // @formatter:off
    function VideoMax() {}
    // @formatter:on

    _.assign(VideoMax, {
        /**
         * Play a long sound (ambiance, music...)
         * End of sound is defined by the duration
         *
         * Add a video from a tm-video layer to the timeline
         *
         * timeline.add(VideoMax.video(scr.layers['video-10'].video, tweenDuration), startPosition);
         * - tweenDuration: the tween length in the main timeline. Will not match the video duration.
         *                  usually a lot shorter (e.g. 1s) if we stop the main timeline right after
         *                  starting the video
         *
         * - startPosition: when the video starts in the main timeline
         *
         * @param {VideoCT} video
         * @param {number} duration in seconds
         */
        video(video, duration = 1) {
            return TweenMax.to(_.noop, duration, {
                onStart: this._onStartForward,
                onUpdate: this._onStartBackward,
                onComplete: this._onStopForward,
                onReverseComplete: this._onStopBackward,
                onStartParams: [video],
                onUpdateParams: ['{self}', video],
                onCompleteParams: [video],
                onReverseCompleteParams: [video]
            });
        },
        _onStartForward(video) {
            if (!VideoLayer.isPlaying(video)) {
                VideoLayer.playVideo(video);
            }
        },
        _onStopBackward(video) {
            if (VideoLayer.isPlaying(video)) {
                VideoLayer.pauseVideo(video);
            }
        },
        _onStopForward(video) {
            if (VideoLayer.isPlaying(video)) {
                VideoLayer.pauseVideo(video);
            }
        },
        _onStartBackward(tween, video) {
            if (SceneManager.direction > 0) {
                return;
            }
            if (0.9 > tween._time / tween._duration) {
                return;
            }
            if (!VideoLayer.isPlaying(video)) {
                VideoLayer.playVideo(video);
            }
        },
    });

    return VideoMax;
})();

export {VideoMax};
