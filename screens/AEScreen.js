"use strict";

import {Screen} from "../Screen";

var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key)) child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }

        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    },
    hasProp = {}.hasOwnProperty;

const AEScreen = (function (superClass) {
    extend(AEScreen, superClass);

    AEScreen.create = function (dom, scene, alias) {
        return new AEScreen(dom, scene, alias);
    };

    /**
     * li l'écran au factory de la scène (généré par le plugin after effect)
     * et gènère le dom de la scène
     * le dom est généré au constructeur et non au prebuild car des assets sont envoyés au stack de preload
     * doivent donc être ajouté au dom avant le chargement des assets
     */

    function AEScreen(dom, scene, alias) {
        AEScreen.__super__.constructor.call(this, dom, scene, alias);

        let that = this;

        if (!window[this.name]) {
            throw new Error(`missing ${this.name}.js`);
        }

        const sceneData = window[this.name];
        that.initDom = sceneData.initDom;
        that.initTimelineData = sceneData.initTimeline;
        that.parent = null;
        that.isFullscreen = true;
        that._progress = 0;
        that.initDom();
        that.sceneContainer = $('<div class="tm-container"></div>');
        that.layersTm = $(".tm-layer", that.sceneDom);
        that.sceneContainer.append(that.sceneDom);
        that.dom.append(that.sceneContainer);
    }

    /**
     * init la time au prebuild (fait après que les assets soient chargé)
     */

    AEScreen.prototype.preBuild = function () {
        var layer, maxLength, ref, timeline;
        this.initTimelineData();
        maxLength = 0;
        ref = this.timelineData;
        for (layer in ref) {
            if (ref.hasOwnProperty(layer)) {
                timeline = ref[layer];
                timeline.layer = document.getElementById(layer);
                timeline.frame = null;
                timeline.frameIndex = 0;
                timeline.transform = {};
                if (maxLength < timeline[timeline.length - 1].time) {
                    maxLength = timeline[timeline.length - 1].time;
                }
            }
        }
        this._progress = 0;
        this.timeline = TweenMax.to(this, 1, {
            _progress: maxLength,
            ease: Linear.easeNone,
            onUpdate: (function (_this) {
                return function () {
                    return _this._refreshTween();
                };
            })(this)
        });
        this.timeline.pause();
        return this;
    };

    AEScreen.prototype._refreshTween = function () {
        var layer, propName, propVal, ref, ref1, timeline;
        ref = this.timelineData;
        for (layer in ref) {
            timeline = ref[layer];
            this.__fi = timeline.frameIndex;
            this.__t = timeline[this.__fi].time;
            if (this.__t < this._progress) {
                this.__inc = 1;
            } else {
                this.__inc = -1;
            }
            while ((this.__fi += this.__inc)) {
                this.__frame = timeline[this.__fi];
                if (this.__frame == null) {
                    this.__fi -= this.__inc;
                    this.__frame = timeline[this.__fi];
                    break;
                }
                this.__t = this.__frame.time;
                if (this.__t === this._progress || (this.__t <= this._progress && this.__inc < 0) || (this.__t > this._progress && this.__inc > 0)) {
                    this.__t < this._progress;
                    if (this.__inc > 0) {
                        this.__fi--;
                    }
                    this.__frame = timeline[this.__fi];
                    break;
                }
            }
            if (!this.__fi) {
                this.__fi = 1;
            }
            if (timeline.frameIndex !== this.__fi || !timeline.frame) {
                timeline.frameIndex = this.__fi;
                timeline.frame = this.__frame;
                this.__transformUpdate = false;
                ref1 = timeline.frame.data;
                for (propName in ref1) {
                    propVal = ref1[propName];
                    switch (propName) {
                        case "rotationZ":
                        case "xPercent":
                        case "yPercent":
                        case "scaleX":
                        case "scaleY":
                            this.__transformUpdate = true;
                            timeline.transform[propName] = propVal;
                            break;
                        case "autoAlpha":
                            timeline.layer.style.opacity = propVal;
                            break;
                        case "left":
                        case "top":
                            timeline.layer.style[propName] = propVal;
                            break;
                        case "transformOrigin":
                            timeline.layer.style.WebkitTransformOrigin = propVal;
                            timeline.layer.style.transformOrigin = propVal;
                            timeline.layer.style.msTransformOrigin = propVal;
                    }
                }
                if (this.__transformUpdate) {
                    this.__trProp = "translate(" + timeline.transform.xPercent + "," + timeline.transform.yPercent + ")";
                    if (timeline.transform.scaleX) {
                        this.__trProp += " scale(" + timeline.transform.scaleX + "," + timeline.transform.scaleY + ")";
                    }
                    timeline.layer.style.transform = this.__trProp;
                    timeline.layer.style.webkitTransform = this.__trProp;
                    timeline.layer.style.msTransform = this.__trProp;
                }
            }
        }
    };

    AEScreen.prototype.postBuild = function () {
        setTimeout((function (_this) {
            return function () {
                return _this.refreshViewport();
            };
        })(this), 300);
        return this._refreshTween();
    };


    /**
     * Helper retournant un objet tween d'1s pilotant directement la timeline AE
     * @param (int) set the duration of the tween in seconds, defaults to 1s
     * @return {object} objet tween directement manipulable depuis scrollmagic
     */

    AEScreen.prototype.getAnimation = function (duration) {
        if (duration == null) {
            duration = 1;
        }
        this.__progress = 0;
        if (!this._progressTween) {
            this._progressTween = TweenMax.to(this, duration, {
                __progress: 1,
                ease: Linear.easeNone,
                onUpdate: (function (_this) {
                    return function () {
                        return _this.timeline.progress(_this.__progress);
                    };
                })(this)
            });
        }
        return this._progressTween;
    };


    /**
     * Fonction de refresh apellé pour mettre à jour le vp (après le post build et à chaque redimenssionement de fenêtre)
     */

    AEScreen.prototype.refreshViewport = function () {
        var animationRatio, baseOnWidth, finalAnimationHeight, finalAnimationWidth, scaleRatio, sceneOffsetX, sceneOffsetY, wHeight, wWidth, windowRatio;
        AEScreen.__super__.refreshViewport.call(this);
        wWidth = this.scene.viewport.windowWidth;
        wHeight = this.scene.viewport.windowHeight;
        windowRatio = wWidth / wHeight;
        animationRatio = this.vpWidth / this.vpHeight;
        baseOnWidth = animationRatio < windowRatio;
        scaleRatio = baseOnWidth ? wWidth / this.vpWidth : wHeight / this.vpHeight;
        this.sceneContainer.css({
            width: wWidth + "px",
            height: wHeight + "px"
        });
        if ((this.layersTm != null)) {
            finalAnimationWidth = Math.ceil(scaleRatio * this.vpWidth);
            finalAnimationHeight = Math.ceil(scaleRatio * this.vpHeight);
            sceneOffsetX = Math.round((wWidth - finalAnimationWidth) / 2);
            sceneOffsetY = Math.round((wHeight - finalAnimationHeight) / 2);
            this.sceneDom.css({
                width: finalAnimationWidth + "px",
                height: finalAnimationHeight + "px",
                "margin-left": sceneOffsetX + "px",
                "margin-top": sceneOffsetY + "px"
            });
            this.layersTm.each((function (_this) {
                return function (ind, layer) {
                    var $layer, height, size, width;
                    $layer = $(layer);
                    size = $layer.data("size").split(' ');
                    width = size[0] * scaleRatio;
                    height = size[1] * scaleRatio;
                    return $layer.css({
                        "width": width + "px",
                        "height": height + "px"
                    });
                };
            })(this));
        }
        return this._refreshTween();
    };

    return AEScreen;

})(Screen);

export {AEScreen};
