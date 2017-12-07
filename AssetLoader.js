"use strict";

let AssetLoader = (function () {
    let __instance,
        _images = [],
        _imageElements = {},
        _imagesLeftToLoad = 0,
        _isLoading = false,
        _container = document.createElement('div'),
        _onLoadComplete = $.noop,
        _onLoadProgress = $.noop,
        _onLoadStart = $.noop,
        _errorHandler = function (err) {
            throw err.message || err;
        };

    function AssetLoader() {
        // constructor - keep me
    }

    function __getInstance() {
        if (!__instance) {
            __instance = new AssetLoader;
        }

        return __instance;
    }

    /**
     * get the loading progress between 0 and 1
     *
     * @return {number}
     */
    function getProgress() {
        return _isLoading ? 1 - _imagesLeftToLoad / (_images.length + 1) : 1;
    }

    /**
     * Load an image and apply as a background
     *
     * @param element DOM element image or src in attribute
     */
    function loadImage(element) {
        return new Promise((resolve, reject) => {
            // create an image element
            const src = element.getAttribute('data-load-image');
            const key = element.getAttribute('data-layer-name');
            if (!src || src === '') {
                return reject(new Error('Please define [data-load-image] with an image URL'));
            }

            // create the image element
            _imageElements[key] = document.createElement('img');
            _imageElements[key].src = src;

            // define image element handlers
            if (_imageElements[key].complete) {
                element.style.backgroundImage = `url('${src}')`;
                resolve(element);
            } else {
                // set the element's background with the image on success
                _imageElements[key].addEventListener('load', () => {
                    element.style.backgroundImage = `url('${src}')`;
                    resolve(element);
                });

                // reject on failure
                _imageElements[key].addEventListener('error', reject);
            }
        });
    }

    function setHandlers(handler) {
        // register delegates
        // Do not use the _onLoadComplete = onLoadComplete || $.noop
        // syntax as this is a singleton and it would override the value
        if (handler.onLoadComplete) {
            _onLoadComplete = handler.onLoadComplete;
        }
        if (handler.onLoadProgress) {
            _onLoadProgress = handler.onLoadProgress;
        }

        if (handler.onLoadStart) {
            _onLoadStart = handler.onLoadStart;
        }

        if (handler.errorHandler) {
            _errorHandler = handler.errorHandler;
        }

        // append the container to the body element
        _container.className = 'preloader-container';
        document.body.appendChild(_container);
    }

    /**
     * Load all assets from the scoped dom
     * images are defined in the markup by [data-load-image] attribute
     *
     * @param dom
     * @param showProgress
     */
    function loadAssets(dom, showProgress = true) {
        _isLoading = true;
        _images = $('*[data-load-image]', dom);
        _imagesLeftToLoad = _images.length;

        if (showProgress) _onLoadStart(getProgress(), _imagesLeftToLoad);

        return new Promise((resolve, reject) => {
            // resolve if no found images
            if (!_imagesLeftToLoad) {
                return resolve();
            }

            // build up an array of promises (loaders)
            // and call the final callback when all are done
            let promises = [];
            _images.each((i, element) => {
                let loader = loadImage(element)
                    .then(() => {
                        _imagesLeftToLoad--;
                        if (showProgress) _onLoadProgress(getProgress(), _imagesLeftToLoad);
                    });
                promises.push(loader);
            });

            Promise.all(promises).then(resolve).catch(reject);
        })
            .then(() => {
                _isLoading = false;
                if (showProgress) _onLoadComplete(getProgress(), _imagesLeftToLoad);
            })
            .catch(_errorHandler);
    }

    /**
     * Unload all images from a dom container
     * and trash elements from the collection of image elements
     * Wrap in a setTimeout to run at the next tick
     *
     * @param dom
     * @param delay
     */
    function unloadAssets(dom, delay = 2000) {
        setTimeout(function () {
            let key = '';
            $('[data-load-image]', dom)
                .css('background-image', 'none')
                .each((index, element) => {
                    key = element.getAttribute('data-layer-name');
                    if ('undefined' !== typeof _imageElements[key] && null !== _imageElements[key]) {
                        _imageElements[key] = null;
                        delete _imageElements[key];
                    }
                });
        }, delay);
    }

    return {
        getInstance: __getInstance,
        getProgress: getProgress,
        loadAssets: loadAssets,
        unloadAssets: unloadAssets,
        setHandlers: setHandlers
    };

})();

export {AssetLoader}
