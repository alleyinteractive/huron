import { program } from './huron.js';

const fs = require('fs'); // File system
const kss = require('kss'); // node implementation of KSS: a methodology for documenting CSS and generating style guides
const jsdom = require('jsdom'); // JavaScript implementation of the WHATWG DOM and HTML

// Parse KSS and insert into an HTML partial
export default function kssTraverse(files) {
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