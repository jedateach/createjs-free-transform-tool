/**
 * @param {HTMLImageElement} img
 * @returns {ImageData}
 */
function imgToImageData(img) {
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  context.drawImage(img, 0, 0);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * @param {String} url
 * @returns {Promise}
 */
function loadImage(url) {
  var img = new Image();
  img.src = url;
  return new Promise(resolve => {
    img.onload = () => resolve(img);
  });
}
