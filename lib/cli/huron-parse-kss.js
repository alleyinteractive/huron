'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = kssTraverse;

var _huron = require('./huron.js');

var fs = require('fs'); // File system
var kss = require('kss'); // node implementation of KSS: a methodology for documenting CSS and generating style guides
var jsdom = require('jsdom'); // JavaScript implementation of the WHATWG DOM and HTML

// Parse KSS and insert into an HTML partial
function kssTraverse(files) {
  var bundleName = _huron.program.destination + '/' + _huron.program.bundleName + '-bundle.html';
  var bundleOutput = null;
  var kssRoot = Object.keys(files);

  // Open stream if we're bundling
  if (_huron.program.bundle) {
    bundleOutput = fs.createWriteStream(bundleName, 'utf8');
  }

  // Loop through KSS sections
  kss.traverse(kssRoot, {}, function (err, styleguide) {
    styleguide.data.sections.forEach(function (section, idx) {
      var sectionData = styleguide.section(section.data.reference);
      if (typeof sectionData.data !== 'undefined' && section.data.markup !== 'undefined') {
        var partialHeader = normalizeHeader(sectionData.header());

        // Check if we have markup
        if (typeof section.data.markup === 'string') {
          writeMarkup(section.data.markup, styleguide, partialHeader, bundleOutput);
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
function writeMarkup(markup, styleguide, partialHeader, bundleOutput) {
  // Create filename string
  var filename = _huron.program.destination + '/' + partialHeader + '.html';
  var htmlOutput = '';

  // Use jsdom to parse section html
  jsdom.env({
    html: markup,
    done: function done(err, window) {
      if (err) {
        throw err;
      }

      var doc = window.document;
      var templateWrapper = doc.createElement('template');
      var moduleWrapper = doc.createElement('dom-module');
      var wrap = doc.createElement('div');
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

            if (section) {
              // Replace sg-insert with parital insert reference
              insert.parentElement.replaceChild(doc.createElement(normalizeHeader(section.header())), insert);
            } else {
              console.log('section ' + insert.textContent + ' does not exist');
            }
          }
        }

        // Remove styleguide-only elements
        if (skip.length) {
          for (var j = 0; j < skip.length; j++) {
            var exclude = skip.item(j);

            exclude.parentElement.removeChild(skip.item(j));
          }
        }

        templateWrapper.id = partialHeader;
        templateWrapper.innerHTML = doc.body.innerHTML;
        moduleWrapper.appendChild(templateWrapper);
        wrap.appendChild(moduleWrapper);
        htmlOutput = wrap.innerHTML;

        // Write the html
        if ('' !== doc.body.innerHTML) {

          // Write to separate partial
          fs.writeFileSync(filename, htmlOutput, 'utf8', function (err) {
            if (err) {
              throw err;
            }
          });

          // Write to bundle
          if (_huron.program.bundle) {
            bundleOutput.write(htmlOutput);
          }
        }
      }
    }
  });
}