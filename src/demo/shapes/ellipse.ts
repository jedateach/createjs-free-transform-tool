export default function createEllipse() : createjs.Shape {
  const ellipse = new createjs.Shape();
  ellipse.setBounds(0, 0, 200, 300);
  ellipse.regX = (ellipse.getBounds().width / 2) | 0;
  ellipse.regY = (ellipse.getBounds().height / 6) | 0;
  ellipse.graphics
    .setStrokeStyle(4)
    .beginRadialGradientFill(["#FFF", "#35E"], [1, 0], 0, 0, 200, 30, -50, 40)
    .drawEllipse(0, 0, 200, 300);
  return ellipse;
}
