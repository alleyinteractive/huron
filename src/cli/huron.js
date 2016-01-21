#!/usr/bin/env node

// Requires
const fs = require('fs'); // File system
const path = require('path');
const kss = require('kss'); // node implementation of KSS: a methodology for documenting CSS and generating style guides
const connect = require('connect'); // HTTP server framework
const serveStatic = require('serve-static'); // File serving service
const jsdom = require('jsdom'); // JavaScript implementation of the WHATWG DOM and HTML
const Gaze = require('gaze').Gaze; // File watcher
const program = require('commander'); // Easy program flags
const cwd = process.cwd(); // Current Working Directory

require('./huron-config.js')(program, process, cwd);
init();

function init() {
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

// Parse KSS and insert into an HTML partial
function kssTraverse(files) {
  let kssRoot = Object.keys(files)[0];
  kss.traverse(kssRoot, {}, (err, styleguide) => {
    // Loop through sections
    styleguide.data.sections.forEach((section, idx) => {
      const sectionData = styleguide.section(section.data.reference);
      if (typeof sectionData.data !== 'undefined'
        && section.data.markup !== 'undefined'
      ) {
        const partialHeader = normalizeHeader(sectionData.header());

        // Check if we have markup
        if (typeof section.data.markup === 'string') {
          writeMarkup(section.data.markup, styleguide, partialHeader);
        }
      }
    });
  });
}


// Make sure we have a normalized string for filename
function normalizeHeader(header) {
  return header
    .toLowerCase()
    .replace(/\s?\W\s?/g, '-');
}

// Parse the section markup
function writeMarkup(markup, styleguide, partialHeader) {
  // Create filename string
  const filename = `${program.destination}/${partialHeader}.html`;
  let htmlOutput = '';

  // Use jsdom to parse section html
  jsdom.env({
    html: markup,
    done: function(err, window) {
      if (err) {
        throw err;
      }

      const doc = window.document;
      const templateWrapper = doc.createElement('template');
      const moduleWrapper = doc.createElement('dom-module');
      const wrap = doc.createElement('div');
      const inserts = doc.getElementsByTagName('sg-insert');
      const skip = doc.querySelectorAll('[proto-skip]');
      const ignore = doc.querySelectorAll('[proto-ignore]');

      // Find sg-insert elements, replace with prototype insert, add a corresponding html import <link>
      if (!ignore.length) {
        if (inserts.length) {
          for (let i = 0; i < inserts.length; i++) {
            const insert = inserts.item(i);
            const pathOverride = insert.parentElement.attributes.path;
            const section = styleguide.section(insert.textContent);
            const subsectionName = normalizeHeader(section.header());
            const reference = doc.createElement(subsectionName);

            // Replace sg-insert with parital insert reference
            insert.parentElement.replaceChild(reference, insert);
          }
        }

        // Remove styleguide-only elements
        if (skip.length) {
          for (let j = 0; j < skip.length; j++) {
            const exclude = skip.item(j);

            exclude.parentElement.removeChild(exclude);
          }
        }

        templateWrapper.id = partialHeader;
        templateWrapper.innerHTML = doc.body.innerHTML;
        moduleWrapper.appendChild(templateWrapper);
        wrap.appendChild(moduleWrapper);
        htmlOutput = wrap.innerHTML;

        // Write the html
        if ( '' !== doc.body.innerHTML ) {
          fs.writeFileSync(filename, htmlOutput, {}, function(err) {
            if (err) {
              throw err;
            }
          });
        }
      }
    }
  });
}

function startServer() {
  // Start server
  connect()
    .use(
      serveStatic(program.root)
    )
    .listen(program.port);
  console.log(`Serving from localhost:${program.port}...`);
}