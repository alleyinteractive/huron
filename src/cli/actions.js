// Requires
const cwd = process.cwd(); // Current working directory
const path = require('path');
const fs = require('fs-extra');
const kss = require('kss');
const handlebars = require('handlebars');
const Promise = require('bluebird');
const chalk = require('chalk'); // Colorize terminal output

// Imports
import requireTemplates from './require-templates';

// EXPORTED FUNCTIONS

/**
 * Recursively loop through initial watched files list from Gaze.
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
 * Logic for updating and writing file information based on file type (extension)
 *
 * @param {string} filepath - path to updated file. usually passed in from Gaze
 * @param {object} sections - sections memory store. Becomes an object that records all the
 *                            values that exist from node kss.
 * @param {object} templates - templates memory store
 * @param {object} huron - huron configuration object
 */
export function updateFile(filepath, sections, templates, huron) {
  const file = path.parse(filepath);
  const output = path.relative(path.resolve(cwd, huron.kss), file.dir);
  let sectionRef = null;
  let section = null;
  let outputPath = '';

  return new Promise((resolve, reject) => {
    switch (file.ext) {
      // Plain HTML template, external
      case '.html':
        let content = fs.readFileSync(filepath, 'utf8');

        sectionRef = getSectionRef(file.name, sections);
        section = getSection(sectionRef, sections);

        if (section) {
          content = wrapMarkup(content, section.referenceURI);
          outputPath = copyFile(file.base, output, content, huron);
          buildTemplateObject(section.referenceURI, 'template', outputPath, templates, huron);
          resolve(section.referenceURI);
        } else {
          // Check if this is a prototype file.
          const isPrototype =
            file.dir.indexOf('prototypes') !== -1 &&
            file.name.indexOf('prototype-') !== -1 ? true : false;

          if(isPrototype) {
            // If so, copy over to the huron directory.
            content = wrapMarkup(content, file.name);
            outputPath = copyFile(file.base, output, content, huron);
            buildTemplateObject(file.name, 'template', outputPath, templates, huron);
          } else {
            reject(`Rejected file: ${file.name}`);
          }
        }
        break;

      // Handlebars template, external
      case huron.templates.extension:
        const statesPath = getStatesFromTemplate(file);

        sectionRef = getSectionRef(file.name, sections);
        section = getSection(sectionRef, sections);
        // console.log(chalk.bgBlue('Sections'), sections);

        if (statesPath && section) {
          let content = wrapMarkup(
            fs.readFileSync(filepath, 'utf8'),
            section.referenceURI
          );

          outputPath = copyFile(file.base, output, content, huron);
          buildTemplateObject(section.referenceURI, 'template', outputPath, templates, huron, statesPath, output);
          resolve(section.referenceURI);
        } else {
          reject(`No .json data file was found for template ${filepath}`);
        }
        break;

      // JSON template state data
      case '.json':
        let templatePath = getTemplateFromStates(file);
        const states = JSON.parse(fs.readFileSync(filepath, 'utf8'));

        sectionRef = getSectionRef(file.name, sections);
        section = getSection(sectionRef, sections);
        section.states = states;

        if (templatePath && section) {
          let content = fs.readFileSync(filepath, 'utf8');

          outputPath = copyFile(file.base, output, content, huron);
          buildTemplateObject(section.referenceURI, 'data', outputPath, templates, huron, templatePath, output);
          resolve(section.referenceURI);
        } else {
          reject(`No handlebars template was found for data ${filepath}`);
        }
        break;

      // KSS documentation (default extension is `.css`)
      // Will also output a template if markup is inline
      // Note: inline markup does _not_ support handlebars currently
      case huron.kssExtension:
        const kssSource = fs.readFileSync(filepath, 'utf8');

        if (kssSource) {
          kss.parse(kssSource, huron.kssOptions, (err, styleguide) => {
            if (err) {
              throw err;
            }

            if (styleguide.data.sections.length) {
              section = styleguide.data.sections[0];
              // Check for any HTML tag in the markup section, which should indicate it's using inline HTML
              const isInline = section.data.markup.match(/<\/[^>]*>/) !== null;
              const outputName = section.data.referenceURI;
              const oldData = getSection(filepath, sections);

              if (isInline) {
                // If reference URI has changed, remove old templates
                // and delete template indices from templates memory store
                if (typeof oldData !== 'undefined' && oldData.referenceURI !== section.data.referenceURI) {
                  deleteTemplate(`${oldData.referenceURI}`, 'template', output, templates, huron);
                }

                // Write new inline markup
                const inlineOutput = writeTemplate(outputName, 'template', output, section.data.markup, huron);
                buildTemplateObject(section.data.referenceURI, 'template', inlineOutput, templates, huron);
              }

              if ((oldData && oldData.description !== section.data.description) || !oldData) {
                const descriptionOutput = writeTemplate(outputName, 'description', output, section.data.description, huron);
                buildTemplateObject(section.data.referenceURI, 'description', descriptionOutput, templates, huron);
              }

              // Write separate HTML snippet for description
              updateSection(sections, section, filepath);
              updateMarkup(sections, section, filepath, isInline);
              requireTemplates(huron, templates, sections);

              resolve(section.data.referenceURI);
              console.log('KSS file changed', section.data.referenceURI);
            }
          });
        } else {
          reject(`No KSS source found in ${file.dir}`);
        }
        break;

      // This should never happen if Gaze is working properly
      default:
        reject();
        break;
    }
  });
}

/**
 * Logic for deleting file information and files based on file type (extension)
 *
 * @param {string} filepath - path to updated file. usually passed in from Gaze
 * @param {object} sections - sections memory store
 * @param {object} templates - templates memory store
 * @param {object} huron - huron configuration object
 */
export function deleteFile(filepath, sections, templates, huron) {
  const file = path.parse(filepath);
  const output = path.relative(path.resolve(cwd, huron.kss), file.dir);
  let outputPath = '';
  let sectionRef = null;
  let section = null;
  let sectionStates = null;

  switch (file.ext) {
    // Plain HTML template, external
    case '.html':
      sectionRef = getSectionRef(file.name, sections);
      section = getSection(sectionRef, sections);

      if (section) {
        outputPath = removeFile(file.base, output, huron);
        unbuildTemplateObject(section.referenceURI, outputPath, templates, huron);
        resolve(section.referenceURI);
      } else {
        // Check if this is a prototype file.
        const isPrototype =
          file.dir.indexOf('prototypes') !== -1 &&
          file.name.indexOf('prototype-') !== -1 ? true : false;

        if(isPrototype) {
          // If so, copy over to the huron directory.
          outputPath = removeFile(file.base, output, content, huron);
          unbuildTemplateObject(file.name, outputPath, templates, huron);
        } else {
          reject(`Rejected file: ${file.name}`);
        }
      }
      break;

    case huron.templates.extension:
      const statesPath = getStatesFromTemplate(file);

      sectionRef = getSectionRef(file.name, sections);
      section = getSection(sectionRef, sections);
      sections.delete(`markup_${file.name}`, storeCb);

      console.log(sections);

      // Remove partner
      partner = path.parse(partnerPath);
      outputPath = removeFile(partner.base, output, huron);
      unbuildTemplateObject(partner.name, outputPath, templates, huron);

      // Remove file
      outputPath = removeFile(file.base, output, huron);
      unbuildTemplateObject(file.name, outputPath, templates, huron);
      break;

    case '.json':
      const templatePath = getTemplateFromStates(file);

      sectionRef = getSectionRef(file.name, sections);
      section = getSection(sectionRef, sections);
      sections.delete(`markup_${file.name}`, storeCb);

      console.log(sections);

      // Remove partner
      partner = path.parse(partnerPath);
      outputPath = removeFile(partner.base, output, huron);
      unbuildTemplateObject(partner.name, outputPath, templates, huron);

      // Remove file
      outputPath = removeFile(file.base, output, huron);
      unbuildTemplateObject(file.name, outputPath, templates, huron);
      break;

    case huron.kssExtension:
      section = getSection(filepath, sections);

      if (section) {
        const isInline = section.markup.match(/<\/[^>]*>/) !== null;

        // Remove associated inline template
        if (isInline) {
          deleteTemplate(`${section.referenceURI}`, 'template', output, templates, huron);
        }

        // Remove description template
        deleteTemplate(`${section.referenceURI}`, 'description', output, templates, huron);

        // Remove section data from memory store
        unsetSection(sections, section, filepath);
      }
      break;
  }
}

// INTERNAL FUNCTIONS

/**
 * Update the sections store with new data for a specific section
 *
 * @param {object} sections - sections memory store
 * @param {object} section - contains updated section data
 * @param {string} sectionPath - path to KSS section
 */
function updateSection(sections, section, sectionPath) {
  const oldData = getSection(sectionPath, sections);
  const newData = section.data ? section.data : section;
  const sectionMarkup = section.data ? section.data.markup : section.markup;
  const sorted = getSection('sorted', sections) || {};
  const newSort = sortSection(sorted, newData.referenceURI);
  let resetData = null;


  // Store section data based on filepath so we can garbage-collect references
  // in the future
  if (oldData) {
    // If section exists, merge section data
    resetData = Object.assign({}, oldData, newData);
    // Remove old section from sorted data
    sections.delete(oldData.referenceURI, storeCb);
    unsortSection(sorted, oldData.referenceURI);
  } else {
    // If section does not exist, set the new section
    resetData = newData;
  }

  // Add entries to memory store for both filepath and reference URI
  sections.set(sectionPath, resetData, storeCb);
  sections.set(newData.referenceURI, resetData, storeCb);

  // Update section sorting
  sections.set('sorted', newSort, storeCb);
}

/**
 * Remove a section from the memory store
 *
 * @param {object} sections - sections memory store
 * @param {object} section - contains updated section data
 * @param {string} sectionPath - path to KSS section
 */
function unsetSection(sections, section, sectionPath) {
  const sorted = getSection('sorted', sections) || {};

  sections.delete(sectionPath, storeCb);
  sections.delete(section.referenceURI, storeCb);
  unsortSection(sorted, section.referenceURI);
}

/**
 * Remove a section from the sorted sections
 *
 * @param {object} sorted - currently sorted sections
 * @param {string} reference - reference URI of section to sort
 */
function unsortSection(sorted, reference) {
  let parts = reference.split('-');

  if (sorted[parts[0]]) {
    if (parts.length > 1) {
      let newParts = parts.filter((part, idx) => {
        return idx !== 0;
      });
      unsortSection(sorted[parts[0]], newParts.join('-'));
    } else {
      delete sorted[parts[0]];
    }
  }
}

/**
 * Sort sections and subsections
 *
 * @param {object} sorted - currently sorted sections
 * @param {string} reference - reference URI of section to sort
 */
function sortSection(sorted, reference) {
  let parts = reference.split('-');
  let newSort = sorted[parts[0]] || {};

  if (parts.length > 1) {
    let newParts = parts.filter((part, idx) => {
      return idx !== 0;
    });
    sorted[parts[0]] = sortSection(newSort, newParts.join('-'));
  } else {
    sorted[parts[0]] = newSort;
  }

  return sorted;
}

/**
 * Update markup field in sections memory store
 *
 * @param {object} sections - sections memory store
 * @param {object} section - contains updated section data
 * @param {string} sectionPath - path to KSS section
 * @param {bool} isInline - is the markup inline in the KSS docs, or external?
 */
function updateMarkup(sections, section, sectionPath, isInline) {
  const sectionMarkup = section.data ? section.data.markup : section.markup;
  // If markup is not inline, set a value for the markup filename
  // to allow us to easily determine the section reference based on a Gaze
  // 'changed' event to the markup file.
  if (sectionMarkup && !isInline) {
    let markup = {};

    markup.section = sectionPath;
    markup.template = sectionMarkup;

    let templateFile = path.parse(markup.template);

    sections.set(
      `markup_${templateFile.name}`,
      markup,
      storeCb
    );
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
    return false;
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
      return false;
    }
  }

  return templatePath;
}

/**
 * Default callback for store functions
 *
 * @param   {Error} err - error passed in from memory-store
 * @return  {multiple} - The data that was requested.
 */
function storeCb(err, data) {
  if (err) {
    throw err;
  }

  if(data) {
    return data;
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
 * Wrap html in required template tags
 *
 * @param {string} content - html or template markup
 * @param {string} templateId - id of template (should be section referenceURI)
 */
function wrapMarkup(content, templateId) {
  return `<dom-module>
    <template id="${templateId}">
      ${content}
    </template>
  </dom-module>\n`;
}

/**
 * Output an HTML snippet for a template
 *
 * @param {string} id - key at which to store this template's path in the templates store
 * @param {string} type - type of file to output. Options are 'template', 'description', or 'state'
 * @param {string} output - output path
 * @param {string} templatePath - path relative to huron.root for requiring template
 * @param {string} content - file content to write
 * @param {object} huron - huron config object
 */
function writeTemplate(id, type, output, content, huron) {
  // Create absolute and relative output paths. Relative path will be used to require the template for HMR.
  let key = `${type}-${id}`;
  let outputRelative = path.join(huron.output, output, `${key}.html`);
  let outputPath = path.resolve(cwd, huron.root, outputRelative);

  fs.outputFileSync(outputPath, wrapMarkup(content, id));
  console.log(`Writing ${outputPath}`);

  return outputRelative;
}

/**
 * Delete an HTML snippet for a template
 *
 * @param {string} id - key at which to store this template's path in the templates store
 * @param {string} type - type of file to output. Options are 'template', 'description', 'data' or 'section'
 * @param {string} output - output path
 * @param {string} templatePath - path relative to huron.root for requiring template
 * @param {object} templates - templates memory store
 * @param {object} huron - huron config object
 */
function deleteTemplate(id, type, output, templates, huron) {
  // Create absolute and relative output paths. Relative path will be used to require the template for HMR.
  let key = `${id}-${type}`;
  let outputRelative = path.join(huron.output, output, `${key}.html`);
  let outputPath = path.resolve(cwd, huron.root, outputRelative);

  try {
    fs.unlinkSync(outputPath);
  } catch (e) {
    console.log('Error deleting file:', key, outputPath);
  }

  console.log(`Deleting ${outputPath}`);
}

/**
 * Copy an HTML file into the huron output directory.
 * @param  {string} filename - The name of the file (with extension).
 * @param  {string} output - The relative path to this file within the huron.kss directory.
 * @param  {string} content - The content of the file to write.
 * @param  {object} huron - The huron config object.
 *
 * @return {string} The location where the file was saved.
 */
function copyFile(filename, output, content, huron) {
  const outputRelative = path.join(huron.output, output, `${filename}`);
  const outputPath = path.resolve(cwd, huron.root, outputRelative);

  try {
    fs.outputFileSync(outputPath, content);
  } catch(e) {
    console.log(filename, outputPath);
  }
  return outputRelative;
}

/**
 * Delete a file in the huron output directory
 * @param  {string} filename - The name of the file (with extension).
 * @param  {string} output - The relative path to this file within the huron.kss directory.
 * @param  {object} huron - The huron config object.
 *
 * @return {string} The location where the file was saved.
 */
function removeFile(filename, output, huron) {
  const outputRelative = path.join(huron.output, output, `${filename}`);
  const outputPath = path.resolve(cwd, huron.root, outputRelative);

  try {
    fs.ulinkSync(outputPath);
  } catch(e) {
    console.log(filename, outputPath);
  }

  return outputRelative;
}

/**
 * Request for section reference based on filename
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
      return false;
    }
  });
}

/**
 * Request for section data based on section reference
 *
 * @param {string} ref - reference key for section in memory store (filepath in this case)
 * @param {obj} sections - sections memory store
 */
function getSection(ref, sections) {
  return sections.get(ref, (err, section) => {
    if (err) {
      throw err;
    }

    if (section) {
      return section;
    } else {
      return false;
    }
  });
}

/**
 * Build object to store template information
 *
 * @param  {string} key         The key that will hold this object.
 * @param  {string} type        The type of styleguide comonent this is (template, data, or description).
 * @param  {string} filePath    The path to the file.
 * @param  {object} templates   Pointer to the templates store to modify.
 * @param  {object} huron       Huron config
 * @param  {string} partnerPath Path to partner file (usually data file for a template)
 * @param  {string} output      Output directory
 */
function buildTemplateObject(key, type, filePath, templates, huron, partnerPath = false, output = false) {
  const templateObject = templates.get(key, storeCb) || {};
  const requirePath = `./${path.relative(path.resolve(cwd, huron.output), filePath)}`;

  if (partnerPath && output) {
    const partnerInfo = path.parse(partnerPath);
    const partnerRelative = path.join(output, partnerInfo.base);

    templates.set(requirePath, `./${partnerRelative}`, storeCb);
  }

  templateObject[type] = requirePath;
  templates.set(key, templateObject, storeCb);
}

/**
 * Remove template information
 *
 * @param  {string} key         The key that will hold this object.
 * @param  {string} filePath    The path to the file.
 * @param  {object} templates   Pointer to the templates store to modify.
 * @param  {object} huron       Huron config
 */
function unbuildTemplateObject(key, filePath, templates, huron) {
  const requirePath = `./${path.relative(path.resolve(cwd, huron.output), filePath)}`;

  templates.delete(requirePath, storeCb);
  templates.delete(key, storeCb);
}
