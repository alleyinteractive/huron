#!/usr/bin/env node

// Requires
const path = require('path');
const connect = require('connect'); // HTTP server framework
const serveStatic = require('serve-static'); // File serving service
const Gaze = require('gaze').Gaze; // File watcher
const program = require('commander'); // Easy program flags
const cwd = process.cwd(); // Current Working Directory

import processArgs from './huron-config.js';
import kssTraverse from './huron-parse-kss.js';
import bundleCustomPartials from './custom-bundle.js';
export { program, cwd };

processArgs();
initKSS();

// Only initialize the custom partial bundler program.custom and program.bundle are set
if (program.bundle && program.custom) {
  initCustom();
}

// Start KSS watcher
function initKSS() {
  const gaze = new Gaze(program.source);

  // Run once no matter what to show most up to date
  kssTraverse(gaze.watched());

  if(program.runOnce) {
    gaze.close();
    return;
  } else {
    // Start connect server
    startServer();
  }

  gaze.on('error', (error) => {
    console.log(`An error has occured: ${error}`);
    return;
  });

  gaze.on('nomatch', () => {
    console.log('No matches found');
    return;
  });

  gaze.on('all', (event, filepath) => {
    // Adding/Deleting files
    if (event === 'deleted' || event === 'added') {
      console.log(`${filepath.substring(cwd.length)} ${event}`);
    }

    // Changed on target file
    if (event === 'changed') {
      console.log(`Writing partial for ${filepath}`);
    }

    kssTraverse(gaze.watched());
  });
}

// Start custom partial watcher for bundling custom partials
function initCustom() {
  const gaze = new Gaze(`${program.custom}/*.html`);

  bundleCustomPartials();

  gaze.on('error', (error) => {
    console.log(`An error has occured: ${error}`);
    return;
  });

  gaze.on('all', () => {
    bundleCustomPartials();
  });
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