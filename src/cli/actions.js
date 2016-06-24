// Requires
const cwd = process.cwd(); // Current working directory
const path = require('path');
const fs = require('fs-extra');
const kss = require('kss');
const handlebars = require('handlebars');
const Promise = require('bluebird');

// Imports
import requireTemplates from './require-templates';

// EXPORTED FUNCTIONS

/**
 * Recursively loop through initial watched files list from Gaze
 *
 * @param {object} data - object containing directory and file paths
 * @param {object} sections - sections memory store
 * @param {object} templates - templates memory store
 * @param {object} huron - huron configuration options
 */
export function initFiles(data, sections, templates, huron, depth = 0) {
  const type = Object.prototype.toString.call( data );
  const currentDepth = depth++;

  return new Promise((resolve, reject) => {
    switch (type) {
      case '[object Object]':
        for (let file in data) {
          initFiles(data[file], sections, templates, huron, depth)
            .then(() => {
              resolve(data);
            });
        }
        break;

      case '[object Array]':
        data.forEach(file => {
          initFiles(file, sections, templates, huron, depth)
            .then(() => {
              resolve(data);
            });
        });
        break;

      case '[object String]':
        const info = path.parse(data);
        if (info.ext) {
          updateFile(data, sections, templates, huron)
            .then(
              (sectionURI) => {
                resolve(data);
              },
              (error) => {
                console.log(error);
              }
            );
        }
        break;
    }
  });
}

/**
 * Update the sections store with new data for a specific section
 *
 * @param {object} sections - sections memory store
 * @param {object} section - contains updated section data
 * @param {bool} isInline - is the markup for this section inline or external?
 */
export function updateSection(sections, section, isInline) {
  // If markup is not inline, set a value for the markup filename
  // to allow us to easily determine the section reference based on a Gaze
  // 'changed' event to the markup file.
  if (section.data.markup && !isInline) {
    let markup = {};

    markup.section = section.data.referenceURI;
    markup.template = section.data.markup

    sections.set(
      `markup_${path.parse(markup.template).name}`,
      markup,
      storeCb
    );
  }

  sections.get(section.data.referenceURI, (err, data) => {
    if (data) {
      // If section exists, merge section data
      sections.set(
        section.data.referenceURI,
        Object.assign({}, data, section.data),
        storeCb
      );
    } else {
      // If section does not exist, simple set the new section
      sections.set(section.data.referenceURI, section.data, storeCb);
    }
  });
}

/**
 * Logic for updating file inforormation based on file type (extension)
 *
 * @param {string} filepath - path to updated file. usually passed in from Gaze
 * @param {object} sections - sections memory store
 * @param {object} templates - templates memory store
 * @param {object} huron - huron configuration object
 */
export function updateFile(filepath, sections, templates, huron) {
  const file = path.parse(filepath);
  const filename = file.name.replace('_', '');
  const output = path.relative(path.resolve(cwd, huron.kss), file.dir);

  return new Promise((resolve, reject) => {
    switch (file.ext) {
      // Plain HTML template, external
      case '.html':
        getSectionRef(file.name, sections)
          .then(sectionRef => {
            return getSection(sectionRef, sections);
          })
          .then(section => {
            let content = fs.readFileSync(filepath, 'utf8');
            writeTemplate(section.referenceURI, output, content, templates, huron);
            resolve(section.referenceURI);
          });
        break;

      // Handlebars template, external
      case '.hbs':
      case '.handlebars':
        getSectionRef(file.name, sections)
          .then(sectionRef => {
            return getSection(sectionRef, sections);
          })
          .then(section => {
            const statesPath = path.resolve(file.dir, `${file.name}.json`);

            try {
              fs.accessSync(statesPath, fs.F_OK);
            } catch (e) {
              console.log(`no data provided for template ${file.base}`);
            }

            writeStateTemplates(section.referenceURI, filepath, statesPath, output, templates, huron);
            resolve(section.referenceURI);
          });
        break;

      // JSON template state data
      case '.json':
        getSectionRef(file.name, sections)
          .then(sectionRef => {
            return getSection(sectionRef, sections);
          })
          .then(section => {
            let templatePath = null;

            try {
              templatePath = path.resolve(file.dir, `${file.name}.hbs`);
              fs.accessSync(templatePath, fs.F_OK);
            } catch (e) {
              try {
                templatePath = path.resolve(file.dir, `${file.name}.handlebars`);
                fs.accessSync(templatePath, fs.F_OK);
              } catch(e) {
                console.log(`no template provided for data ${file.base}`);
              }
            }

            writeStateTemplates(section.referenceURI, templatePath, filepath, output, templates, huron);
            resolve(section.referenceURI);
          });
        break;

      // KSS documentation (default extension is `.css`)
      // Will also output a template if markup is inline
      // Note: inline markup does _not_ support handlebars currently
      case huron.kssExt:
        const kssSource = fs.readFileSync(filepath, 'utf8');

        if (kssSource) {
          kss.parse(kssSource, huron.kssOptions, (err, styleguide) => {
            if (err) {
              throw err;
            }

            if (styleguide.data.sections.length) {
              const section = styleguide.data.sections[0];
              const isInline = section.data.markup.match(/<\/[^>]*>/) !== null;
              const outputName = section.data.referenceURI;

              if (isInline) {
                writeTemplate(outputName, output, section.data.markup, templates, huron);
              }

              writeTemplate(`${outputName}-description`, output, section.data.description, templates, huron);
              updateSection(sections, section, isInline);
            }
          });
        } else {
          reject(`No KSS source found in ${file.dir}`);
        }
        break;

      // This should never happen if Gaze is working properly
      default:
        reject('unrecognized filetype');
        break;
    }
  });
}

// INTERNAL FUNCTIONS

/**
 * Default callback for store functions
 *
 * @param {Error} err - error passed in from memory-store
 */
function storeCb(err) {
  if (err) {
    throw err;
  }
}

/**
 * Normalize a section title for use as a filename
 *
 * @param {string} header - section header extracted from KSS documentation
 */
function normalizeHeader(header) {
  return header
    .toLowerCase()
    .replace(/\s?\W\s?/g, '-');
}

/**
 * Output an HTML stnippet for each state listed in JSON data, using handlebars template
 *
 * @param {string} filename - name of file without extension (extension will always be `.html`)
 * @param {string} templatePath - path to handlebars template
 * @param {string} statesPath - path to JSON state data
 * @param {string} output - output path
 * @param {object} templates - templates memory store
 * @param {object} huron - huron config object
 */
function writeStateTemplates(filename, templatePath, statesPath, output, templates, huron) {
  const states = JSON.parse(fs.readFileSync(statesPath, 'utf8'));
  const template = handlebars.compile(fs.readFileSync(templatePath, 'utf8'));

  for (let state in states) {
    writeTemplate(
      `${filename}-${state}`,
      output,
      template(states[state]),
      templates,
      huron
    );
  };
}

/**
 * Output an HTML snippet for a template
 *
 * @param {string} id - key at which to store this template's path in the templates store
 * @param {string} output - output path
 * @param {string} templatePath - path relative to huron.root for requiring template
 * @param {string} content - file content to write
 * @param {object} templates - templates memory store
 * @param {object} huron - huron config object
 */
function writeTemplate(id, output, content, templates, huron) {
  let outputRelative = path.join(huron.templates, output, `${id}.html`);
  let outputPath = path.resolve(cwd, huron.root, outputRelative);

  content = [
    `<template id="${id}">`,
    content,
    '</template>',
  ].join('\n');

  templates.set(id, `./${outputRelative}`, storeCb);
  fs.outputFileSync(outputPath, content);
  console.log(`writing ${outputPath}`);
}

/**
 * Async request for section reference based on filename
 *
 * @param {string} filename - name of markup file that was changed or added
 * @param {obj} sections - sections memory store
 */
function getSectionRef(filename, sections) {
  return new Promise((resolve, reject) => {
    sections.get(`markup_${filename}`, (err, data) => {
      if (err) {
        reject(err);
      }

      if (data && data.section) {
        resolve(data.section);
      }
    });
  });
}

/**
 * Async request for section data based on section reference
 *
 * @param {string} ref - reference URI for section
 * @param {obj} sections - sections memory store
 */
function getSection(ref, sections) {
  return new Promise((resolve, reject) => {
    sections.get(ref, (err, section) => {
      if (err) {
        reject(err);
      }

      resolve(section);
    });
  });
}
