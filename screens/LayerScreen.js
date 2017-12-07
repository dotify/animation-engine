"use strict";

import {Screen} from "../Screen";
import {extend} from "../utils/extend"
import {SoundLayer} from "../utils/SoundLayer";
import {VideoLayer} from "../utils/VideoLayer";
import {SoundProgress} from "../utils/SoundProgress";



const bind = function (fn, me) {
    return function () {
        return fn.apply(me, arguments);
    };
};

const LayerScreen = (function (superClass) {
    extend(LayerScreen, superClass);

    LayerScreen.LayerIndex = 1;
    LayerScreen.interactiveLayersCount = 0;

    LayerScreen.LAYOUT_MODE = {
        COVER: "cover",
        CONTAIN: "contain"
    };

    LayerScreen.prototype.layoutMode = LayerScreen.LAYOUT_MODE.COVER;

    LayerScreen.create = function (dom, scene, alias) {
        return new this(dom, scene, alias);
    };

    function LayerScreen(dom, scene, alias) {
        this.getLayersOfGroup = bind(this.getLayersOfGroup, this);
        LayerScreen.__super__.constructor.call(this, dom, scene, alias);
        this.bufferRefreshVP = null;
        this.hasScroll = this.dom.data("screen-scroll") || false;
        this.isFlex = (this.dom.data("screen-size") == null) || this.hasScroll;
    }


    /**
     * construit la scène avant un premier rafraichissement du viewport
     */

    LayerScreen.prototype.preBuild = function () {
        if (this.isFlex && !this.hasScroll) {
            this.vpWidth = this.scene.dom.width();
            this.vpHeight = this.scene.dom.height();
        } else {
            this.size = this.dom.data("screen-size").split(' ');
            this.vpWidth = parseInt(this.size[0]);
            this.vpHeight = parseInt(this.size[1]);
        }
        this.rendering = this._dataEnum(this.dom.data('rendering'), ['fast', 'precise']);
        this.containerDom = $("<div class='tm-container'/>").appendTo(this.dom);
        this.sceneDom = $("<div class='tm-scene'/>").appendTo(this.containerDom);
        this.layers = {};

        $('.tm-layer, .tm-audio, .tm-video', this.dom).each((ind, element) => {
            let layer = $(element).appendTo(this.sceneDom);
            layer.type = layer[0].className.replace('tm-', '');
            layer.name = layer.data("layer-name") ? layer.data("layer-name") : "layer_" + LayerScreen.LayerIndex;
            layer.group = layer.data("layer-group") ? layer.data("layer-group") : "default";
            layer.pos = this._dataFourProps(layer.data("layer-pos"));
            layer.pivot = layer.data("layer-pivot").split(' ');
            layer.size = layer.data("layer-size").split(' ');
            layer.rotation = this._isEmpty(layer.data("layer-rotation")) ? '0' : layer.data("layer-rotation");
            layer.opacity = this._isEmpty(layer.data("layer-opacity")) ? '1' : layer.data("layer-opacity");
            layer.scale = this._getScaleFromAttr(layer.data("layer-scale"));
            layer.scaleToScreen = this._dataBoolean(layer.data("layer-scale-to-screen"), true);

            // type specific features
            switch (layer.type) {
                case 'audio' :
                    console.log("> audio layer");
                    LayerScreen.interactiveLayersCount++;

                    let source = layer.data('load-audio');
                    if (source && source !== '') {
                        layer.sound = SoundLayer.addSoundToStack(source, false);
                        layer.progress = new SoundProgress(layer);
                    }
                    break;

                case 'video' :
                    console.log("> video layer");
                    LayerScreen.interactiveLayersCount++;

                    layer.video = VideoLayer.addVideoToStack(layer.data('load-video'), layer.name);
                    break;
            }

            LayerScreen.LayerIndex++;

            // bind event to audio and video layers and add .interactive class
            // to the screen if interactive layers were found
            if (LayerScreen.interactiveLayersCount) {
                this.dom.addClass('interactive');
                if ('undefined' !== typeof this.layers[layer.name]) {
                    throw `error on ${this.toString()} layer ${layer.name} is declared twice`;
                }
            }

            this.layers[layer.name] = layer;
        });

        // Bind audio on clicks
        $(this.dom).on('click', '.tm-audio', e => {
            const name = e.currentTarget.getAttribute('data-layer-name');
            if (name && name !== '' && this.layers && this.layers[name] && this.layers[name].sound) {
                if (this.layers[name].sound.isPlaying) {
                    SoundLayer.pauseSound(this.layers[name].sound);
                } else {
                    SoundLayer.playSound(this.layers[name].sound, true);
                }
            }
        });

        if (this.hasScroll) {
            this.containerDom.addClass('iscroll-wrapper');
            this.sceneDom.addClass('iscroll-scroller');
        }

        if (this.dom.data("layout-mode")) {
            return this.layoutMode = this.dom.data("layout-mode");
        }
    };

    /**
     * Get all layers from a group
     *
     * @param {string} group
     */
    LayerScreen.prototype.getLayersOfGroup = function (group) {
        let res = [];
        group = group || "default";

        for (const layerName in this.layers) {
            if (this.layers.hasOwnProperty(layerName)) {
                let layer = this.layers[layerName];
                if (layer.group === group) {
                    res.push(layer);
                }
            }
        }

        return res;
    };

    /**
     * Init layers position from the HTML attr
     *
     * @param {Array} layers
     * @param {Number} scaleRatio
     * @return {Array} return
     */
    function initLayerPositions(layers, scaleRatio) {
        let results = [];
        for (let layerName in layers) {
            if (layers.hasOwnProperty(layerName)) {
                const layer = layers[layerName];
                if (this.isFlex) {
                    results.push(TweenMax.set(layer, {
                        top: layer.pos.top,
                        right: layer.pos.right,
                        bottom: layer.pos.bottom,
                        left: layer.pos.left,
                        marginLeft: this._parseNumber(-layer.pivot[0] * (layer.scaleToScreen ? scaleRatio : 1)) + "px",
                        marginTop: this._parseNumber(-layer.pivot[1] * (layer.scaleToScreen ? scaleRatio : 1)) + "px",
                        transformOrigin: this._parseNumber(layer.pivot[0] * (layer.scaleToScreen ? scaleRatio : 1)) + "px " + this._parseNumber(layer.pivot[1] * (layer.scaleToScreen ? scaleRatio : 1)) + "px",
                        opacity: layer.opacity,
                        rotation: layer.rotation,
                        scaleX: layer.scale[0],
                        scaleY: layer.scale[1],
                        width: 'auto' === layer.size[0] ? 'auto' : this._parseNumber(layer.size[0] * (layer.scaleToScreen ? scaleRatio : 1)) + "px",
                        height: 'auto' === layer.size[1] ? 'auto' : this._parseNumber(layer.size[1] * (layer.scaleToScreen ? scaleRatio : 1)) + "px"
                    }));
                } else {
                    results.push(TweenMax.set(layer, {
                        left: this._toPercent(layer.pos.left, this.vpWidth),
                        top: this._toPercent(layer.pos.top, this.vpHeight),
                        bottom: layer.pos.bottom,
                        right: layer.pos.right,
                        marginLeft: this._parseNumber(-layer.pivot[0] * (layer.scaleToScreen ? scaleRatio : 1)) + "px",
                        marginTop: this._parseNumber(-layer.pivot[1] * (layer.scaleToScreen ? scaleRatio : 1)) + "px",
                        transformOrigin: this._parseNumber(layer.pivot[0] * (layer.scaleToScreen ? scaleRatio : 1)) + "px " + this._parseNumber(layer.pivot[1] * (layer.scaleToScreen ? scaleRatio : 1)) + "px",
                        opacity: layer.opacity,
                        rotation: layer.rotation,
                        scaleX: layer.scale[0],
                        scaleY: layer.scale[1],
                        width: 'auto' === layer.size[0] ? 'auto' : this._parseNumber(layer.size[0] * (layer.scaleToScreen ? scaleRatio : 1)) + "px",
                        height: 'auto' === layer.size[1] ? 'auto' : this._parseNumber(layer.size[1] * (layer.scaleToScreen ? scaleRatio : 1)) + "px"
                    }));
                }
            }
        }

        return results;
    }

    /**
     * Rafraichissement du viewport (fait à chaque resize de la fenêtre)
     *
     * @param {Boolean} initLayers
     */
    LayerScreen.prototype.refreshViewport = function (initLayers = false) {
        const wWidth = this.scene.viewport.windowWidth;
        const wHeight = this.scene.viewport.windowHeight;

        if (this.isFlex) {
            this.vpWidth = this.scene.dom.width();
            this.vpHeight = this.scene.dom.height();
        }

        const windowRatio = wWidth / wHeight;
        const animationRatio = this.vpWidth / this.vpHeight;
        let baseOnWidth = animationRatio < windowRatio;
        if (this.layoutMode === LayerScreen.LAYOUT_MODE.CONTAIN) {
            baseOnWidth = !baseOnWidth;
        }

        const scaleRatio = baseOnWidth ? wWidth / this.vpWidth : wHeight / this.vpHeight;

        this.containerDom.css({
            width: wWidth + "px",
            height: wHeight + "px",
            marginTop: this.scene.viewport.marginTop + 'px',
            marginLeft: this.scene.viewport.marginLeft + 'px'
        });

        const finalAnimationWidth = Math.ceil(scaleRatio * this.vpWidth);
        const finalAnimationHeight = Math.ceil(scaleRatio * this.vpHeight);
        const sceneOffsetX = this._parseNumber((wWidth - finalAnimationWidth) / 2);
        const sceneOffsetY = this._parseNumber((wHeight - finalAnimationHeight) / 2);

        if (this.isFlex) {
            let h = wHeight + "px";
            if (this.hasScroll) {
                h = this._parseNumber(wHeight) > this._parseNumber(this.size[1]) ? wHeight + "px" : this.size[1] + "px";
            }
            this.sceneDom.css({
                width: wWidth + "px",
                height: h,
                marginLeft: 0,
                marginTop: 0
            });
        } else {
            this.sceneDom.css({
                width: finalAnimationWidth + "px",
                height: finalAnimationHeight + "px",
                marginLeft: sceneOffsetX + "px",
                marginTop: sceneOffsetY + "px"
            });
        }

        // test for boolean as refreshViewport() is called with an event on window.resize
        return (initLayers === true) ? initLayerPositions.call(this, this.layers, scaleRatio) : [];
    };


    /*
     Buffered refresh is triggered once at the end of a resize
     */

    LayerScreen.prototype.refreshViewportBuffer = function () {
        if (this.hasScroll) {
            if (this.scroller === null) {
                return this.scroller = new IScroll($('.iscroll-wrapper', this.dom).get(0), {
                    scrollX: false,
                    scrollY: true,
                    click: true,
                    scrollbars: true,
                    mouseWheel: true,
                    interactiveScrollbars: true,
                    shrinkScrollbars: 'scale',
                    fadeScrollbars: true
                });
            } else {
                return this.scroller.refresh();
            }
        }
    };

    return LayerScreen;

})(Screen);

export {LayerScreen};