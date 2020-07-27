export default function createText() : createjs.Text {
    const text = new createjs.Text("Hello\nWorld", "70px Arial", "#052865");
    const textBounds = text.getBounds();
    text.regX = textBounds.width / 2;
    text.regY = textBounds.height / 2;
    text.outline = 5;
    text.rotation = 5 | 0;
    text.cursor = "pointer";
  
    const hit = new createjs.Shape();
    hit.graphics
      .beginFill("#000")
      .drawRect(0, 0, text.getBounds().width, text.getBounds().height);
    text.hitArea = hit;
    return text;
}