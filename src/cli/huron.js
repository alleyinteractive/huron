#!/usr/bin/env node

// Requires
const path = require('path');
const connect = require('connect'); // HTTP server framework
const serveStatic = require('serve-static'); // File serving service
const program = require('commander'); // Easy program flags
const cwd = process.cwd(); // Current Working Directory

import processArgs from './huron-config.js';
import initKSS from './init-kss.js';
import initCustom from './init-custom.js';
export { program, cwd };

processArgs();
init();

// Start KSS watcher
function init() {
  initKSS();

  // Only initialize the custom partial bundler program.custom and program.bundle are set
  if (program.bundle && program.custom) {
    initCustom();
  }

  if(program.runOnce) {
    gaze.close();
    return;
  } else {
    // Start connect server
    startServer();
  }
}

// Start the server
function startServer() {
  connect()
    .use(
      serveStatic(program.root)
    )
    .listen(program.port);
  console.log(`Serving from localhost:${program.port}...`);
}