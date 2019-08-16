// add all types of DisplayObjects

var canvas, stage;

var mouseTarget;	// the display object currently under the mouse, or being dragged
var dragStarted;	// indicates whether we are currently in a drag operation
var offset;
var update = true;

var selectTool;

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
	let controlsSize = 10 * window.devicePixelRatio;
	selectTool = new createjs.util.FreeTransformTool("#057", true, "rgba(255,255,255,0.8)", controlsSize);
	selectTool.name = "transform";
	top.addChild(selectTool);

	// load the source image:
	var image = new Image();
	image.src = "demo/daisy.png";
	image.onload = handleImageLoad;

	handleResize();
}

function stop() {
	createjs.Ticker.removeEventListener("tick", tick);
}

function handleImageLoad(event) {
	var image = event.target;
	var bitmap;
	var container = new createjs.Container();
	stage.addChildAt(container, 0);

	// Shape
	var ellipse = new createjs.Shape();
	ellipse.x = (canvas.width / 2);
	ellipse.y = canvas.height / 4;
	ellipse.setBounds(0, 0, 200, 300);
	ellipse.regX = ellipse.getBounds().width / 2 | 0;
	ellipse.regY = ellipse.getBounds().height / 6 | 0;
	ellipse.graphics.setStrokeStyle(4)
		.beginRadialGradientFill(["#FFF","#35E"],[1,0],0,0,200,30,-50,40)
		.drawEllipse(0, 0, 200, 300);
	clickToSelect(ellipse);
	container.addChild(ellipse);

	// Bitmap
	bitmap = new createjs.Bitmap(image);
	bitmap.x = canvas.width / 2;
	bitmap.y = canvas.height / 6;
	bitmap.rotation = -25 | 0;
	bitmap.regX = bitmap.image.width / 2 | 0;
	bitmap.regY = bitmap.image.height / 2 | 0;
	bitmap.name = "flower";
	bitmap.cursor = "pointer";
	clickToSelect(bitmap);
	container.addChild(bitmap);
	
	// Text
	var text = new createjs.Text("Hello\nWorld", "100px Arial", "#ff7700");
	var textBounds = text.getBounds();
	text.regX = textBounds.width / 2;
	text.regY = textBounds.height / 2;
	text.outline = 5;
	text.x = canvas.width / 2;
	text.y = canvas.height / 2;
	text.rotation = 5 | 0;
	text.cursor = "pointer";
	
	var hit = new createjs.Shape();
	hit.graphics
		.beginFill("#000")
		.drawRect(0, 0, text.getBounds().width, text.getBounds().height);
	text.hitArea = hit;
	clickToSelect(text);
	container.addChild(text);

	createjs.Ticker.addEventListener("tick", tick);

}

function clickToSelect(displayObject) {
	displayObject.on("click", function (evt) {
		evt.stopPropagation();
		selectTool.select(evt.currentTarget, stage);
		update = true;
	});
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
    var w = containerElement.clientWidth; // -2 accounts for the border
	//var h = window.innerHeight-2;
	
    stage.canvas.width = w;
    //stage.canvas.height = h;
    stage.update();
}

init();