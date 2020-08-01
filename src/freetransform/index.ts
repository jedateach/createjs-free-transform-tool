import {
  constrainRectTo,
  calcDistance,
  calcAngleDegrees,
  reorientResizeCursor,
} from "./helpers";
import { HandlePosition, handlePositionToRectPoint } from "./HandlePosition";

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

  handles = [];

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

    this.moveTool = this.createMoveTool();
    this.addTool(this.moveTool);
    this.addHandle(this.createScaleTool(), HandlePosition.BOTTOM_RIGHT);
    this.addHandle(
      this.createHorizontalScaleTool(),
      HandlePosition.MIDDLE_RIGHT
    );
    this.addHandle(
      this.createVerticalScaleTool(),
      HandlePosition.BOTTOM_CENTER
    );
    this.addHandle(this.createRotateTool(), HandlePosition.TOP_RIGHT);

    this.on("tick", () => {
      this.update();
    });
  }

  private addHandle(handle, position: HandlePosition) {
    handle.position = position;
    this.handles.push(handle);
    this.addTool(handle);
  }

  private addTool(tool) {
    this.addChild(tool);
    tool.on("mousedown", () => this.dimHandles());
    tool.on("pressmove", () => this.stage.update());
    tool.on("pressup", () => {
      this.resetHandles();
      this.stage.update();
    });
  }

  select(target: DisplayObjectWithSize): void {
    if (!target) {
      this.unselect();
      return;
    }
    this.target = target;
    this.updateTools();
    this.visible = true;
  }

  unselect(): void {
    this.target = null;
    this.visible = false;
  }

  update(): void {
    if (this.target) {
      this.updateTools();
    }
  }

  private dimHandles() {
    this.alpha = this.controlsDim;
  }

  private resetHandles() {
    this.alpha = 1;
  }

  private addToolTip(shape, name, cursor): void {
    shape.on("mouseover", () => {
      this.setTitle(name);
      let newCursor = cursor;
      if (this.target) {
        newCursor = reorientResizeCursor(cursor, this.target.rotation);
      }
      this.setCursor(newCursor);
    });
    shape.on("mouseout", () => {
      this.setTitle();
      this.setCursor("default");
    });
  }

  private setTitle(title = ""): void {
    if (this.stage.canvas instanceof HTMLCanvasElement) {
      this.stage.canvas.title = title;
    }
  }

  private setCursor(cursor: string): void {
    document.body.style.cursor = cursor;
  }

  private createHandle(name, cursor): createjs.Shape {
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

  // Position the transform controls according to the target bounds
  private reorientToTarget(target: createjs.DisplayObject): void {
    const bounds = target.getBounds();
    this.width = bounds.width;
    this.height = bounds.height;
    this.scaleX = target.scaleX;
    this.scaleY = target.scaleY;
    this.x = target.x;
    this.y = target.y;
    this.rotation = target.rotation;

    // respect registration point of target
    this.regX = -bounds.width / 2 + target.regX;
    this.regY = -bounds.height / 2 + target.regY;
  }

  private redrawBorder(
    graphics,
    top: number,
    right: number,
    bottom: number,
    left: number
  ): void {
    graphics.clear();
    graphics.setStrokeStyle(this.controlStrokeThickness, 0, 0, 10, true);
    if (this.dashed) {
      graphics.setStrokeDash([5, 5], 0);
    }
    graphics
      .beginStroke(this.border.color)
      .moveTo(left, top)
      .lineTo(right, top)
      .moveTo(right, bottom)
      .lineTo(left, bottom)
      .moveTo(left, top)
      .lineTo(left, bottom)
      .moveTo(right, bottom)
      .lineTo(right, top);
  }

  private updateTools() {
    this.reorientToTarget(this.target);

    // horizontal and vertical edges
    const leftEdge = -this.width / 2;
    const rightEdge = this.width / 2;
    const topEdge = -this.height / 2;
    const bottomEdge = this.height / 2;
    this.redrawBorder(
      this.border.graphics,
      topEdge,
      rightEdge,
      bottomEdge,
      leftEdge
    );
    // tools size should stay consistent
    // draw move hit area
    this.moveHitArea.graphics
      .clear()
      .beginFill("#000")
      .rect(leftEdge, topEdge, this.width, this.height);

    const boundsRect = new createjs.Rectangle(
      leftEdge,
      topEdge,
      this.width,
      this.height
    );

    this.repositionHandles(boundsRect);
    this.resizeHandles();
  }

  private resizeHandles() {
    const toolScaleX = 1 / (this.scaleX * this.stage.scaleX);
    const toolScaleY = 1 / (this.scaleY * this.stage.scaleY);
    this.handles.forEach((handle) => {
      handle.scaleX = toolScaleX;
      handle.scaleY = toolScaleY;
    });
  }

  private repositionHandles(boundsRect) {
    // TODO: reduce memory consumption here
    this.handles.forEach((handle) => {
      const point = handlePositionToRectPoint(handle.position, boundsRect);
      handle.x = point.x;
      handle.y = point.y;
    });
  }

  /**
   * Move tool
   * Drag anywhere within the object bounds to move.
   * Click to deselect.
   */
  private createMoveTool() {
    let dragDistance = 0;
    const moveTool = new createjs.Shape();
    this.addToolTip(moveTool, "Move", "move");

    let tBounds;
    let targetStart;
    let startX;
    let startY;
    let scaledReg;

    moveTool.on("mousedown", (downEvent: createjs.MouseEvent) => {
      tBounds = this.target.getBounds();
      targetStart = this.target.clone();
      startX = downEvent.stageX;
      startY = downEvent.stageY;
      scaledReg = {
        x: this.target.regX * this.target.scaleX,
        y: this.target.regY * this.target.scaleY,
      };
    });

    moveTool.on("pressmove", (moveEvent: createjs.MouseEvent) => {
      const newLocation = {
        x: targetStart.x + moveEvent.stageX - startX,
        y: targetStart.y + moveEvent.stageY - startY,
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
      dragDistance = calcDistance(
        startX,
        startY,
        moveEvent.stageX,
        moveEvent.stageY
      );
    });

    moveTool.on("pressup", (upEvent: createjs.MouseEvent) => {
      upEvent.stopPropagation();
      dragDistance = 0;
    });

    // click to deselect
    moveTool.on("click", () => {
      // only deselect if there was very little movement on click
      // which helps on mobile devices, where it's difficult to
      // tap without dragging slightly
      const MOVED_THRESHOLD = 10;
      if (dragDistance < MOVED_THRESHOLD) {
        this.unselect();
        this.stage.update();
      }
    });
    this.moveHitArea = new createjs.Shape();
    moveTool.hitArea = this.moveHitArea;
    return moveTool;
  }

  // init hScale tool
  private createHorizontalScaleTool() {
    const hScaleTool = this.createHandle("Stretch", "e-resize");
    hScaleTool.graphics.drawRect(0, 0, this.controlsSize, this.controlsSize);

    let tBounds;
    let targetStart;
    let startX;
    let startY;

    hScaleTool.on("mousedown", (downEvent: createjs.MouseEvent) => {
      tBounds = this.target.getBounds();
      targetStart = <DisplayObjectWithSize>this.target.clone().set({
        width: tBounds.width,
        height: tBounds.height,
      });
      startX = downEvent.stageX;
      startY = downEvent.stageY;
    });
    hScaleTool.on("pressmove", (moveEvent: createjs.MouseEvent) => {
      const distStart = calcDistance(startX, startY, this.x, this.y);
      const distEnd = calcDistance(
        moveEvent.stageX,
        moveEvent.stageY,
        this.x,
        this.y
      );
      const rescaleFactor = distEnd / distStart;
      const updates: any = {
        scaleX: targetStart.scaleX * rescaleFactor,
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
    });

    return hScaleTool;
  }

  // init vScale tool
  private createVerticalScaleTool() {
    const vScaleTool = this.createHandle("Stretch", "s-resize");
    vScaleTool.graphics.drawRect(0, 0, this.controlsSize, this.controlsSize);

    let tBounds;
    let targetStart;
    let startX;
    let startY;

    vScaleTool.on("mousedown", (downEvent: createjs.MouseEvent) => {
      tBounds = this.target.getBounds();
      targetStart = <DisplayObjectWithSize>this.target.clone().set({
        width: tBounds.width,
        height: tBounds.height,
      });
      startX = downEvent.stageX;
      startY = downEvent.stageY;
    });
    vScaleTool.on("pressmove", (moveEvent: createjs.MouseEvent) => {
      const distStart = calcDistance(
        startX,
        startY,
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
      const updates: any = {
        scaleY: targetStart.scaleY * rescaleFactor,
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
    });

    return vScaleTool;
  }

  /**
   * Scale tool:
   * Changes display object's scale based on
   * the difference in position away/near the
   * registration point
   */
  private createScaleTool() {
    const scaleTool = this.createHandle("Resize", "se-resize");
    scaleTool.graphics.drawRect(0, 0, this.controlsSize, this.controlsSize);

    let tBounds;
    let targetStart;
    let startX;
    let startY;

    scaleTool.on("mousedown", (downEvent: createjs.MouseEvent) => {
      tBounds = this.target.getBounds();
      targetStart = <DisplayObjectWithSize>this.target.clone().set({
        width: tBounds.width,
        height: tBounds.height,
      });
      startX = downEvent.stageX;
      startY = downEvent.stageY;
    });

    scaleTool.on("pressmove", (moveEvent: createjs.MouseEvent) => {
      const distStart = calcDistance(startX, startY, this.x, this.y);
      const distEnd = calcDistance(
        moveEvent.stageX,
        moveEvent.stageY,
        this.x,
        this.y
      );
      const rescaleFactor = distEnd / distStart;
      const updates: any = {
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
    });

    return scaleTool;
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
    const rotateTool = this.createHandle("Rotate", "pointer");
    rotateTool.graphics.drawEllipse(0, 0, this.controlsSize, this.controlsSize);

    let startRotation;
    let startX;
    let startY;

    rotateTool.on("mousedown", (downEvent: createjs.MouseEvent) => {
      startRotation = this.rotation;
      startX = downEvent.stageX;
      startY = downEvent.stageY;
    });

    rotateTool.on("pressmove", (moveEvent: createjs.MouseEvent) => {
      // the drag point is relative to the display object x,y position on the stage (it's registration point)
      const relativeStartPoint = {
        x: startX - this.x,
        y: startY - this.y,
      };
      const relativeEndPoint = {
        x: moveEvent.stageX - this.x,
        y: moveEvent.stageY - this.y,
      };
      const endAngle = calcAngleDegrees(relativeEndPoint.x, relativeEndPoint.y);
      const startAngle = calcAngleDegrees(
        relativeStartPoint.x,
        relativeStartPoint.y
      );
      const deltaAngle = endAngle - startAngle;
      // TODO: constrain to bounds
      this.target.rotation = startRotation + deltaAngle;
    });

    return rotateTool;
  }
}
