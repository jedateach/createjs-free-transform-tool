# TODO

Convert to Typescript?

Update border, and constrain elements

## Transforming a transformed Container's child DisplayObjects

It is useful to support transforming elements within a container that might also have some transformations applied.

Use case: design area has been resized/zoomed.

Currently the coordinate systems are out, and the boundary mechanism fails too.

Come up with a design / plan...

We might need to introduce functions for transforming through parent layers.

## Decomposing tools into classes

Conceptually tool sequence is:

- Provides a handle that can be dragged
- Take the handle's start and current events, the registration point
- Produces a potential transformation (of various types)
- Transformation gets limited by new bounds
- DisplayObject gets updated with final transform

Tools therefore need to know:

- Orientation point
- How to limit a transformation? Surely this is deterministic, but in some cases the math is hard, such as scaling

Tools don't need to know

## Types of bounds

Oriented Bounds - bounds that have been positioned, rotated, scaled with the target
Simple Boundary Bounds - bounds that wrap the transformed oriented bounds
Complex Boundary Bounds - bounds that wrap the complexities of a shape: eg vector graphics, various primitive shapes, or images with some pixel analysis.

We'll settle for a simple bounds approach, since reorienting isn't common.

Current issue: we rely on un-oriented bounds to collide with boundary, resulting in the objects crossing over the boundary. Perhaps this is ok.

## Build test infrastructure

- Build out test suite

- Provide a BASE64 or URI-encoded image that can be viewed for headless debugging

## Tests

- Text is positioned correctly - cross browser support & nodeJS
  - Read https://github.com/CreateJS/EaselJS/issues/235
  - try txtjs to see if consistency can be gained

## Bugs to fix

- Text can't be center aligned
- Deselect occurs after tool mouseup

- Controls overlap image at small size. Instead move them off the image.

  - Perhaps leave enough hit area for moving at small size
  - Rotate tether only needed at small sizes. Slash, not needed.

- Constraining issues
  - Transformed bounds don't wrap rotated objects
  - Aspect ratio doesn't stay fixed when exceeding lesser of width or height

## Features to implement

- Customise available controls

  - Combine rotate and scale handles?
  - Prevent stretching horizontally and vertically. Allow disabling stretch controls

- Introduce multi-touch capability. https://fabianirsara.com/examples/multitouch/
- Snap rotations, locations, scales

## Architectural

- Consume create.js apis more (Point class anyone?)
- Don't rely on jQuery (see createjs.util.js)
- Reduce reliance on `create.util.js`
- Introduce test suite
- Split into multiple files
- Publish to npm

## Display objects

- Bitmaps:yes
- Text: yes
- Sprites - animated?
- Primitive shapes - Ellipse, Rect, Star, Rounded rect: yes
- Vector shapes: difficulty with svg
- Container

https://github.com/CreateJS/EaselJS/issues/456#issuecomment-487085826

- Test what happens when you scale the canvas

## Later

Features

- Grouping elements!?

- Html dom handles for transforming outside of canvas bounds
- Use filter/blending mode on border (eg avoid black on black)
- Re-introduce shift modifier to control aspect ratio locking?
- Allow moving the registration point with a handle

- Prevent or warn when scaling above best print resolution

Generalising cursor update logic

```js
const ANGLE_STEP = 45;
const DIRECTIONS = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];

export function angleToOrdinalDirection(angle: number): string {
  const index =
    Math.floor((angle + 360) / ANGLE_STEP + 0.5) % DIRECTIONS.length;
  console.log(angle, DIRECTIONS[index], index);
  return DIRECTIONS[index];
}
```
