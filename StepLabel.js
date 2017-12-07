"use strict";

const StepLabel = (function () {
    return function StepLabel(timeline, name, options, position) {
        options = options || {
                skipBt: true,
                block: false
            };
        this.timeline = timeline;
        this.position = position;
        this.skipBt = options.skipBt;
        this.block = options.block;
        this.skipBtLabel = options.skipBtLabel || "";
        this.name = name;
    };
})();

export {StepLabel};
