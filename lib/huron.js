#!/usr/bin/env node
'use strict';

// Requires
var fs = require('fs'); // File system
var path = require('path');
var kss = require('kss'); // node implementation of KSS: a methodology for documenting CSS and generating style guides
var connect = require('connect'); // HTTP server framework
var serveStatic = require('serve-static'); // File serving service
var jsdom = require('jsdom'); // JavaScript implementation of the WHATWG DOM and HTML
var Gaze = require('gaze').Gaze; // File watcher
var program = require('commander'); // Easy program flags
var cwd = process.cwd(); // Current Working Directory

program.version('0.0.1').option('--source [source]', 'KSS [source directory]').option('--destination [destination]', '[destination] of partials output', function (dest) {
  return [cwd, dest].join('/');
}).option('-r, --root [root]', '[root] directory for the server, defaults to current working directory', cwd).option('--port [port]', '[port] to listen the server on', function (port) {
  return parseInt(port);
}, 8080).option('-o, --output', 'Verbose output of options').option('--runOnce', 'Run only once, without watching').parse(process.argv);

init();

function init() {
  if (typeof program.source === 'undefined') {
    console.log('No KSS source given');
    return;
  }
  if (typeof program.destination === 'undefined') {
    console.log('No destination given');
    return;
  }

  var gaze = new Gaze(program.source);

  // Run once no matter what to show most up to date
  kssTraverse(gaze.watched());

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

    kssTraverse(gaze.watched());
  });
}

// Parse KSS and insert into an HTML partial
function kssTraverse(files) {
  var kssRoot = Object.keys(files)[0];
  kss.traverse(kssRoot, {}, function (err, styleguide) {
    // Loop through sections
    styleguide.data.sections.forEach(function (section, idx) {
      var sectionData = styleguide.section(section.data.reference);
      if (typeof sectionData.data !== 'undefined' && section.data.markup !== 'undefined') {
        var partialHeader = normalizeHeader(sectionData.header());

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
  return header.toLowerCase().replace(/\s?\W\s?/g, '-');
}

// Parse the section markup
function writeMarkup(markup, styleguide, partialHeader) {
  // Create filename string
  var filename = program.destination + '/' + partialHeader + '.html';
  var htmlOutput = '';
  var linkList = [];

  // Use jsdom to parse section html
  jsdom.env({
    html: markup,
    done: function done(err, window) {
      if (err) {
        throw err;
      }

      var doc = window.document;
      var inserts = doc.getElementsByTagName('sg-insert');
      var skip = doc.querySelectorAll('[proto-skip]');
      var ignore = doc.querySelectorAll('[proto-ignore]');

      // Find sg-insert elements, replace with prototype insert, add a corresponding html import <link>
      if (!ignore.length) {
        if (inserts.length) {
          for (var i = 0; i < inserts.length; i++) {
            var insert = inserts.item(i);
            var pathOverride = insert.parentElement.attributes.path;
            var section = styleguide.section(insert.textContent);
            var subsectionName = normalizeHeader(section.header());
            var reference = doc.createElement('div');
            var link = doc.createElement('link');

            // Create partial insert point
            reference.className = subsectionName;
            reference.setAttribute('partial', '');

            // Create link element for html import
            link.rel = 'import';

            // Create link href, checking if there is a path override in the styleguide
            link.href = '';
            if ('undefined' !== typeof pathOverride) {
              link.href += pathOverride.nodeValue + '/';
            }
            link.href += subsectionName + '.html';

            // Replace sg-insert with parital insert reference
            insert.parentElement.replaceChild(reference, insert);

            // If link element hasn't been inserted yet, insert it!
            if (linkList.indexOf(subsectionName) < 0) {
              doc.body.insertBefore(link, doc.body.children.item(0));
            }

            // Add link name to link list so it's not duplicated in markup
            linkList.push(subsectionName);
          }
        }

        // Remove styleguide-only elements
        if (skip.length) {
          for (var j = 0; j < skip.length; j++) {
            var exclude = skip.item(j);

            exclude.parentElement.removeChild(exclude);
          }
        }

        htmlOutput = doc.body.innerHTML;

        // Write the html
        if ('' !== doc.body.innerHTML) {
          fs.writeFileSync(filename, htmlOutput, {}, function (err) {
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
  connect().use(serveStatic(program.root)).listen(program.port);
  console.log('Serving from localhost:' + program.port + '...');
}