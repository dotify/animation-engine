const ProgressBar = (function () {
    var Circle, absPos;

    ProgressBar.init = function () {
        return this.reset();
    };

    ProgressBar.start = function () {
        if (this.activeProgressBar) {
            return this.activeProgressBar.start;
        }
    };

    ProgressBar.refresh = function (progress) {
        if (this.activeProgressBar) {
            return this.activeProgressBar.refresh(progress);
        }
    };

    ProgressBar.complete = function () {
        if (this.activeProgressBar) {
            return this.activeProgressBar.complete();
        }
    };

    ProgressBar.reset = function () {
        return this.activeProgressBar = null;
    };

    function ProgressBar(progressParam, dom, autoActivate) {
        if (dom == null) {
            dom = null;
        }
        if (autoActivate == null) {
            autoActivate = true;
        }
        if (dom) {
            this.dom = dom.addClass("load-progress");
        } else {
            this.dom = $("<div class='load-progress' />");
        }
        this.canvas = $("<canvas width='" + ((progressParam.minRadius + progressParam.arcWidth) * 2) + "' height='" + ((progressParam.minRadius + progressParam.arcWidth) * 2) + "'/>");
        this.dom.append(this.canvas);
        progressParam.canvas = this.canvas.get(0);
        this.progressCircle = new ProgressCircle(progressParam);
        this.progressCircle.addEntry({
            fillColor: progressParam.arcColor
        });
        if (autoActivate) {
            this.activate();
        }
    }

    ProgressBar.prototype.activate = function () {
    };

    ProgressBar.prototype.start = function () {
    };

    ProgressBar.prototype.refresh = function (progress) {
        return this.progressCircle.update(1 - progress);
    };

    ProgressBar.prototype.complete = function () {
    };

    ProgressBar.prototype.activate = function () {
        return ProgressBar.activeProgressBar = this;
    };

    absPos = function (element) {
        var offsetLeft, offsetTop;
        offsetLeft = void 0;
        offsetTop = void 0;
        offsetLeft = offsetTop = 0;
        if (element.offsetParent) {
            while (true) {
                offsetLeft += element.offsetLeft;
                offsetTop += element.offsetTop;
                if (!(element = element.offsetParent)) {
                    break;
                }
            }
        }
        return [offsetLeft, offsetTop];
    };

    window.ProgressCircle = function (params) {
        this.canvas = params.canvas;
        this.minRadius = params.minRadius || 15;
        this.arcWidth = params.arcWidth || 5;
        this.gapWidth = params.gapWidth || 3;
        this.centerX = params.centerX || this.canvas.width / 2;
        this.centerY = params.centerY || this.canvas.height / 2;
        this.infoLineLength = params.infoLineLength || 60;
        this.horizLineLength = params.horizLineLength || 10;
        this.infoLineAngleInterval = params.infoLineAngleInterval || Math.PI / 8;
        this.infoLineBaseAngle = params.infoLineBaseAngle || Math.PI / 6;
        this.context = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.circles = [];
        this.runningCount = 0;
    };

    ProgressCircle.prototype = {
        constructor: ProgressCircle,
        addEntry: function (params) {
            this.circles.push(new Circle({
                canvas: this.canvas,
                context: this.context,
                centerX: this.centerX,
                centerY: this.centerY,
                innerRadius: this.minRadius,
                arcWidth: this.arcWidth,
                infoLineLength: this.infoLineLength,
                horizLineLength: this.horizLineLength,
                id: this.circles.length,
                fillColor: params.fillColor,
                outlineColor: params.outlineColor,
                progressListener: params.progressListener,
                infoListener: params.infoListener,
                infoLineAngle: this.infoLineBaseAngle + this.circles.length * this.infoLineAngleInterval
            }));
            return this;
        },
        start: function (interval) {
            this.timer = setInterval(((function (_this) {
                return function () {
                    _this._update();
                };
            })(this)), interval || 33);
            return this;
        },
        stop: function () {
            clearTimeout(this.timer);
        },
        update: function (progress) {
            this._clear();
            this.circles.forEach((function (_this) {
                return function (circle, idx, array) {
                    circle.update(progress);
                };
            })(this));
            return this;
        },
        _update: function () {
            this._clear();
            this.circles.forEach((function (_this) {
                return function (circle, idx, array) {
                    circle.update();
                };
            })(this));
            return this;
        },
        _clear: function () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return this;
        }
    };


    /**
     * @private
     * @class Individual progress circle.
     * @param params.canvas Canvas on which the circle will be drawn.
     * @param params.context Context of the canvas.
     * @param params.innerRadius Inner radius of the circle, in px.
     * @param params.arcWidth Width of each arc(circle).
     * @param params.gapWidth Distance between each arc.
     * @param params.centerX X coordinate of the center of circles.
     * @param params.centerY Y coordinate of the center of circles.
     * @param params.fillColor Color to fill in the circle.
     * @param params.outlineColor Color to outline the circle.
     * @param params.progressListener Callback function to fetch the progress.
     * @param params.infoListener Callback function to fetch the info.
     * @param params.infoLineAngle Angle of info line.
     */

    Circle = function (params) {
        var angle, arcDistance, cosA, infoText, sinA, style;
        this.id = params.id;
        this.canvas = params.canvas;
        this.context = params.context;
        this.centerX = params.centerX;
        this.centerY = params.centerY;
        this.arcWidth = params.arcWidth;
        this.innerRadius = params.innerRadius || 0;
        this.fillColor = params.fillColor || '#fff';
        this.outlineColor = params.outlineColor || this.fillColor;
        this.progressListener = params.progressListener;
        this.infoLineLength = params.infoLineLength || 250;
        this.horizLineLength = params.horizLineLength || 50;
        this.infoListener = params.infoListener;
        this.infoLineAngle = params.infoLineAngle;
        this.outerRadius = this.innerRadius + this.arcWidth;
        if (!this.infoListener) {
            return;
        }
        angle = this.infoLineAngle;
        arcDistance = (this.innerRadius + this.outerRadius) / 2;
        sinA = Math.sin(angle);
        cosA = Math.cos(angle);
        this.infoLineStartX = this.centerX + sinA * arcDistance;
        this.infoLineStartY = this.centerY - cosA * arcDistance;
        this.infoLineMidX = this.centerX + sinA * this.infoLineLength;
        this.infoLineMidY = this.centerY - cosA * this.infoLineLength;
        this.infoLineEndX = this.infoLineMidX + (sinA < 0 ? -this.horizLineLength : this.horizLineLength);
        this.infoLineEndY = this.infoLineMidY;
        infoText = document.createElement('div');
        style = infoText.style;
        style.color = this.fillColor;
        style.position = 'absolute';
        style.left = this.infoLineEndX + absPos(this.canvas)[0] + 'px';
        infoText.className = 'ProgressCircleInfo';
        infoText.id = 'progress_circle_info_' + this.id;
        document.body.appendChild(infoText);
        this.infoText = infoText;
    };

    Circle.prototype = {
        constructor: Circle,
        update: function (progress) {
            if (progress == null) {
                progress = false;
            }
            this.progress = progress === false ? this.progressListener() : progress;
            this._draw();
            if (this.infoListener) {
                this.info = this.infoListener();
                this._drawInfo();
            }
        },
        _draw: function () {
            var ANGLE_OFFSET, ctx, endAngle, innerRadius, outerRadius, startAngle, x, y;
            ctx = this.context;
            ANGLE_OFFSET = -Math.PI / 2;
            startAngle = 0 + ANGLE_OFFSET;
            endAngle = startAngle + this.progress * Math.PI * 2;
            x = this.centerX;
            y = this.centerY;
            innerRadius = this.innerRadius;
            outerRadius = this.outerRadius;
            ctx.fillStyle = this.fillColor;
            ctx.strokeStyle = this.outlineColor;
            ctx.beginPath();
            ctx.arc(x, y, innerRadius, startAngle, endAngle, false);
            ctx.arc(x, y, outerRadius, endAngle, startAngle, true);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
            return this;
        },
        _drawInfo: function () {
            var lineHeight, pointList;
            pointList = void 0;
            lineHeight = void 0;
            pointList = [[this.infoLineStartX, this.infoLineStartY], [this.infoLineMidX, this.infoLineMidY], [this.infoLineEndX, this.infoLineEndY]];
            this._drawSegments(pointList, false);
            this.infoText.innerHTML = this.info;
            lineHeight = this.infoText.offsetHeight;
            this.infoText.style.top = this.infoLineEndY + absPos(this.canvas)[1] - (lineHeight / 2) + 'px';
            return this;
        },
        _drawSegments: function (pointList, close) {
            var ctx, i;
            ctx = this.context;
            ctx.beginPath();
            ctx.moveTo(pointList[0][0], pointList[0][1]);
            i = 1;
            while (i < pointList.length) {
                ctx.lineTo(pointList[i][0], pointList[i][1]);
                ++i;
            }
            if (close) {
                ctx.closePath();
            }
            ctx.stroke();
        }
    };

    return ProgressBar;

})();

export {ProgressBar};
