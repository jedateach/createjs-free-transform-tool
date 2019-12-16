function buildEl(element, content) {
  element = document.createElement(element);
  if (element && content) {
    element.innerHTML = content;
  }
  return element;
}

function getCanvas(width, height) {
  var canvas = document.createElement("canvas");
  // TODO: support node canvas' also
  if (width) canvas.width = width;
  if (height) canvas.height = height;
  return canvas;
}

function createCanvasFromImageData(imageData) {
  let canvas = getCanvas(imageData.width, imageData.height);
  let context = canvas.getContext("2d");
  context.putImageData(imageData, 0, 0);
  return canvas;
}

function buildHTMLError(message, actualCanvas, expectedCanvas, diffCanvas) {
  let html = buildEl("div", message);
  // TODO: improve error styling
  html.appendChild(actualCanvas);
  html.appendChild(expectedCanvas);
  html.appendChild(diffCanvas);
  return html;
}

let imageMatchers = {
  toVisuallyEqual(util, customEqualityTesters) {
    return {
      compare(actual, expected) {
        var result = {};
        let width = expected.width;
        let height = expected.height;

        let diffCanvas = getCanvas(width, height);
        let diffContext = diffCanvas.getContext("2d");
        const diff = diffContext.createImageData(width, height);

        try {
          let differingPixels = pixelmatch(
            expected.data,
            actual.data,
            diff.data,
            width,
            height,
            { threshold: 0.1, diffMask: true, alpha: 1, includeAA: false }
          );
          diffContext.putImageData(diff, 0, 0);
          result.pass = differingPixels === 0;

          if (!result.pass) {
            let actualCanvas = createCanvasFromImageData(actual);
            let expectedCanvas = createCanvasFromImageData(expected);
            let totalPixels = width * height;
            let percentDifference = (
              (differingPixels / totalPixels) *
              100
            ).toFixed(0);
            let message = `Images have ${differingPixels}/${totalPixels} (${percentDifference}%) differing pixels`;
            if (typeof document !== undefined) {
              result.message = buildHTMLError(
                message,
                actualCanvas,
                expectedCanvas,
                diffCanvas
              );
            } else {
              result.message = message;
            }
          }
        } catch (error) {
          result.pass = false;
          result.message = error.message;
        }
        return result;
      }
    };
  }
};

let imageDataEquality = function(first, second) {
  if (first instanceof ImageData && second instanceof ImageData) {
    return (
      first.width === second.width &&
      first.height === second.height &&
      pixelmatch(first.data, second.data, null, first.width, first.height) === 0
    );
  }
};

beforeEach(function() {
  jasmine.addMatchers(imageMatchers);
  jasmine.addCustomEqualityTester(imageDataEquality);
});
