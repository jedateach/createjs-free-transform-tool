export enum HandlePosition {
  TOP_LEFT,
  TOP_CENTER,
  TOP_RIGHT,
  MIDDLE_LEFT,
  MIDDLE_CENTER,
  MIDDLE_RIGHT,
  BOTTOM_LEFT,
  BOTTOM_CENTER,
  BOTTOM_RIGHT,
}

export function handlePositionToRectPoint(
  position: HandlePosition,
  rectangle: createjs.Rectangle
): createjs.Point {
  const point = new createjs.Point();
  switch (position) {
    case HandlePosition.TOP_LEFT:
    case HandlePosition.MIDDLE_LEFT:
    case HandlePosition.BOTTOM_LEFT:
      point.x = rectangle.x;
      break;
    case HandlePosition.MIDDLE_CENTER:
    case HandlePosition.TOP_CENTER:
    case HandlePosition.BOTTOM_CENTER:
      point.x = rectangle.x + rectangle.width / 2;
      break;
    case HandlePosition.TOP_RIGHT:
    case HandlePosition.MIDDLE_RIGHT:
    case HandlePosition.BOTTOM_RIGHT:
      point.x = rectangle.x + rectangle.width;
      break;
  }
  switch (position) {
    case HandlePosition.TOP_LEFT:
    case HandlePosition.TOP_CENTER:
    case HandlePosition.TOP_RIGHT:
      point.y = rectangle.y;
      break;
    case HandlePosition.MIDDLE_LEFT:
    case HandlePosition.MIDDLE_CENTER:
    case HandlePosition.MIDDLE_RIGHT:
      point.y = rectangle.y + rectangle.height / 2;
      break;
    case HandlePosition.BOTTOM_LEFT:
    case HandlePosition.BOTTOM_CENTER:
    case HandlePosition.BOTTOM_RIGHT:
      point.y = rectangle.y + rectangle.height;
      break;
  }
  return point;
}
