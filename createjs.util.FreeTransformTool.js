// namespace:
this.createjs = this.createjs || {};
// package
this.createjs.util = this.createjs.util || {};

// class
(function() {

    // utility functions
    var calcAngleDegrees = createjs.util.calcAngleDegrees;
    var calcDistance = createjs.util.calcDistance;
    var addEvent = createjs.util.addEvent;

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
    p.rotateTether = null;
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
        addEvent(document, "keydown", function(ev) {
            var ev = ev || window.event;
            that.activeKey = ev.keyCode;
        });
        addEvent(document, "keyup", function(ev) {
            that.activeKey = null;
        });

        // create border
        this.border = new createjs.Shape();
        this.border.color = lineColor;
        this.addChild(this.border);

        // line attaching rotate tool to border
        this.rotateTether = new createjs.Shape();
        this.rotateTether.color = lineColor;
        this.addChild(this.rotateTether);

        // create a transform control handle
        var handleStrokeWidth = 1
        function createHandle(name, cursor) {
            var shape = new createjs.Shape();
            shape.on("mouseover", function() {
                that.setTitle(name);
                that.setCursor(cursor);
            });
            shape.on("mouseout", function() {
                that.setTitle();
                that.setCursor('default');
            });
            shape.graphics
                .beginStroke(lineColor)
                .setStrokeStyle(handleStrokeWidth)
                .beginFill(color);
            shape.x = shape.regX = controlsSize / 2;
            shape.y = shape.regY = controlsSize / 2;
            return shape;
        }

        // init move tool
        this.moveTool = createHandle('Move', 'move');
        this.moveTool.graphics.drawEllipse(0, 0, controlsSize, controlsSize);
        this.moveTool.on("mousedown", function(evt) {
            if (that.target) {
                var tool = evt.currentTarget;
                var scale = that.stage.scaleX;
                var startPoint = {x: that.target.x, y: that.target.y};
                tool.on("pressmove", function(e) {
                    var h = (e.stageX - evt.stageX) / scale;
                    var v = (e.stageY - evt.stageY) / scale;
                    that.target.x = startPoint.x + h;
                    that.target.y = startPoint.y + v;
                    that.stage.update();
                });
                tool.on("pressup", function() {
                    tool.removeAllEventListeners("pressmove");
                });
            }
        });
        this.addChild(this.moveTool);

        // init hScale tool
        this.hScaleTool = createHandle('Stretch', 'e-resize');
        this.hScaleTool.graphics.drawRect(0, 0, controlsSize, controlsSize);
        this.hScaleTool.alpha = 0.8;
        this.hScaleTool.on("mousedown", function(downEvent) {
            if (that.target) {
                var tool = downEvent.currentTarget;
                var startScale = { x: that.target.scaleX, y: that.target.scaleY };
                tool.on("pressmove", function(moveEvent) {
                    var distStart = calcDistance(downEvent.stageX, downEvent.stageY, that.target.x, that.target.y);
                    var distEnd = calcDistance(moveEvent.stageX, moveEvent.stageY, that.target.x, that.target.y);
                    var rescaleFactor = distEnd / distStart;
                    that.target.scaleX = startScale.x * rescaleFactor;
                    that.stage.update();
                });
                tool.on("pressup", function() {
                    tool.removeAllEventListeners("pressmove");
                });
            }
        });
        this.addChild(this.hScaleTool);

        // init vScale tool
        this.vScaleTool = createHandle('Stretch', 's-resize');
        this.vScaleTool.graphics.drawRect(0, 0, controlsSize, controlsSize);
        this.vScaleTool.on("mousedown", function(downEvent) {
            if (that.target) {
                var tool = downEvent.currentTarget;
                var startScale = { x: that.target.scaleX, y: that.target.scaleY };
                tool.on("pressmove", function(moveEvent) {
                    var distStart = calcDistance(downEvent.stageX, downEvent.stageY, that.target.x, that.target.y);
                    var distEnd = calcDistance(moveEvent.stageX, moveEvent.stageY, that.target.x, that.target.y);
                    var rescaleFactor = distEnd / distStart;
                    that.target.scaleY = startScale.y * rescaleFactor;
                    that.stage.update();
                });
                tool.on("pressup", function() {
                    tool.removeAllEventListeners("pressmove");
                });
            }
        });
        this.addChild(this.vScaleTool);

        /**
         * Scale tool:
         * Changes display object's scale based on
         * the difference in position away/near the
         * registration point
         */
        this.scaleTool = createHandle('Resize', 'se-resize');
        this.scaleTool.graphics.drawRect(0, 0, controlsSize, controlsSize);
        this.scaleTool.on("mousedown", function(downEvent) {
            if (that.target) {
                var tool = downEvent.currentTarget;
                var startScale = { x: that.target.scaleX, y: that.target.scaleY };
                tool.on("pressmove", function(moveEvent) {
                    var distStart = calcDistance(downEvent.stageX, downEvent.stageY, that.target.x, that.target.y);
                    var distEnd = calcDistance(moveEvent.stageX, moveEvent.stageY, that.target.x, that.target.y);
                    var rescaleFactor = distEnd / distStart;
                    // evenly apply rescaling factor to both axis
                    that.target.scaleX = startScale.x * rescaleFactor;
                    that.target.scaleY = startScale.y * rescaleFactor;
                    that.stage.update();
                });
                tool.on("pressup", function() {
                    tool.removeAllEventListeners("pressmove");
                });
            }
        });
        this.addChild(this.scaleTool);

        /**
         * Rotate Tool:
         * Rotates around registration point
         * Work out delta angle between three points:
         *  1. drag start point
         *  2. registration point
         *  3. drag end/current point
         * Add that angle to the object's start rotation
         */
        this.rotateTool = createHandle('Rotate', 'pointer');
        this.rotateTool.graphics.drawEllipse(0, 0, controlsSize, controlsSize);
        this.rotateTool.on("mousedown", function(downEvent) {
            if (that.target) {
                var tool = downEvent.currentTarget;
                var startRotation = that.target.rotation;
                tool.on("pressmove", function(moveEvent) {
                    // the drag point is relative to the display object x,y position on the stage (it's registration point)
                    var relativeStartPoint = {
                        x: downEvent.stageX - that.target.x,
                        y: downEvent.stageY - that.target.y
                    };
                    var relativeEndPoint = {
                        x: moveEvent.stageX - that.target.x,
                        y: moveEvent.stageY - that.target.y
                    };
                    var endAngle = calcAngleDegrees(relativeEndPoint.x , relativeEndPoint.y);
                    var startAngle = calcAngleDegrees(relativeStartPoint.x, relativeStartPoint.y);
                    var deltaAngle = endAngle - startAngle;
                    that.target.rotation = startRotation + deltaAngle;
                    that.stage.update();
                });
                tool.on("pressup", function() {
                    tool.removeAllEventListeners("pressmove");
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

            // respect registration point of target
            this.regX = (-this.width / 2 ) + target.regX;
            this.regY = (-this.height / 2)  + target.regY;

            // borders
            this.border.graphics.clear();
            if(this.dashed) {
                this.border.graphics.setStrokeDash([5 / this.scaleX, 5 / this.scaleX], 0);
            } 
            this.border.graphics.beginStroke(this.border.color)
                .setStrokeStyle(1 / this.scaleY)
                .moveTo(-this.width / 2, -this.height / 2)
                .lineTo(this.width / 2, -this.height / 2)
                .moveTo(-this.width / 2, this.height / 2)
                .lineTo(this.width / 2, this.height / 2)
                .setStrokeStyle(1 / this.scaleX)
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

            // scale tool (bottom right)
            this.scaleTool.x = bounds.width / 2;
            this.scaleTool.y = bounds.height / 2;
            this.scaleTool.scaleX = toolScaleX;
            this.scaleTool.scaleY = toolScaleY;

            // hScale tool (right edge)
            this.hScaleTool.x = bounds.width / 2;
            this.hScaleTool.y = 0;
            this.hScaleTool.scaleX = toolScaleX;
            this.hScaleTool.scaleY = toolScaleY;

            // vScale tool (bottom edge)
            this.vScaleTool.x = 0;
            this.vScaleTool.y = bounds.height / 2;
            this.vScaleTool.scaleX = toolScaleX;
            this.vScaleTool.scaleY = toolScaleY;


            // rotate tool
            this.rotateTool.x = 0;
            this.rotateTool.y = -bounds.height;
            this.rotateTool.scaleX = toolScaleX;
            this.rotateTool.scaleY = toolScaleY;

            this.rotateTether.graphics.clear();
            if(this.dashed) {
                this.rotateTether.graphics.setStrokeDash([5 / this.scaleX, 5 / this.scaleY], 0);
            } 
            this.rotateTether.graphics
                .beginStroke(this.border.color)
                .setStrokeStyle(1 / this.scaleX)
                .moveTo(this.rotateTool.x, this.rotateTool.y)
                .lineTo(this.regX, -bounds.height/2);

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