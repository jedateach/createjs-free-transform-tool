import createEllipse from "./shapes/ellipse";
import createText from './shapes/text';
import createBitmap from './shapes/bitmap';
import TransformLayer from './transform-layer';
import { constrainObjectTo } from "../freetransform/helpers";

let canvas, stage;

let container;
let transformLayer;
let boundary;

function init() {
  canvas = document.getElementById("Designer");
  stage = new createjs.Stage(canvas);

  // enable touch interactions if supported on the current device:
  createjs.Touch.enable(stage);

  // enabled mouse over / out events
  stage.enableMouseOver(10);
  stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas

  // set up free transform tool
  transformLayer = new TransformLayer();
  stage.addChild(transformLayer);

  // define boundary
  boundary = new createjs.Rectangle();

  // load the source image:
  const image = new Image();
  image.src = "daisy.png";
  image.onload = handleImageLoad;
}

function addSelectableObject(displayObject) {
  transformLayer.makeSelectable(displayObject);
  container.addChild(displayObject);
}

function handleImageLoad(event) {
  const image = event.target;
  container = new createjs.Container();
  stage.addChildAt(container, 0);

  const ellipse = createEllipse();
  ellipse.x = canvas.width / 2;
  ellipse.y = canvas.height / 4;
  addSelectableObject(ellipse);

  const bitmap = createBitmap(image);
  bitmap.x = canvas.width / 2;
  bitmap.y = canvas.height / 6;
  addSelectableObject(bitmap);

  const text = createText();
  text.x = canvas.width / 2;
  text.y = canvas.height / 2.3;
  addSelectableObject(text);

  handleResize();
}

// update boundary, based on canvas size
function updateBoundary(boundary) {
  const top = canvas.height * 0.1;
  const left = canvas.width * 0.1;
  const padding = Math.min(top, left);
  boundary.setValues(
    padding,
    padding,
    canvas.width - padding * 2,
    canvas.height - padding * 2
  );
}

const containerElement = document.getElementById("CanvasContainer");
window.addEventListener("resize", handleResize);
function handleResize() {
  transformLayer.unselect();
  const w = containerElement.clientWidth; // -2 accounts for the border
  stage.canvas.width = w;

  updateBoundary(boundary);
  transformLayer.updateBoundary(boundary);
  constrainStageObjects(container.children);

  stage.update();
}

function constrainStageObjects(objects) {
  objects.forEach(function (obj) {
    constrainObjectTo(obj, boundary);
  });
}

init();
