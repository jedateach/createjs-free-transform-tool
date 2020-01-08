// namespace:
var createjs = this.createjs;

// package
this.createjs.util = this.createjs.util || {};

// helpers

function calcAngleDegrees(x, y) {
  return (Math.atan2(y, x) * 180) / Math.PI;
}
this.createjs.util.calcAngleDegrees = calcAngleDegrees;

function calcDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
this.createjs.util.calcDistance = calcDistance;

/**
 * Get object's bounds or make some.
 * @param {*} obj
 */
function getObjBounds(obj) {
  let bounds = obj.getBounds();
  if (bounds) {
    return bounds;
  }
  return {
    x: obj.x,
    y: obj.y,
    width: obj.width,
    height: obj.height
  };
}

/**
 * Force a rectangle to always be inside another by
 * updating location and size.
 * @param {createjs.Rectangle} rect
 * @param {createjs.Rectangle} container
 */
function constrainRectTo(rect, container) {
  if (rect.width >= container.width) {
    rect.width = container.width;
  }
  if (rect.height >= container.height) {
    rect.height = container.height;
  }
  if (rect.x <= container.x) {
    rect.x = container.x;
  }
  if (rect.x + rect.width > container.x + container.width) {
    rect.x = container.x + container.width - rect.width;
  }
  if (rect.y <= container.y) {
    rect.y = container.y;
  }
  if (rect.y + rect.height > container.y + container.height) {
    rect.y = container.y + container.height - rect.height;
  }
  return rect;
}
this.createjs.util.constrainRectTo = constrainRectTo;

// constrains a display object to a given rect
function constrainObjectTo(obj, rect) {
  var bounds = getObjBounds(obj);
  bounds.x = obj.x - obj.regX * obj.scaleX;
  bounds.y = obj.y - obj.regY * obj.scaleY;
  var constrained = new createjs.Rectangle(
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height
  );
  constrainRectTo(constrained, rect);
  obj.x = constrained.x + obj.regX * obj.scaleX;
  obj.y = constrained.y + obj.regY * obj.scaleY;
  // TODO: work out new scale to apply, rather than overlapping
  var newScale = {
    x: constrained.width / bounds.width,
    y: constrained.height / bounds.height
  };
  obj.scaleX *= newScale.x;
  obj.scaleY *= newScale.y;
}
this.createjs.util.constrainObjectTo = constrainObjectTo;

// class
(function() {
  var FreeTransformTool = function(
    lineColor,
    dashed,
    color,
    controlsSize,
    boundary
  ) {
    this.initialize(lineColor, dashed, color, controlsSize, boundary);
  };
  var p = (FreeTransformTool.prototype = new createjs.Container());

  // public properties:
  p.moveTool = null;
  p.moveHitArea = null;
  p.scaleTool = null;
  p.hScaleTool = null;
  p.vScaleTool = null;
  p.rotateTool = null;
  p.target = null;
  p.border = null;
  p.dashed = null;
  p.boundary = null;

  // constructor:
  // copy before override
  p.Container_initialize = p.initialize;
  p.initialize = function(lineColor, dashed, color, controlsSize, boundary) {
    this.Container_initialize();

    // default values
    lineColor = lineColor || "#4285F4";
    color = color || "rgba(255,255,255,0.8)";
    controlsSize = controlsSize || 10;

    this.controlsDim = 0.15;
    this.controlStrokeThickness = 1;
    this.dashed = dashed === undefined ? true : dashed;

    this.boundary = boundary === undefined ? null : boundary;

    var that = this;

    // create border
    this.border = new createjs.Shape();
    this.border.color = lineColor;
    this.addChild(this.border);

    function addToolTip(shape, name, cursor) {
      shape.on("mouseover", function() {
        that.setTitle(name);
        that.setCursor(cursor);
      });
      shape.on("mouseout", function() {
        that.setTitle();
        that.setCursor("default");
      });
    }

    // create a transform control handle
    var handleStrokeWidth = this.controlStrokeThickness;
    function createHandle(name, cursor) {
      var shape = new createjs.Shape();
      addToolTip(shape, name, cursor);
      shape.graphics
        .beginStroke(lineColor)
        .setStrokeStyle(handleStrokeWidth)
        .beginFill(color);
      shape.x = shape.regX = controlsSize / 2;
      shape.y = shape.regY = controlsSize / 2;
      return shape;
    }

    /**
     * Move tool
     * Drag anywhere within the object bounds to move.
     * Click to deselect.
     */
    this.moveTool = new createjs.Shape();
    addToolTip(this.moveTool, "Move", "move");
    this.moveTool.on("mousedown", function(downEvent) {
      if (that.target) {
        var tool = downEvent.currentTarget;
        var tBounds = getObjBounds(that.target);
        var targetStart = that.target.clone();
        var scaledReg = {
          x: that.target.regX * that.target.scaleX,
          y: that.target.regY * that.target.scaleY
        };
        tool.on("pressmove", function(moveEvent) {
          that.alpha = that.controlsDim;
          var newLocation = {
            x: targetStart.x + moveEvent.stageX - downEvent.stageX,
            y: targetStart.y + moveEvent.stageY - downEvent.stageY
          };
          // constrain new location, if there is a boundary
          if (that.boundary) {
            var newBounds = new createjs.Rectangle(
              newLocation.x - scaledReg.x,
              newLocation.y - scaledReg.y,
              tBounds.width * that.target.scaleX,
              tBounds.height * that.target.scaleY
            );
            var constrainedBounds = constrainRectTo(newBounds, that.boundary);
            newLocation.x = constrainedBounds.x + scaledReg.x;
            newLocation.y = constrainedBounds.y + scaledReg.y;
          }
          that.target.set(newLocation);
          tool.dragDistance = calcDistance(
            downEvent.stageX,
            downEvent.stageY,
            moveEvent.stageX,
            moveEvent.stageY
          );
          that.stage.update();
        });
        tool.on("pressup", function(upEvent) {
          that.alpha = 1;
          tool.removeAllEventListeners("pressmove");
          upEvent.stopPropagation();
          tool.dragDistance = 0;
          that.stage.update();
        });
      }
    });
    // click to deselect
    this.moveTool.on("click", function(clickEvent) {
      // only deselect if there was very little movement on click
      // which helps on mobile devices, where it's difficult to
      // tap without dragging slightly
      var movedThreshold = 10;
      if (clickEvent.currentTarget.dragDistance < movedThreshold) {
        that.unselect();
        that.stage.update();
      }
    });
    this.moveHitArea = new createjs.Shape();
    this.moveTool.hitArea = this.moveHitArea;
    this.addChild(this.moveTool);

    // init hScale tool
    this.hScaleTool = createHandle("Stretch", "e-resize");
    this.hScaleTool.graphics.drawRect(0, 0, controlsSize, controlsSize);
    this.hScaleTool.on("mousedown", function(downEvent) {
      if (that.target) {
        var tool = downEvent.currentTarget;
        var tBounds = getObjBounds(that.target);
        var targetStart = that.target.clone().set({
          width: tBounds.width,
          height: tBounds.height
        });
        tool.on("pressmove", function(moveEvent) {
          that.alpha = that.controlsDim;
          var distStart = calcDistance(
            downEvent.stageX,
            downEvent.stageY,
            that.target.x,
            that.target.y
          );
          var distEnd = calcDistance(
            moveEvent.stageX,
            moveEvent.stageY,
            that.target.x,
            that.target.y
          );
          var rescaleFactor = distEnd / distStart;
          var updates = {
            scaleX: targetStart.scaleX * rescaleFactor
          };
          // constrain to bounds
          if (that.boundary) {
            var newBounds = new createjs.Rectangle(
              targetStart.x - targetStart.regX * updates.scaleX,
              targetStart.y - targetStart.regY * targetStart.scaleY,
              targetStart.width * updates.scaleX,
              targetStart.height
            );
            var constrainedBounds = constrainRectTo(newBounds, that.boundary);
            updates.scaleX = constrainedBounds.width / targetStart.width;
            updates.x = constrainedBounds.x + targetStart.regX * updates.scaleX;
          }
          that.target.set(updates);
          that.stage.update();
        });
        tool.on("pressup", function() {
          tool.removeAllEventListeners("pressmove");
          that.alpha = 1;
          that.stage.update();
        });
      }
    });
    this.addChild(this.hScaleTool);

    // init vScale tool
    this.vScaleTool = createHandle("Stretch", "s-resize");
    this.vScaleTool.graphics.drawRect(0, 0, controlsSize, controlsSize);
    this.vScaleTool.on("mousedown", function(downEvent) {
      if (that.target) {
        var tool = downEvent.currentTarget;
        var tBounds = getObjBounds(that.target);
        var targetStart = that.target.clone().set({
          width: tBounds.width,
          height: tBounds.height
        });
        tool.on("pressmove", function(moveEvent) {
          that.alpha = that.controlsDim;
          var distStart = calcDistance(
            downEvent.stageX,
            downEvent.stageY,
            that.target.x,
            that.target.y
          );
          var distEnd = calcDistance(
            moveEvent.stageX,
            moveEvent.stageY,
            that.target.x,
            that.target.y
          );
          var rescaleFactor = distEnd / distStart;
          var updates = {
            scaleY: targetStart.scaleY * rescaleFactor
          };
          // constrain to bounds
          if (that.boundary) {
            var newBounds = new createjs.Rectangle(
              targetStart.x - targetStart.regX * updates.scaleX,
              targetStart.y - targetStart.regY * targetStart.scaleY,
              targetStart.width,
              targetStart.height * updates.scaleY
            );
            var constrainedBounds = constrainRectTo(newBounds, that.boundary);
            updates.scaleY = constrainedBounds.height / targetStart.height;
            updates.y = constrainedBounds.y + targetStart.regY * updates.scaleY;
          }
          that.target.set(updates);
          that.stage.update();
        });
        tool.on("pressup", function() {
          tool.removeAllEventListeners("pressmove");
          that.alpha = 1;
          that.stage.update();
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
    this.scaleTool = createHandle("Resize", "se-resize");
    this.scaleTool.graphics.drawRect(0, 0, controlsSize, controlsSize);
    this.scaleTool.on("mousedown", function(downEvent) {
      if (that.target) {
        var tool = downEvent.currentTarget;
        var tBounds = getObjBounds(that.target);
        var targetStart = that.target.clone().set({
          width: tBounds.width,
          height: tBounds.height
        });
        tool.on("pressmove", function(moveEvent) {
          that.alpha = that.controlsDim;
          var distStart = calcDistance(
            downEvent.stageX,
            downEvent.stageY,
            that.target.x,
            that.target.y
          );
          var distEnd = calcDistance(
            moveEvent.stageX,
            moveEvent.stageY,
            that.target.x,
            that.target.y
          );
          var rescaleFactor = distEnd / distStart;
          var updates = {
            scaleX: targetStart.scaleX * rescaleFactor,
            scaleY: targetStart.scaleY * rescaleFactor
          };
          // constrain to bounds
          if (that.boundary) {
            var newBounds = new createjs.Rectangle(
              targetStart.x - targetStart.regX * updates.scaleX,
              targetStart.y - targetStart.regY * updates.scaleY,
              targetStart.width * updates.scaleX,
              targetStart.height * updates.scaleY
            );
            var constrainedBounds = constrainRectTo(newBounds, that.boundary);
            updates.scaleX = constrainedBounds.width / targetStart.width;
            updates.scaleY = constrainedBounds.height / targetStart.height;
            updates.x = constrainedBounds.x + targetStart.regX * updates.scaleX;
            updates.y = constrainedBounds.y + targetStart.regY * updates.scaleY;
          }
          that.target.set(updates);
          that.stage.update();
        });
        tool.on("pressup", function() {
          tool.removeAllEventListeners("pressmove");
          that.alpha = 1;
          that.stage.update();
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
    this.rotateTool = createHandle("Rotate", "pointer");
    this.rotateTool.graphics.drawEllipse(0, 0, controlsSize, controlsSize);
    this.rotateTool.on("mousedown", function(downEvent) {
      if (that.target) {
        var tool = downEvent.currentTarget;
        var startRotation = that.target.rotation;
        tool.on("pressmove", function(moveEvent) {
          that.alpha = 0.1;
          // the drag point is relative to the display object x,y position on the stage (it's registration point)
          var relativeStartPoint = {
            x: downEvent.stageX - that.target.x,
            y: downEvent.stageY - that.target.y
          };
          var relativeEndPoint = {
            x: moveEvent.stageX - that.target.x,
            y: moveEvent.stageY - that.target.y
          };
          var endAngle = calcAngleDegrees(
            relativeEndPoint.x,
            relativeEndPoint.y
          );
          var startAngle = calcAngleDegrees(
            relativeStartPoint.x,
            relativeStartPoint.y
          );
          var deltaAngle = endAngle - startAngle;
          // TTODO: constrain to bounds
          that.target.rotation = startRotation + deltaAngle;
          that.stage.update();
        });
        tool.on("pressup", function() {
          tool.removeAllEventListeners("pressmove");
          that.alpha = 1;
          that.stage.update();
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
      var bounds = getObjBounds(target);
      this.width = bounds.width;
      this.height = bounds.height;
      this.scaleX = target.scaleX;
      this.scaleY = target.scaleY;
      this.x = target.x;
      this.y = target.y;
      this.rotation = target.rotation;

      // respect registration point of target
      this.regX = -this.width / 2 + target.regX;
      this.regY = -this.height / 2 + target.regY;

      // borders
      this.border.graphics.clear();
      if (this.dashed) {
        this.border.graphics.setStrokeDash([5, 5], 0);
      }
      this.border.graphics
        .beginStroke(this.border.color)
        .setStrokeStyle(this.controlStrokeThickness, 0, 0, 10, true)
        .moveTo(-this.width / 2, -this.height / 2)
        .lineTo(this.width / 2, -this.height / 2)
        .moveTo(this.width / 2, this.height / 2)
        .lineTo(-this.width / 2, this.height / 2);
      if (this.dashed) {
        this.border.graphics.setStrokeDash([5, 5], 0);
      }
      this.border.graphics
        .setStrokeStyle(this.controlStrokeThickness, 0, 0, 10, true)
        .moveTo(-this.width / 2, -this.height / 2)
        .lineTo(-this.width / 2, this.height / 2)
        .moveTo(this.width / 2, this.height / 2)
        .lineTo(this.width / 2, -this.height / 2);

      // tools size should stay consistent
      var toolScaleX = 1 / (this.scaleX * this.stage.scaleX);
      var toolScaleY = 1 / (this.scaleY * this.stage.scaleY);

      // draw move hit area
      this.moveHitArea.graphics
        .clear()
        .beginFill("#000")
        .rect(-this.width / 2, -this.height / 2, this.width, this.height);

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
    var cursors = [
      "e-resize",
      "se-resize",
      "s-resize",
      "sw-resize",
      "w-resize",
      "nw-resize",
      "n-resize",
      "ne-resize"
    ];
    var index = cursors.indexOf(cursor);
    if (index >= 0) {
      var angle = 45;
      var rotation = this.target.rotation;
      rotation = rotation + angle / 2;
      var newIndex = index + Math.floor(rotation / angle);
      newIndex = newIndex % cursors.length;
      document.body.style.cursor = cursors[newIndex];
    } else {
      document.body.style.cursor = cursor;
    }
  };

  // override methods
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
})();
