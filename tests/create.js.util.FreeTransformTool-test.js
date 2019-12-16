describe("Smoke checks", function() {
  it("is can access createjs and free transform tool", function() {
    expect(createjs).toBeTruthy();
    expect(createjs.util.FreeTransformTool).toBeTruthy();
  });
});

describe("Free transform tool", function() {
  beforeEach(function() {
    this.container = new createjs.Container();
    this.stage.addChildAt(this.container, 0);
  });

  it("can draw on the easel", function() {
    // Shape
    var ellipse = new createjs.Shape();
    // ellipse.x = canvas.width / 2;
    // ellipse.y = canvas.height / 2;
    ellipse.setBounds(0, 0, 200, 300);
    ellipse.regX = (ellipse.getBounds().width / 2) | 0;
    ellipse.regY = (ellipse.getBounds().height / 6) | 0;
    ellipse.graphics
      .setStrokeStyle(4)
      .beginRadialGradientFill(["#FFF", "#35E"], [1, 0], 0, 0, 200, 30, -50, 40)
      .drawEllipse(0, 0, 200, 300);

    this.container.addChild(ellipse);

    // TODO: compare pixels

    expect(createjs.util.FreeTransformTool).toBeTruthy();
  });
});

// TODO: render something with easel
// TODO: load reference images
// TODO: difference with image lib
