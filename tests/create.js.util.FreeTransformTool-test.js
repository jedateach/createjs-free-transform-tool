describe("Smoke checks", function() {
  it("is can access createjs and free transform tool", function() {
    expect(createjs).toBeTruthy();
    expect(createjs.util.FreeTransformTool).toBeTruthy();
  });
});

describe("Free transform tool", function() {
  beforeEach(function() {
    this.canvas = getCanvas(200, 200);

    // Disable anti-aliasing during testing to get around browser inconsistencies
    let context = this.canvas.getContext("2d");
    context.imageSmoothingEnabled = false;

    this.stage = new createjs.Stage(this.canvas);
    this.container = new createjs.Container();
    this.stage.addChildAt(this.container, 0);

    this.top = new createjs.Container();
    this.stage.addChild(this.top);

    this.selectTool = new createjs.util.FreeTransformTool();
    this.top.addChild(this.selectTool);

    this.getImageData = () => {
      return this.canvas
        .getContext("2d")
        .getImageData(0, 0, this.canvas.width, this.canvas.height);
    };
  });

  it("can select an ellipse shape", async function() {
    var ellipse = new createjs.Shape();
    ellipse.x = this.canvas.width / 2;
    ellipse.y = this.canvas.height / 2;
    ellipse.setBounds(0, 0, 80, 120);
    ellipse.regX = ellipse.getBounds().width / 2;
    ellipse.regY = ellipse.getBounds().height / 2;
    ellipse.graphics.beginFill("#35E").drawEllipse(0, 0, 80, 120);
    this.container.addChild(ellipse);
    this.selectTool.select(ellipse);
    this.stage.update();

    let imgData = imgToImageData(await loadImage("img/selected-ellipse.png"));

    expect(this.getImageData()).toVisuallyEqual(imgData);
  });

  it("can select a rotated rectangle", async function() {
    var rectangle = new createjs.Shape();
    rectangle.x = this.canvas.width / 2;
    rectangle.y = this.canvas.height / 2;
    rectangle.setBounds(0, 0, 100, 130);
    rectangle.regX = rectangle.getBounds().width / 2;
    rectangle.regY = rectangle.getBounds().height / 2;
    rectangle.graphics.beginFill("#77a832").drawRect(0, 0, 100, 130);
    rectangle.rotation = 45;
    this.container.addChild(rectangle);
    this.selectTool.select(rectangle);
    this.stage.update();

    let imgData = imgToImageData(
      await loadImage("img/selected-rotated-rectangle.png")
    );

    expect(this.getImageData()).toVisuallyEqual(imgData);
  });

  it("can select text", async function() {
    var text = new createjs.Text("Hello\nWorld", "40px Arial", "#052865");
    var textBounds = text.getBounds();
    text.regX = textBounds.width / 2;
    text.regY = textBounds.height / 2;
    text.x = this.canvas.width / 2;
    text.y = this.canvas.height / 2.3;

    this.container.addChild(text);

    this.selectTool.select(text);
    this.stage.update();

    let imgData = imgToImageData(await loadImage("img/selected-text.png"));

    expect(this.getImageData()).toVisuallyEqual(imgData);
  });
});
