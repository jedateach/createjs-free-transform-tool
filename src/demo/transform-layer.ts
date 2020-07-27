import FreeTransformTool from "freetransform";


export default class TransformLayer extends createjs.Container {

  transformTool = null;
  controlsSize = 10 * window.devicePixelRatio;
  boundaryLine;

  constructor() {
    super();
    this.transformTool = this.initFreeTransformTool();
    this.addChild(this.transformTool);

    this.boundaryLine = new createjs.Shape();
    this.addChild(this.boundaryLine);
  }

  protected initFreeTransformTool(): FreeTransformTool {
    const tool = new FreeTransformTool(
      "#057",
      true,
      "rgba(255,255,255,0.8)",
      this.controlsSize
    );
    tool.name = "transform";
    return tool;
  }

  updateBoundary(boundary: createjs.Rectangle): void {
    this.transformTool.boundary = boundary;
    drawBoundaryLine(this.boundaryLine, boundary);
  }

  makeSelectable(displayObject: createjs.DisplayObject) : void {
    displayObject.on("click", (evt: createjs.Event) => {
      evt.stopPropagation();
      this.transformTool.select(evt.currentTarget);
      this.stage.update();
    });
  }

  unselect() : void {
    this.transformTool.unselect();
  }

}

function drawBoundaryLine(boundaryLine: createjs.Shape, boundary: createjs.Rectangle) {
  console.log("drawing boundary...");
  boundaryLine.graphics
    .clear()
    .beginStroke("rgba(100, 100, 100, 0.5)")
    .setStrokeDash([20, 4])
    .drawRect(boundary.x, boundary.y, boundary.width, boundary.height);
}

