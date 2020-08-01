/**
 * Text vertical offset hack needed to take advantage of
 * cross-browser consistency that is only present when using
 * textBaseline = alphabetic
 *
 * @see https://stackoverflow.com/a/54256368/918605
 * @see https://github.com/CreateJS/EaselJS/issues/235
 */
const cache = {};
//@ts-ignore private method hack
createjs.Text.prototype._drawTextLine = function (ctx, text, y) {
  this.textBaseline = ctx.textBaseline = "alphabetic";
  if (!(this.font in cache)) {
    const metrics = this.getMetrics();
    cache[this.font] = metrics.vOffset;
  }
  const offset = cache[this.font] + 1;
  if (this.outline) {
    ctx.strokeText(text, 0, y - offset, this.maxWidth || 0xffff);
  } else {
    ctx.fillText(text, 0, y - offset, this.maxWidth || 0xffff);
  }
};
