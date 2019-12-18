describe("Smoke checks", function() {
  it("is can access createjs and free transform tool", function() {
    expect(createjs).toBeTruthy();
    expect(createjs.util.FreeTransformTool).toBeTruthy();
  });
});

describe("Free transform tool", function() {
  beforeEach(function() {
    this.canvas = getCanvas(100, 100);
    this.stage = new createjs.Stage(this.canvas);
    this.container = new createjs.Container();
    this.stage.addChildAt(this.container, 0);

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
    ellipse.setBounds(0, 0, 20, 30);
    ellipse.regX = (ellipse.getBounds().width / 2) | 0;
    ellipse.regY = (ellipse.getBounds().height / 2) | 0;
    ellipse.graphics.beginFill("#35E").drawEllipse(0, 0, 20, 30);
    this.container.addChild(ellipse);
    this.stage.update();

    let imgData = imgToImageData(await loadImage("img/selected-ellipse.png"));

    expect(this.getImageData()).toVisuallyEqual(imgData);
  });
});
