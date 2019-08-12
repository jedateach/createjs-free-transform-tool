// namespace:
this.createjs = this.createjs || {};
// package
this.createjs.util = this.createjs.util || {};

// class
(function() {

    var FreeTransformTool = function(lineColor, dashed, color, size) {
        this.initialize(lineColor, dashed, color, size);
    };
    var p = FreeTransformTool.prototype = new createjs.Container();

    // public properties:    
    p.moveTool = null;
    p.scaleTool = null;
    p.hScaleTool = null;
    p.vScaleTool = null;
    p.rotateTool = null;
    p.target = null;
    p.border = null;
    p.activeKey = null;
    p.dashed = null;

    // constructor:
    // copy before override
    p.Container_initialize = p.initialize;
    p.initialize = function(lineColor, dashed, color, controlsSize) {
        this.Container_initialize();

        // default values
        lineColor = lineColor || "#4285F4";
        color = color || "rgba(255,255,255,0.8)";
        controlsSize = controlsSize || 10;
        this.dashed = dashed === undefined ? true : dashed;

        var that = this;

        // listen to keyboard
        createjs.util.addEvent(document, "keydown", function(ev) {
            var ev = ev || window.event;
            that.activeKey = ev.keyCode;
        });
        createjs.util.addEvent(document, "keyup", function(ev) {
            that.activeKey = null;
        });

        // create border
        this.border = new createjs.Shape();
        this.border.color = lineColor;
        this.addChild(this.border);

        // create a transform control handle
        var handleStrokeWidth = 1
        function createHandle() {
            var shape = new createjs.Shape();
            shape.graphics
                .beginStroke(lineColor)
                .setStrokeStyle(handleStrokeWidth)
                .beginFill(color);
            shape.x = shape.regX = controlsSize / 2;
            shape.y = shape.regY = controlsSize / 2;
            return shape;
        }

        // init move tool
        this.moveTool = createHandle();
        this.moveTool.graphics.drawRect(0, 0, controlsSize, controlsSize);
        this.moveTool.on("mouseover", function() {
            that.setTitle('Move');
            that.setCursor('move');
        });
        this.moveTool.on("mouseout", function() {
            that.setTitle();
            that.setCursor('default');
        });
        this.moveTool.on("mousedown", function(evt) {
            if (that.target) {
                var me = evt.currentTarget;
                var scale = that.stage.scaleX;
                var startPoint = {x: that.target.x, y: that.target.y};
                me.on("pressmove", function(e) {
                    var h = (e.stageX - evt.stageX) / scale;
                    var v = (e.stageY - evt.stageY) / scale;
                    that.target.x = startPoint.x + h;
                    that.target.y = startPoint.y + v;
                    that.stage.update();
                });
                me.on("pressup", function() {
                    me.removeAllEventListeners("pressmove");
                });
            }
        });
        this.addChild(this.moveTool);

        // init hScale tool
        this.hScaleTool = createHandle();
        this.hScaleTool.graphics.drawRect(0, 0, controlsSize, controlsSize);
        this.hScaleTool.alpha = 0.8;
        this.hScaleTool.on("mouseover", function() {
            that.setTitle('Resize');
            that.setCursor('e-resize');
        });
        this.hScaleTool.on("mouseout", function() {
            that.setTitle();
            that.setCursor('default');
        });
        this.hScaleTool.on("mousedown", function(evt) {
            if (that.target) {
                var me = evt.currentTarget;
                var scale = that.stage.scaleX;
                var startScaleX = that.target.scaleX;
                var startWidth = that.target.getBounds().width * startScaleX / 2;
                var startRotation = that.target.rotation;
                var evtRotate = createjs.util.rotatePoint({x: evt.stageX, y: evt.stageY}, {x: 0, y: 0}, -startRotation);
                me.on("pressmove", function(e) {
                    var eRotate = createjs.util.rotatePoint({x: e.stageX, y: e.stageY}, {x: 0, y: 0}, -startRotation);
                    var h = (eRotate.x - evtRotate.x) / scale;
                    var hScale = (startScaleX / startWidth) * (startWidth + h);
                    that.target.scaleX = hScale;
                    that.stage.update();
                });
                me.on("pressup", function() {
                    me.removeAllEventListeners("pressmove");
                });
            }
        });
        this.addChild(this.hScaleTool);

        // init vScale tool
        this.vScaleTool = createHandle();
        this.vScaleTool.graphics.drawRect(0, 0, controlsSize, controlsSize);
        this.vScaleTool.on("mouseover", function() {
            that.setTitle('Resize');
            that.setCursor('s-resize');
        });
        this.vScaleTool.on("mouseout", function() {
            that.setTitle();
            that.setCursor('default');
        });
        this.vScaleTool.on("mousedown", function(evt) {
            if (that.target) {
                var me = evt.currentTarget;
                var scale = that.stage.scaleY;
                var startScaleY = that.target.scaleY;
                var startHeight = that.target.getBounds().height * startScaleY / 2;
                var startRotation = that.target.rotation;
                var evtRotate = createjs.util.rotatePoint({x: evt.stageX, y: evt.stageY}, {x: 0, y: 0}, -startRotation);
                me.on("pressmove", function(e) {
                    var eRotate = createjs.util.rotatePoint({x: e.stageX, y: e.stageY}, {x: 0, y: 0}, -startRotation);
                    var v = (eRotate.y - evtRotate.y) / scale;
                    var vScale = (startScaleY / startHeight) * (startHeight + v);
                    that.target.scaleY = vScale;
                    that.stage.update();
                });
                me.on("pressup", function() {
                    me.removeAllEventListeners("pressmove");
                });
            }
        });
        this.addChild(this.vScaleTool);

        // init scale tool
        this.scaleTool = createHandle();
        this.scaleTool.graphics.drawRect(0, 0, controlsSize, controlsSize);
        this.scaleTool.on("mouseover", function() {
            that.setTitle('Resize');
            that.setCursor('se-resize');
        });
        this.scaleTool.on("mouseout", function() {
            that.setTitle();
            that.setCursor('default');
        });
        this.scaleTool.on("mousedown", function(evt) {
            if (that.target) {
                var me = evt.currentTarget;
                var scale = that.stage.scaleX;
                var startScaleX = that.target.scaleX;
                var startScaleY = that.target.scaleY;
                var startWidth = that.target.getBounds().width * startScaleX / 2;
                var startHeight = that.target.getBounds().height * startScaleY / 2;
                var startRotation = that.target.rotation;
                var evtRotate = createjs.util.rotatePoint({x: evt.stageX, y: evt.stageY}, {x: 0, y: 0}, -startRotation);
                me.on("pressmove", function(e) {
                    var eRotate = createjs.util.rotatePoint({x: e.stageX, y: e.stageY}, {x: 0, y: 0}, -startRotation);
                    var h = (eRotate.x - evtRotate.x) / scale;
                    var v = (eRotate.y - evtRotate.y) / scale;
                    var hScale = (startScaleX / startWidth) * (startWidth + h);
                    var vScale = (startScaleY / startHeight) * (startHeight + v);
                    var isShift = that.activeKey === 16; // shift key
                    if (true || isShift) {
                        hScale = hScale >= vScale ? hScale : vScale;
                        vScale = vScale >= hScale ? vScale : hScale;
                    }
                    that.target.scaleX = hScale;
                    that.target.scaleY = vScale;
                    that.stage.update();
                });
                me.on("pressup", function() {
                    me.removeAllEventListeners("pressmove");
                });
            }
        });
        this.addChild(this.scaleTool);

        // init rotate tool
        this.rotateTool = createHandle();
        this.rotateTool.graphics.drawEllipse(0, 0, controlsSize, controlsSize);
        this.rotateTool.on("mouseover", function() {
            that.setTitle('Rotate');
            that.setCursor('pointer');
        });
        this.rotateTool.on("mouseout", function() {
            that.setTitle();
            that.setCursor('default');
        });
        this.rotateTool.on("mousedown", function(evt) {
            if (that.target) {
                var me = evt.currentTarget;
                var scale = that.stage.scaleX;
                var thisPoint = {x: me.x * that.target.scaleX, y: me.y * that.target.scaleY};
                var startPoint = {x: evt.localX + thisPoint.x, y: thisPoint.y + evt.localY};
                var startRotation = that.target.rotation;
                var evtRotate = createjs.util.rotatePoint({x: evt.stageX, y: evt.stageY}, {x: 0, y: 0}, -startRotation);
                me.on("pressmove", function(e) {
                    var eRotate = createjs.util.rotatePoint({x: e.stageX, y: e.stageY}, {x: 0, y: 0}, -startRotation);
                    var h = (eRotate.x - evtRotate.x) / scale;
                    var v = (eRotate.y - evtRotate.y) / scale;
                    var endPoint = {x: startPoint.x + h, y: startPoint.y + v};
                    var angel = (Math.atan2(endPoint.x, endPoint.y) - Math.atan2(startPoint.x, startPoint.y)) * 180 / Math.PI;
                    that.target.rotation = startRotation - angel;
                    that.stage.update();
                });
                me.on("pressup", function() {
                    me.removeAllEventListeners("pressmove");
                });
            }
        });
        this.addChild(this.rotateTool);
        // update
        this.on("tick", function() {
            that.update();
        });

        this.visible = false;
    };

    // public methods:
    p.select = function(target) {
        if (target) {
            // copy object translation/transformation
            this.target = target;
            var bounds = target.getBounds();
            this.width = bounds.width;
            this.height = bounds.height;
            this.scaleX = target.scaleX;
            this.scaleY = target.scaleY;
            this.x = target.x;
            this.y = target.y;
            this.rotation = target.rotation;

            // borders
            this.border.graphics.clear();
            if(this.dashed) {
                this.border.graphics.setStrokeDash([5, 5], 0);
            } 
            this.border.graphics.beginStroke(this.border.color)
                .setStrokeStyle(1 / this.scaleY)
                .moveTo(-this.width / 2, -this.height / 2)
                .lineTo(this.width / 2, -this.height / 2)
                .moveTo(-this.width / 2, this.height / 2)
                .lineTo(this.width / 2, this.height / 2)
                    .setStrokeStyle(2 / this.scaleX)
                .moveTo(-this.width / 2, -this.height / 2)
                .lineTo( -this.width / 2, this.height / 2)
                .moveTo(this.width / 2, -this.height / 2)
                .lineTo( this.width / 2, this.height / 2);

            // tools scale
            var toolScaleX = 1 / (this.scaleX * this.stage.scaleX);
            var toolScaleY = 1 / (this.scaleY * this.stage.scaleY);

            // set move tool
            this.moveTool.x = 0;
            this.moveTool.y = 0;
            this.moveTool.scaleX = toolScaleX;
            this.moveTool.scaleY = toolScaleY;

            // scale tool
            this.scaleTool.x = bounds.width / 2;
            this.scaleTool.y = bounds.height / 2;
            this.scaleTool.scaleX = toolScaleX;
            this.scaleTool.scaleY = toolScaleY;

            // hScale tool
            this.hScaleTool.x = bounds.width / 2;
            this.hScaleTool.y = 0;
            this.hScaleTool.scaleX = toolScaleX;
            this.hScaleTool.scaleY = toolScaleY;

            // hScale tool
            this.vScaleTool.x = 0;
            this.vScaleTool.y = bounds.height / 2;
            this.vScaleTool.scaleX = toolScaleX;
            this.vScaleTool.scaleY = toolScaleY;

            // rotate tool
            this.rotateTool.x = bounds.width / 2;
            this.rotateTool.y = -bounds.height / 2;
            this.rotateTool.scaleX = toolScaleX;
            this.rotateTool.scaleY = toolScaleY;

            this.visible = true;
        } else {
            this.unselect();
        }
        return;
    };

    p.unselect = function() {
        this.target = null;
        this.visible = false;
    };

    p.update = function() {
        if (this.target) {
            this.select(this.target);
        }
    };

    p.setTitle = function(title) {
        title = title || "";
        this.stage.canvas.title = title;
    };

    p.setCursor = function(cursor) {
        var cursors = ["e-resize", "se-resize", "s-resize", "sw-resize", "w-resize", "nw-resize", "n-resize", "ne-resize"];
        var index = cursors.indexOf(cursor);
        if (index >= 0) {
            var angle = 45;
            var rotation = this.target.rotation;
            rotation = rotation + angle / 2;
            var newIndex = index + Math.floor(rotation / angle);
            newIndex = newIndex % (cursors.length);
            document.body.style.cursor = cursors[newIndex];
        } else {
            document.body.style.cursor = cursor;
        }
    };

    // overide methods
    // copy before override
    p.Container_draw = p.draw;
    p.draw = function(ctx, ignoreCache) {
        if (this.DisplayObject_draw(ctx, ignoreCache)) {
            return true;
        }
        this.Container_draw(ctx, ignoreCache);
        return true;
    };

    createjs.util.FreeTransformTool = FreeTransformTool;
}());