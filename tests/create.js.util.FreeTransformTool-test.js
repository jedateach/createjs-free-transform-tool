describe("Smoke checks", function() {
  it("Exists", function() {
    expect(createjs.util.FreeTransformTool).toBeTruthy();
  });
});

describe("Some tests", function() {
  beforeEach(function() {
    var shape = new createjs.Shape();
    this.g = shape.graphics;
    this.stage.addChild(shape);
  });

  it("Exists", function() {
    expect(createjs.util.FreeTransformTool).toBeTruthy();
  });
});

// TODO: render something with easel
// TODO: diference with image lib
