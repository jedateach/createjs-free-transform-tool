var canvas, stage;
var update = true;

var boundary;
var boundaryLine;

var selectTool;

var container;

function init() {
  // create stage and point it to the canvas:
  canvas = document.getElementById("Designer");
  stage = new createjs.Stage(canvas);

  // enable touch interactions if supported on the current device:
  createjs.Touch.enable(stage);

  // enabled mouse over / out events
  stage.enableMouseOver(10);
  stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas

  // set up free transform tool
  var top = new createjs.Container();
  top.name = "top";
  stage.addChild(top);

  // define boundary
  boundary = new createjs.Rectangle();
  updateBoundary(boundary);
  boundaryLine = new createjs.Shape();
  top.addChild(boundaryLine);

  let controlsSize = 10 * window.devicePixelRatio;
  selectTool = new createjs.util.FreeTransformTool(
    "#057",
    true,
    "rgba(255,255,255,0.8)",
    controlsSize,
    boundary
  );
  selectTool.name = "transform";

  top.addChild(selectTool);

  // load the source image:
  var image = new Image();
  image.src = "demo/daisy.png";
  image.onload = handleImageLoad;
}

function updateBoundary(boundary) {
  var top = canvas.height * 0.1;
  var left = canvas.width * 0.1;
  var padding = Math.min(top, left);
  boundary.setValues(
    padding,
    padding,
    canvas.width - padding * 2,
    canvas.height - padding * 2
  );
}

function drawBoundary() {
  boundaryLine.graphics
    .clear()
    .beginStroke("rgba(100, 100, 100, 0.5)")
    .setStrokeDash([20, 4])
    .drawRect(boundary.x, boundary.y, boundary.width, boundary.height);
}

function constrainStageObjects(objects) {
  objects.forEach(function(obj) {
    createjs.util.constrainObjectTo(obj, boundary);
  });
}

function handleImageLoad(event) {
  container = new createjs.Container();
  stage.addChildAt(container, 0);

  container.addChild(createEllipse());
  container.addChild(createBitmap(event.target));
  container.addChild(createText());
  container.addChild(createTxtJs());

  createjs.Ticker.addEventListener("tick", tick);

  handleResize();
}

function clickToSelect(displayObject) {
  displayObject.on("click", function(evt) {
    evt.stopPropagation();
    selectTool.select(evt.currentTarget, stage);
    update = true;
  });
}

function createEllipse() {
  var ellipse = new createjs.Shape();
  ellipse.x = canvas.width / 2;
  ellipse.y = canvas.height / 4;
  ellipse.setBounds(0, 0, 200, 300);
  ellipse.regX = (ellipse.getBounds().width / 2) | 0;
  ellipse.regY = (ellipse.getBounds().height / 6) | 0;
  ellipse.graphics
    .setStrokeStyle(4)
    .beginRadialGradientFill(["#FFF", "#35E"], [1, 0], 0, 0, 200, 30, -50, 40)
    .drawEllipse(0, 0, 200, 300);
  clickToSelect(ellipse);
  return ellipse;
}

function createBitmap(image) {
  var bitmap = new createjs.Bitmap(image);
  bitmap.x = canvas.width / 2;
  bitmap.y = canvas.height / 6;
  bitmap.rotation = -25 | 0;
  bitmap.regX = (bitmap.image.width / 2) | 0;
  bitmap.regY = (bitmap.image.height / 2) | 0;
  bitmap.name = "flower";
  bitmap.cursor = "pointer";
  clickToSelect(bitmap);
  return bitmap;
}

function createText() {
  var text = new createjs.Text("Hello\nWorld", "70px Arial", "#052865");
  var textBounds = text.getBounds();
  text.regX = textBounds.width / 2;
  text.regY = textBounds.height / 2;
  text.outline = 5;
  text.x = canvas.width / 2;
  text.y = canvas.height / 2.3;
  text.rotation = 5 | 0;
  text.cursor = "pointer";
  var hit = new createjs.Shape();
  hit.graphics
    .beginFill("#000")
    .drawRect(0, 0, text.getBounds().width, text.getBounds().height);
  text.hitArea = hit;
  clickToSelect(text);
  return text;
}

var rainbowPallette = [
  "#FEA3AA",
  "#F8B88B",
  "#FAF884",
  "#BAED91",
  "#B2CEFE",
  "#F2A2E8"
];

function createTxtJs() {
  let value = "Hello txt.js";
  let style = value.split("").map(function(ch, idx) {
    return { fillColor: rainbowPallette[idx % rainbowPallette.length] };
  });
  var txt = new window.txt.Text({
    text: value,
    font: "lobster",
    align: window.txt.Align.TOP_LEFT,
    singleLine: true,
    autoReduce: true,
    autoExpand: true,
    minSize: 70,
    maxTracking: 260,
    tracking: 2,
    lineHeight: 120,
    width: 600,
    height: 120,
    size: 130,
    strokeWidth: 1,
    strokeColor: "#000",
    style: style,
    x: canvas.width / 4,
    y: (canvas.height / 4) * 3
  });
  txt.regX = txt.width / 2;
  txt.regY = txt.height / 2;
  clickToSelect(txt);
  return txt;
}

function tick(event) {
  // this set makes it so the stage only re-renders when an event handler indicates a change has happened.
  if (update) {
    update = false; // only update once
    stage.update(event);
  }
}

var containerElement = document.getElementById("CanvasContainer");
window.addEventListener("resize", handleResize);
function handleResize() {
  selectTool.unselect();
  var w = containerElement.clientWidth; // -2 accounts for the border
  //var h = window.innerHeight-2;

  stage.canvas.width = w;
  //stage.canvas.height = h;

  updateBoundary(boundary);
  // TODO: constrain all elements
  constrainStageObjects(container.children);

  drawBoundary();
  stage.update();
}

window.onload = init;
