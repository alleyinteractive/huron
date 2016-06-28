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
                console.warn(error);
              }
            );
        }
        break;
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
  const output = path.relative(path.resolve(cwd, huron.kss), file.dir);
  let sectionRef = null;
  let section = null;

  return new Promise((resolve, reject) => {
    switch (file.ext) {
      // Plain HTML template, external
      case '.html':
        let content = fs.readFileSync(filepath, 'utf8');
        sectionRef = getSectionRef(file.name, sections);
        section = getSection(sectionRef, sections);

        if (section) {
          writeTemplate(section.referenceURI, output, content, templates, huron);
          resolve(section.referenceURI);
        } else {
          reject(file.name);
        }
        break;

      // Handlebars template, external
      case '.hbs':
      case '.handlebars':
        const statesPath = getStatesFromTemplate(file);
        sectionRef = getSectionRef(file.name, sections);
        section = getSection(sectionRef, sections);

        if (statesPath && section) {
          writeStateTemplates(section.referenceURI, filepath, statesPath, output, templates, huron);
          resolve(section.referenceURI);
        } else {
          reject(`No .json data file was found for template ${filepath}`);
        }
        break;

      // JSON template state data
      case '.json':
        let templatePath = getTemplateFromStates(file);
        sectionRef = getSectionRef(file.name, sections);
        section = getSection(sectionRef, sections);

        if (templatePath && section) {
          writeStateTemplates(section.referenceURI, templatePath, filepath, output, templates, huron);
          resolve(section.referenceURI);
        } else {
          reject(`No handlebars template was found for data ${filepath}`);
        }
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
              section = styleguide.data.sections[0];
              const isInline = section.data.markup.match(/<\/[^>]*>/) !== null;
              const outputName = section.data.referenceURI;
              const oldData = getSection(filepath, sections, true);

              if (isInline) {
                // If reference URI has changed, remove old templates
                // and delete template indices from templates memory store
                if (typeof oldData !== 'undefined' && oldData.referenceURI !== section.data.referenceURI) {
                  deleteTemplate(`${oldData.referenceURI}`, output, templates, huron);

                  // Output update requires
                  requireTemplates(huron, templates, sections);
                }

                // Write new inline markup
                writeTemplate(outputName, output, section.data.markup, templates, huron);
              }

              if (oldData && oldData.description !== section.data.description) {
                deleteTemplate(`${oldData.referenceURI}-description`, output, templates, huron);
              }

              // Write separate HTML snippet for description
              writeTemplate(`${outputName}-description`, output, section.data.description, templates, huron);
              updateSection(sections, section, filepath, isInline);

              resolve(section.data.referenceURI);
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

/**
 * Logic for deleting file inforormation based on file type (extension)
 *
 * @param {string} filepath - path to updated file. usually passed in from Gaze
 * @param {object} sections - sections memory store
 * @param {object} templates - templates memory store
 * @param {object} huron - huron configuration object
 */
export function deleteFile(filepath, sections, templates, huron) {
  const file = path.parse(filepath);
  const output = path.relative(path.resolve(cwd, huron.kss), file.dir);
  let sectionRef = null;
  let section = null;

  switch (file.ext) {
    // Plain HTML template, external
    case '.html':
      sectionRef = getSectionRef(file.name, sections);
      section = getSection(sectionRef, sections);

      // Delete file
      deleteTemplate(secton.referenceURI, output, templates, huron);
      break;

    case '.hbs':
    case '.handlebars':
      const statesPath = getStatesFromTemplate(file);
      sectionRef = getSectionRef(file.name, sections);
      section = getSection(sectionRef, sections);

      if (statesPath && section) {
        deleteStateTemplates(section.referenceURI, filepath, statesPath, output, templates, huron);
      }
      break;

    case '.json':
      break;

    case huron.kssExt:
      section = getSection(filepath, sections);

      if (section) {
        const isInline = section.markup.match(/<\/[^>]*>/) !== null;

        if (isInline) {
          deleteTemplate(`${section.referenceURI}`, output, templates, huron);
        }

        deleteTemplate(`${section.referenceURI}-description`, output, templates, huron);
      }
      break;
  }

  console.log(`${filepath} deleted`);
}

// INTERNAL FUNCTIONS

/**
 * Update the sections store with new data for a specific section
 *
 * @param {object} sections - sections memory store
 * @param {object} section - contains updated section data
 * @param {string} sectionPath - path to KSS section
 * @param {bool} isInline - is the markup inline in the KSS docs, or external?
 */
function updateSection(sections, section, sectionPath, isInline) {
  const oldData = getSection(sectionPath, sections, true);

  // If markup is not inline, set a value for the markup filename
  // to allow us to easily determine the section reference based on a Gaze
  // 'changed' event to the markup file.
  if (section.data.markup && !isInline) {
    let markup = {};

    markup.section = sectionPath;
    markup.template = section.data.markup;

    let templateFile = path.parse(markup.template);

    sections.set(
      `markup_${templateFile.name}`,
      markup,
      storeCb
    );
  }

  // Store section data based on filepath so we can garbage-collect references
  // in the future
  if (oldData) {
    // If section exists, merge section data
    sections.set(
      sectionPath,
      Object.assign({}, oldData, section.data),
      storeCb
    );
  } else {
    // If section does not exist, simple set the new section
    sections.set(sectionPath, section.data, storeCb);
  }
}

/**
 * Find a .json file containing state data from a handlebars template
 *
 * @param {object} file - file object from path.parse()
 */
function getStatesFromTemplate(file) {
  const statePath = path.resolve(file.dir, `${file.name}.json`);

  try {
    fs.accessSync(statePath, fs.F_OK);
  } catch (e) {
    console.log(e);
    console.warn(`no data provided for template ${file.base}`);
  }

  return statePath;
}

/**
 * Find a handlebars template a state data file
 *
 * @param {object} file - file object from path.parse()
 */
function getTemplateFromStates(file) {
  let templatePath = false;

  try {
    templatePath = path.resolve(file.dir, `${file.name}.hbs`);
    fs.accessSync(templatePath, fs.F_OK);
  } catch (e) {
    try {
      templatePath = path.resolve(file.dir, `${file.name}.handlebars`);
      fs.accessSync(templatePath, fs.F_OK);
    } catch(e) {
      console.warn(`no template provided for data ${file.base}`);
    }
  }

  return templatePath;
}

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
 * Output an HTML snippet for each state listed in JSON data, using handlebars template
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
 * delete an HTML snippet for each state listed in JSON data, using handlebars template
 *
 * @param {string} filename - name of file without extension (extension will always be `.html`)
 * @param {string} templatePath - path to handlebars template
 * @param {string} statesPath - path to JSON state data
 * @param {string} output - output path
 * @param {object} templates - templates memory store
 * @param {object} huron - huron config object
 */
function deleteStateTemplates(filename, templatePath, statesPath, output, templates, huron) {
  const states = JSON.parse(fs.readFileSync(statesPath, 'utf8'));

  for (let state in states) {
    deleteTemplate(`${filename}-${state}`, output, templates, huron);
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
  // HTML does not allow tags starting with a number
  if (parseInt(id.charAt(0), 10)) {
    id = `template-${id}`;
  }

  // Create absolute and relative output paths. Relative path will be used to require the template for HMR.
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
 * Delete an HTML snippet for a template
 *
 * @param {string} id - key at which to store this template's path in the templates store
 * @param {string} output - output path
 * @param {string} templatePath - path relative to huron.root for requiring template
 * @param {object} templates - templates memory store
 * @param {object} huron - huron config object
 */
function deleteTemplate(id, output, templates, huron) {
  // HTML does not allow tags starting with a number
  if (parseInt(id.charAt(0), 10)) {
    id = `template-${id}`;
  }

  // Create absolute and relative output paths. Relative path will be used to require the template for HMR.
  let outputRelative = path.join(huron.templates, output, `${id}.html`);
  let outputPath = path.resolve(cwd, huron.root, outputRelative);

  templates.delete(id, storeCb);
  fs.unlinkSync(outputPath);

  console.log(`deleting ${outputPath}`);
}

/**
 * Async request for section reference based on filename
 *
 * @param {string} filename - name of markup file that was changed or added
 * @param {obj} sections - sections memory store
 */
function getSectionRef(filename, sections) {
  return sections.get(`markup_${filename}`, (err, data) => {
    if (err) {
      throw err;
    }

    if (data && data.section) {
      return data.section;
    } else {
      console.warn(`no section reference found for ${filename}`);
      return false;
    }
  });
}

/**
 * Async request for section data based on section reference
 *
 * @param {string} ref - reference key for section in memory store (filepath in this case)
 * @param {obj} sections - sections memory store
 * @param {bool} suppress - suppress errors
 */
function getSection(ref, sections, suppress) {
  return sections.get(ref, (err, section) => {
    if (err) {
      throw err;
    }

    if (section) {
      return section;
    } else {
      if (! suppress) {
        console.warn(`no section found for ${ref}`);
      }
      return false;
    }
  });
}
