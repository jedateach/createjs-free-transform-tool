# CreateJS: EaselJS - Free Transform Tool

[![Build Status](https://travis-ci.org/jedateach/createjs-free-transform-tool.svg?branch=master)](https://travis-ci.org/jedateach/createjs-free-transform-tool)

Provides controls for transforming position, size, and rotation of CreateJS Display Objects.

## Features

- Transformations are relative to the registration point (ob.regX, obj.regY), which you can choose.
- Un-obtrusive to your createjs project scene. The tool sits in it's own container layer.

## Demo

See the tool in action at: https://jedateach.github.io/createjs-free-transform-tool

[Source code for demo](demo/demo.js)

## Usage

In order to use this tool you have to:

1. add a new layer to your stage in top of everything

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

3. to select any object for example when the user click on that object

   ```js
   object.on("click", function(evt) {
     selectTool.select(evt.currentTarget, stage);
   });
   ```

4. to unselect object for example when the user click on the stage

   ```js
   stage.addEventListener("click", function() {
     selectTool.unselect();
   });
   ```
