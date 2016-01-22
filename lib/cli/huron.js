#!/usr/bin/env node
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cwd = exports.program = undefined;

var _huronConfig = require('./huron-config.js');

var _huronParseKss = require('./huron-parse-kss.js');

// Requires
var path = require('path');
var connect = require('connect'); // HTTP server framework
var serveStatic = require('serve-static'); // File serving service
var Gaze = require('gaze').Gaze; // File watcher
var program = require('commander'); // Easy program flags
var cwd = process.cwd(); // Current Working Directory

exports.program = program;
exports.cwd = cwd;

(0, _huronConfig.processArgs)();
init();

function init() {
  var gaze = new Gaze(program.source);

  // Run once no matter what to show most up to date
  (0, _huronParseKss.kssTraverse)(gaze.watched());

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

    (0, _huronParseKss.kssTraverse)(gaze.watched());
  });
}

function startServer() {
  // Start server
  connect().use(serveStatic(program.root)).listen(program.port);
  console.log('Serving from localhost:' + program.port + '...');
}