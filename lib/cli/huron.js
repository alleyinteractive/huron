#!/usr/bin/env node
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cwd = exports.program = undefined;

var _huronConfig = require('./huron-config.js');

var _huronConfig2 = _interopRequireDefault(_huronConfig);

var _huronParseKss = require('./huron-parse-kss.js');

var _huronParseKss2 = _interopRequireDefault(_huronParseKss);

var _customBundle = require('./custom-bundle.js');

var _customBundle2 = _interopRequireDefault(_customBundle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Requires
var path = require('path');
var connect = require('connect'); // HTTP server framework
var serveStatic = require('serve-static'); // File serving service
var Gaze = require('gaze').Gaze; // File watcher
var program = require('commander'); // Easy program flags
var cwd = process.cwd(); // Current Working Directory

exports.program = program;
exports.cwd = cwd;

(0, _huronConfig2.default)();
initKSS();

// Only initialize the custom partial bundler program.custom and program.bundle are set
if (program.bundle && program.custom) {
  initCustom();
}

// Start KSS watcher
function initKSS() {
  var gaze = new Gaze(program.source);

  // Run once no matter what to show most up to date
  (0, _huronParseKss2.default)(gaze.watched());

  if (program.runOnce) {
    gaze.close();
    return;
  } else {
    // Start connect server
    startServer();
  }

  gaze.on('error', function (error) {
    console.log('An error has occured: ' + error);
    return;
  });

  gaze.on('nomatch', function () {
    console.log('No matches found');
    return;
  });

  gaze.on('all', function (event, filepath) {
    // Adding/Deleting files
    if (event === 'deleted' || event === 'added') {
      console.log(filepath.substring(cwd.length) + ' ' + event);
    }

    // Changed on target file
    if (event === 'changed') {
      console.log('Writing partial for ' + filepath);
    }

    (0, _huronParseKss2.default)(gaze.watched());
  });
}

// Start custom partial watcher for bundling custom partials
function initCustom() {
  var gaze = new Gaze(program.custom + '/*.html');

  (0, _customBundle2.default)();

  gaze.on('error', function (error) {
    console.log('An error has occured: ' + error);
    return;
  });

  gaze.on('all', function () {
    (0, _customBundle2.default)();
  });
}

// Start the server
function startServer() {
  connect().use(serveStatic(program.root)).listen(program.port);
  console.log('Serving from localhost:' + program.port + '...');
}