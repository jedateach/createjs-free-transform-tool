export function calcAngleDegrees(x, y) {
  return (Math.atan2(y, x) * 180) / Math.PI;
}

export function calcDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Force a rectangle to always be inside another by
 * updating location and size.
 * @param {createjs.Rectangle} rect
 * @param {createjs.Rectangle} container
 */
export function constrainRectTo(rect, container) {
  if (rect.width >= container.width) {
    rect.width = container.width;
  }
  if (rect.height >= container.height) {
    rect.height = container.height;
  }
  if (rect.x <= container.x) {
    rect.x = container.x;
  }
  if (rect.x + rect.width > container.x + container.width) {
    rect.x = container.x + container.width - rect.width;
  }
  if (rect.y <= container.y) {
    rect.y = container.y;
  }
  if (rect.y + rect.height > container.y + container.height) {
    rect.y = container.y + container.height - rect.height;
  }
  return rect;
}

// constrains a display object to a given rect
export function constrainObjectTo(obj, rect) {
  const bounds = obj.getBounds();
  bounds.x = obj.x - obj.regX * obj.scaleX;
  bounds.y = obj.y - obj.regY * obj.scaleY;
  const constrained = new createjs.Rectangle(
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height
  );
  constrainRectTo(constrained, rect);
  obj.x = constrained.x + obj.regX * obj.scaleX;
  obj.y = constrained.y + obj.regY * obj.scaleY;
  // TODO: work out new scale to apply, rather than overlapping
  const newScale = {
    x: constrained.width / bounds.width,
    y: constrained.height / bounds.height,
  };
  obj.scaleX *= newScale.x;
  obj.scaleY *= newScale.y;
}
