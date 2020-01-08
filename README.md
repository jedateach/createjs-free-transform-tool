# CreateJS: EaselJS - Free Transform Tool

[![Build Status](https://travis-ci.org/jedateach/createjs-free-transform-tool.svg?branch=master)](https://travis-ci.org/jedateach/createjs-free-transform-tool)

Provides controls for transforming position, size, and rotation of CreateJS Display Objects.

## Features

- Transformations are relative to the registration point (ob.regX, obj.regY), which you can choose.
- Un-obtrusive to your createjs project scene. The tool sits in it's own container layer.

### Display object support

Tested with:

- Bitmaps: yes
- Text: yes (but there are cross-browser issues)
- Primitive shapes (eg Ellipse, Rect, Star, Rounded rect): yes, tested with ellipse

Currently untested:

- Sprites - animated?
- Vector shapes: difficulty with svg
- Container (grouping)

## Demo

See the tool in action at: https://jedateach.github.io/createjs-free-transform-tool

[Source code for demo](demo/demo.js)

## Usage

In order to use this tool you have to:

1. add a new layer to put the transform tool into

   ```js
   var top = new createjs.Container();
   top.name = "top";
   stage.addChild(top);
   ```

2. add the transform tool inside the top layer

   ```js
   var selectTool = new createjs.util.FreeTransformTool();
   selectTool.name = "transform";
   top.addChild(selectTool);
   ```

3. to select an when the user clicks it

   ```js
   object.on("click", function(evt) {
     selectTool.select(evt.currentTarget, stage);
   });
   ```

4. to unselect when user clicks the stage

   ```js
   stage.addEventListener("click", function() {
     selectTool.unselect();
   });
   ```

## Text handling

There is a [known issue](https://github.com/CreateJS/EaselJS/issues/235) meaning that text rendering is inconsistent across browsers, when using any [textBaseline](https://www.createjs.com/docs/easeljs/classes/Text.html#property_textBaseline) value other than `"alphabetic"`.

To get around this issue, we've supplied a file `createjs.text-fix.js`, which provides a fix by forcing the `alphabetic` baseline, and performs vertical offset to position text as if it were positioned "top".
