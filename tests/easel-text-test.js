describe("Text in EaselJS", function() {
  beforeEach(function() {
    this.canvas = getCanvas(200, 200);

    // Disable anti-aliasing during testing to get around browser inconsistencies
    let context = this.canvas.getContext("2d");
    context.imageSmoothingEnabled = false;

    this.stage = new createjs.Stage(this.canvas);
    this.container = new createjs.Container();
    this.stage.addChildAt(this.container, 0);

    this.getImageData = () => {
      return this.canvas
        .getContext("2d")
        .getImageData(0, 0, this.canvas.width, this.canvas.height);
    };

    this.createText = () => {
      var text = new createjs.Text("Hello\nWorld", "40px Arial", "#052865");
      var textBounds = text.getBounds();
      text.regX = textBounds.width / 2;
      text.regY = textBounds.height / 2;
      text.x = this.canvas.width / 2;
      text.y = this.canvas.height / 2.3;
      return text;
    };
  });

  // TODO: this fails on different operating systems that render fonts differently
  xit("renders text baseline default", async function() {
    var text = this.createText();
    this.container.addChild(text);
    this.stage.update();
    let imgData = imgToImageData(await loadImage("img/text-baseline-top.png"));

    expect(this.getImageData()).toVisuallyEqual(imgData);
  });

  // These methods are inconsistent across browsers

  xit("renders text baseline top", async function() {
    var text = this.createText();
    text.textBaseline = "top";
    this.container.addChild(text);
    this.stage.update();
    let imgData = imgToImageData(await loadImage("img/text-baseline-top.png"));

    expect(this.getImageData()).toVisuallyEqual(imgData);
  });

  xit("renders text baseline bottom", async function() {
    var text = this.createText();
    text.textBaseline = "bottom";
    this.container.addChild(text);
    this.stage.update();
    let imgData = imgToImageData(
      await loadImage("img/text-baseline-bottom.png")
    );

    expect(this.getImageData()).toVisuallyEqual(imgData);
  });

  xit("renders text baseline middle", async function() {
    var text = this.createText();
    text.textBaseline = "middle";
    this.container.addChild(text);
    this.stage.update();
    let imgData = imgToImageData(
      await loadImage("img/text-baseline-middle.png")
    );

    expect(this.getImageData()).toVisuallyEqual(imgData);
  });
});
