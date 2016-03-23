#!/usr/bin/env node
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cwd = exports.program = undefined;

var _huronConfig = require('./huron-config.js');

var _huronConfig2 = _interopRequireDefault(_huronConfig);

var _initKss = require('./init-kss.js');

var _initKss2 = _interopRequireDefault(_initKss);

var _initCustom = require('./init-custom.js');

var _initCustom2 = _interopRequireDefault(_initCustom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Requires
var path = require('path');
var connect = require('connect'); // HTTP server framework
var serveStatic = require('serve-static'); // File serving service
var program = require('commander'); // Easy program flags
var cwd = process.cwd(); // Current Working Directory

exports.program = program;
exports.cwd = cwd;

(0, _huronConfig2.default)();
init();

// Start KSS watcher
function init() {
  (0, _initKss2.default)();

  // Only initialize the custom partial bundler program.custom and program.bundle are set
  if (program.bundle && program.custom) {
    (0, _initCustom2.default)();
  }

  if (program.runOnce) {
    gaze.close();
    return;
  } else {
    // Start connect server
    startServer();
  }
}

// Start the server
function startServer() {
  connect().use(serveStatic(program.root)).listen(program.port);
  console.log('Serving from localhost:' + program.port + '...');
}