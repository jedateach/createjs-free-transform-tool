const coverageServer = require("./testem-coverage-server");

const chromeArgs = ["--disable-gpu", "--remote-debugging-port=9222"];
const firefoxArgs = [];

if (process.env.HEADLESS) {
  chromeArgs.unshift("--headless");
  firefoxArgs.unshift("--headless");
}

let serve_files = [
  { src: coverageServer.clientFile },
  {
    src:
      "node_modules/@recreatejs/jasmine-pixelmatch/dist/jasmine-pixelmatch.js",
  },
  { src: "dist/easeljs.js" },
  { src: "dist/createjs.util.FreeTransformTool.instrumented.js" },
  { src: "dist/tests.umd.js" }
];

if (process.env.HEADLESS) {
  serve_files.push({ src: "dist/esnext/tests/_headless.js" });
}

module.exports = {
  launch_in_dev: ["Chrome"],
  launch_in_ci: ["Chrome"],
  browser_args: {
    Chrome: chromeArgs,
    Firefox: firefoxArgs
  },
  test_page: "testem.mustache",
  src_files: ["src/**/*.ts", "tests/**/*.ts"],
  serve_files,
  css_files: [],
  routes: {
    "/img": "tests/images"
  },
  proxies: coverageServer.proxies,
  before_tests: function(config, data, callback) {
    coverageServer.startCoverageServer(callback);
  },
  after_tests: function(config, data, callback) {
    coverageServer.shutdownCoverageServer(callback);
  }
};
