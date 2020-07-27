import { constrainRectTo, calcDistance, calcAngleDegrees } from "./helpers";

declare interface DisplayObjectWithSize extends createjs.DisplayObject {
  width: number;
  height: number;
}

export default class FreeTransformTool extends createjs.Container {
  width: number;
  height: number;

  target: DisplayObjectWithSize = null;

  moveTool: createjs.Shape = null;
  moveHitArea: createjs.Shape = null;
  scaleTool: createjs.Shape = null;
  hScaleTool: createjs.Shape = null;
  vScaleTool: createjs.Shape = null;
  rotateTool: createjs.Shape = null;

  dashed: boolean;
  boundary: createjs.Rectangle = null;

  color: string;
  lineColor: string;

  controlsDim = 0.15;
  controlsSize: number;
  controlStrokeThickness = 1;

  visible = false;

  private border = null;

  constructor(
    lineColor = "#4285F4",
    dashed = true,
    color = "rgba(255,255,255,0.8)",
    controlsSize = 10,
    boundary = null
  ) {
    super();

    this.lineColor = lineColor;
    this.dashed = dashed;
    this.color = color;
    this.controlsSize = controlsSize;
    this.boundary = boundary;

    this.border = new createjs.Shape();
    this.border.color = lineColor;
    this.addChild(this.border);

    this.createMoveTool();
    this.createHorizontalScaleTool();
    this.createVerticalScaleTool();
    this.createScaleTool();
    this.createRotateTool();

    this.on("tick", () => {
      this.update();
    });
  }

  addToolTip(shape, name, cursor) {
    shape.on("mouseover", () => {
      this.setTitle(name);
      this.setCursor(cursor);
    });
    shape.on("mouseout", () => {
      this.setTitle();
      this.setCursor("default");
    });
  }

  setTitle(title = "") {
    if (this.stage.canvas instanceof HTMLCanvasElement) {
     this.stage.canvas.title = title;
    }
  }

  setCursor(cursor) {
    const cursors = [
      "e-resize",
      "se-resize",
      "s-resize",
      "sw-resize",
      "w-resize",
      "nw-resize",
      "n-resize",
      "ne-resize",
    ];
    const index = cursors.indexOf(cursor);
    if (index >= 0) {
      const angle = 45;
      let rotation = this.target.rotation;
      rotation = rotation + angle / 2;
      let newIndex = index + Math.floor(rotation / angle);
      newIndex = newIndex % cursors.length;
      document.body.style.cursor = cursors[newIndex];
    } else {
      document.body.style.cursor = cursor;
    }
  }

  createHandle(name, cursor) {
    const shape = new createjs.Shape();
    this.addToolTip(shape, name, cursor);
    shape.graphics
      .beginStroke(this.lineColor)
      .setStrokeStyle(this.controlStrokeThickness)
      .beginFill(this.color);
    shape.x = shape.regX = this.controlsSize / 2;
    shape.y = shape.regY = this.controlsSize / 2;
    return shape;
  }

  // public methods:
  select(target) {
    if (target) {
      // copy object translation/transformation
      this.target = target;
      const bounds = target.getBounds();
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
      const toolScaleX = 1 / (this.scaleX * this.stage.scaleX);
      const toolScaleY = 1 / (this.scaleY * this.stage.scaleY);

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
  }

  unselect() : void {
    this.target = null;
    this.visible = false;
  }

  update() : void {
    if (this.target) {
      this.select(this.target);
    }
  }

  /**
   * Move tool
   * Drag anywhere within the object bounds to move.
   * Click to deselect.
   */
  private createMoveTool() {
    this.moveTool = new createjs.Shape();
    this.addToolTip(this.moveTool, "Move", "move");
    this.moveTool.on("mousedown", (downEvent: createjs.MouseEvent) => {
      if (this.target) {
        const tool = downEvent.currentTarget;
        const tBounds = this.target.getBounds();
        const targetStart = this.target.clone();
        const scaledReg = {
          x: this.target.regX * this.target.scaleX,
          y: this.target.regY * this.target.scaleY,
        };
        tool.on("pressmove", (moveEvent: createjs.MouseEvent) => {
          this.alpha = this.controlsDim;
          const newLocation = {
            x: targetStart.x + moveEvent.stageX - downEvent.stageX,
            y: targetStart.y + moveEvent.stageY - downEvent.stageY,
          };
          // constrain new location, if there is a boundary
          if (this.boundary) {
            const newBounds = new createjs.Rectangle(
              newLocation.x - scaledReg.x,
              newLocation.y - scaledReg.y,
              tBounds.width * this.target.scaleX,
              tBounds.height * this.target.scaleY
            );
            const constrainedBounds = constrainRectTo(newBounds, this.boundary);
            newLocation.x = constrainedBounds.x + scaledReg.x;
            newLocation.y = constrainedBounds.y + scaledReg.y;
          }
          this.target.set(newLocation);
          tool.dragDistance = calcDistance(
            downEvent.stageX,
            downEvent.stageY,
            moveEvent.stageX,
            moveEvent.stageY
          );
          this.stage.update();
        });
        tool.on("pressup", (upEvent) => {
          this.alpha = 1;
          tool.removeAllEventListeners("pressmove");
          upEvent.stopPropagation();
          tool.dragDistance = 0;
          this.stage.update();
        });
      }
    });
    // click to deselect
    this.moveTool.on("click", (clickEvent: createjs.MouseEvent) => {
      // only deselect if there was very little movement on click
      // which helps on mobile devices, where it's difficult to
      // tap without dragging slightly
      const movedThreshold = 10;
      if (clickEvent.currentTarget.dragDistance < movedThreshold) {
        this.unselect();
        this.stage.update();
      }
    });
    this.moveHitArea = new createjs.Shape();
    this.moveTool.hitArea = this.moveHitArea;
    this.addChild(this.moveTool);
  }

  // init hScale tool
  private createHorizontalScaleTool() {
    this.hScaleTool = this.createHandle("Stretch", "e-resize");
    this.hScaleTool.graphics.drawRect(
      0,
      0,
      this.controlsSize,
      this.controlsSize
    );
    this.hScaleTool.on("mousedown", (downEvent: createjs.MouseEvent) => {
      if (this.target) {
        const tool = downEvent.currentTarget;
        const tBounds = this.target.getBounds();
        const targetStart = <DisplayObjectWithSize>this.target.clone().set({
          width: tBounds.width,
          height: tBounds.height,
        });
        tool.on("pressmove", (moveEvent: createjs.MouseEvent) => {
          this.alpha = this.controlsDim;
          const distStart = calcDistance(
            downEvent.stageX,
            downEvent.stageY,
            this.target.x,
            this.target.y
          );
          const distEnd = calcDistance(
            moveEvent.stageX,
            moveEvent.stageY,
            this.target.x,
            this.target.y
          );
          const rescaleFactor = distEnd / distStart;
          const updates : any = {
            scaleX: targetStart.scaleX * rescaleFactor
          };
          // constrain to bounds
          if (this.boundary) {
            const newBounds = new createjs.Rectangle(
              targetStart.x - targetStart.regX * updates.scaleX,
              targetStart.y - targetStart.regY * targetStart.scaleY,
              targetStart.width * updates.scaleX,
              targetStart.height
            );
            const constrainedBounds = constrainRectTo(newBounds, this.boundary);
            updates.scaleX = constrainedBounds.width / targetStart.width;
            updates.x = constrainedBounds.x + targetStart.regX * updates.scaleX;
          }
          this.target.set(updates);
          this.stage.update();
        });
        tool.on("pressup", () => {
          tool.removeAllEventListeners("pressmove");
          this.alpha = 1;
          this.stage.update();
        });
      }
    });
    this.addChild(this.hScaleTool);
  }

  // init vScale tool
  private createVerticalScaleTool() {
    this.vScaleTool = this.createHandle("Stretch", "s-resize");
    this.vScaleTool.graphics.drawRect(
      0,
      0,
      this.controlsSize,
      this.controlsSize
    );
    this.vScaleTool.on("mousedown", (downEvent: createjs.MouseEvent) => {
      if (this.target) {
        const tool = downEvent.currentTarget;
        const tBounds = this.target.getBounds();
        const targetStart = <DisplayObjectWithSize>this.target.clone().set({
          width: tBounds.width,
          height: tBounds.height,
        });
        tool.on("pressmove", (moveEvent: createjs.MouseEvent) => {
          this.alpha = this.controlsDim;
          const distStart = calcDistance(
            downEvent.stageX,
            downEvent.stageY,
            this.target.x,
            this.target.y
          );
          const distEnd = calcDistance(
            moveEvent.stageX,
            moveEvent.stageY,
            this.target.x,
            this.target.y
          );
          const rescaleFactor = distEnd / distStart;
          const updates : any = {
            scaleY: targetStart.scaleY * rescaleFactor
          };
          // constrain to bounds
          if (this.boundary) {
            const newBounds = new createjs.Rectangle(
              targetStart.x - targetStart.regX * targetStart.scaleX,
              targetStart.y - targetStart.regY * updates.scaleY,
              targetStart.width,
              targetStart.height * updates.scaleY
            );
            const constrainedBounds = constrainRectTo(newBounds, this.boundary);
            updates.scaleY = constrainedBounds.height / targetStart.height;
            updates.y = constrainedBounds.y + targetStart.regY * updates.scaleY;
          }
          this.target.set(updates);
          this.stage.update();
        });
        tool.on("pressup", () => {
          tool.removeAllEventListeners("pressmove");
          this.alpha = 1;
          this.stage.update();
        });
      }
    });
    this.addChild(this.vScaleTool);
  }

  /**
   * Scale tool:
   * Changes display object's scale based on
   * the difference in position away/near the
   * registration point
   */
  private createScaleTool() {
    this.scaleTool = this.createHandle("Resize", "se-resize");
    this.scaleTool.graphics.drawRect(
      0,
      0,
      this.controlsSize,
      this.controlsSize
    );
    this.scaleTool.on("mousedown", (downEvent: createjs.MouseEvent) => {
      if (this.target) {
        const tool = downEvent.currentTarget;
        const tBounds = this.target.getBounds();
        const targetStart = <DisplayObjectWithSize>this.target.clone().set({
          width: tBounds.width,
          height: tBounds.height,
        });
        tool.on("pressmove", (moveEvent: createjs.MouseEvent) => {
          this.alpha = this.controlsDim;
          const distStart = calcDistance(
            downEvent.stageX,
            downEvent.stageY,
            this.target.x,
            this.target.y
          );
          const distEnd = calcDistance(
            moveEvent.stageX,
            moveEvent.stageY,
            this.target.x,
            this.target.y
          );
          const rescaleFactor = distEnd / distStart;
          const updates : any = {
            scaleX: targetStart.scaleX * rescaleFactor,
            scaleY: targetStart.scaleY * rescaleFactor,
          };
          // constrain to bounds
          if (this.boundary) {
            const newBounds = new createjs.Rectangle(
              targetStart.x - targetStart.regX * updates.scaleX,
              targetStart.y - targetStart.regY * updates.scaleY,
              targetStart.width * updates.scaleX,
              targetStart.height * updates.scaleY
            );
            const constrainedBounds = constrainRectTo(newBounds, this.boundary);
            updates.scaleX = constrainedBounds.width / targetStart.width;
            updates.scaleY = constrainedBounds.height / targetStart.height;
            updates.x = constrainedBounds.x + targetStart.regX * updates.scaleX;
            updates.y = constrainedBounds.y + targetStart.regY * updates.scaleY;
          }
          this.target.set(updates);
          this.stage.update();
        });
        tool.on("pressup", () => {
          tool.removeAllEventListeners("pressmove");
          this.alpha = 1;
          this.stage.update();
        });
      }
    });
    this.addChild(this.scaleTool);
  }

  /**
   * Rotate Tool:
   * Rotates around registration point
   * Work out delta angle between three points:
   *  1. drag start point
   *  2. registration point
   *  3. drag end/current point
   * Add that angle to the object's start rotation
   */
  private createRotateTool() {
    this.rotateTool = this.createHandle("Rotate", "pointer");
    this.rotateTool.graphics.drawEllipse(
      0,
      0,
      this.controlsSize,
      this.controlsSize
    );
    this.rotateTool.on("mousedown", (downEvent: createjs.MouseEvent) => {
      if (this.target) {
        const tool = downEvent.currentTarget;
        const startRotation = this.target.rotation;
        tool.on("pressmove", (moveEvent: createjs.MouseEvent) => {
          this.alpha = 0.1;
          // the drag point is relative to the display object x,y position on the stage (it's registration point)
          const relativeStartPoint = {
            x: downEvent.stageX - this.target.x,
            y: downEvent.stageY - this.target.y,
          };
          const relativeEndPoint = {
            x: moveEvent.stageX - this.target.x,
            y: moveEvent.stageY - this.target.y,
          };
          const endAngle = calcAngleDegrees(
            relativeEndPoint.x,
            relativeEndPoint.y
          );
          const startAngle = calcAngleDegrees(
            relativeStartPoint.x,
            relativeStartPoint.y
          );
          const deltaAngle = endAngle - startAngle;
          // TODO: constrain to bounds
          this.target.rotation = startRotation + deltaAngle;
          this.stage.update();
        });
        tool.on("pressup", () => {
          tool.removeAllEventListeners("pressmove");
          this.alpha = 1;
          this.stage.update();
        });
      }
    });
    this.addChild(this.rotateTool);
  }
}
