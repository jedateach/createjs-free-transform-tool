# TODO

Update border, and constrain elements

## Build test infrastructure

- Build out test suite

- Provide a BASE64 or URI-encoded image that can be viewed for headless debugging

## Tests

- Text is positioned correctly - cross browser support & nodeJS

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
