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

function isHTMLReport() {
  return !!jasmineRequire.html;
}

function styleCanvas(canvas) {
  canvas.style.border = "1px solid #ddd";
  canvas.style.background = "white";
}

function buildError(
  message,
  actualCanvas,
  expectedCanvas = null,
  diffCanvas = null
) {
  if (!isHTMLReport()) {
    let output = message;
    if (actualCanvas) {
      output += "\nActual: \n" + actualCanvas.toDataURL();
    }
    if (expectedCanvas) {
      output += "\nExpected: \n" + expectedCanvas.toDataURL();
    }
    if (diffCanvas) {
      output += "\nDiff: \n" + diffCanvas.toDataURL();
    }
    return output;
  }
  let html = buildEl("div", message);

  styleCanvas(actualCanvas);
  let actualDiv = buildEl("div", "Actual:<br/> ");
  actualDiv.appendChild(actualCanvas);
  html.appendChild(actualDiv);
  if (expectedCanvas) {
    styleCanvas(expectedCanvas);
    let expectedDiv = buildEl("div", "Expected:<br/> ");
    expectedDiv.appendChild(expectedCanvas);
    html.appendChild(expectedDiv);
  }
  if (diffCanvas) {
    styleCanvas(diffCanvas);
    let diffDiv = buildEl("div", "Diff:<br/> ");
    diffDiv.appendChild(diffCanvas);
    html.appendChild(diffDiv);
  }
  return html;
}

let imageMatchers = {
  toVisuallyEqual(util, customEqualityTesters) {
    return {
      compare(actual, expected) {
        var result = {};

        if (!expected) {
          let actualCanvas = createCanvasFromImageData(actual);
          result.message = buildError(
            "No expected image defined",
            actualCanvas
          );
          result.pass = false;
          return result;
        }

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
            { threshold: 0.6, diffMask: true, alpha: 1, includeAA: false }
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
            ).toFixed(2);
            let message = `Images have ${differingPixels}/${totalPixels} (${percentDifference}%) differing pixels`;

            result.message = buildError(
              message,
              actualCanvas,
              expectedCanvas,
              diffCanvas
            );
          }
        } catch (error) {
          let actualCanvas = createCanvasFromImageData(actual);
          let expectedCanvas = createCanvasFromImageData(expected);
          result.pass = false;
          result.message = buildError(
            error.message,
            actualCanvas,
            expectedCanvas
          );
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
