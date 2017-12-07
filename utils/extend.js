"use strict";

const extend = function (child, parent) {
    for (let key in parent) {
        if (parent.hasOwnProperty(key)) child[key] = parent[key];
    }

    function ctor() {
        this.constructor = child;
    }

    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
};

export {extend};
