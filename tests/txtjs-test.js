describe("Txtjs text in EaselJS", function() {
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
      var text = new txt.Text({
        text: "Hello World",
        font: "raleway",
        align: txt.Align.TOP_RIGHT,
        tracking: -4,
        lineHeight: 120,
        width: 600,
        height: 360,
        size: 120,
        x: 10,
        y: 10
        // color: "#052865"
      });
      //   var textBounds = text.getBounds();
      //   text.regX = textBounds.width / 2;
      //   text.regY = textBounds.height / 2;
      //   text.x = this.canvas.width / 2;
      //   text.y = this.canvas.height / 2.3;
      return text;
    };
  });

  // TODO: this fails on different operating systems that render fonts differently
  it("renders text baseline default", async function(done) {
    let imgData = imgToImageData(await loadImage("img/text-baseline-top.png"));

    var text = this.createText();
    text.complete = () => {
      expect(this.getImageData()).toVisuallyEqual(imgData);
      done();
    };

    this.container.addChild(text);
    this.stage.update();
  });
});
