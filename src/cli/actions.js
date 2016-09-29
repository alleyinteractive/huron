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
 * @param {object} store - memory store
 * @param {object} huron - huron configuration options
 */
export function initFiles(data, store, depth = 0) {
  const huron = store.get('config');
  const type = Object.prototype.toString.call( data );
  const currentDepth = depth++;

  switch (type) {
    case '[object Object]':
      for (let file in data) {
        store = initFiles(data[file], store, depth);
      }
      break;

    case '[object Array]':
      data.forEach(file => {
        store = initFiles(file, store, depth);
      });
      break;

    case '[object String]':
      const info = path.parse(data);
      if (info.ext) {
        store = updateFile(data, store)
      }
      break;
  }

  return store;
}

/**
 * Logic for updating and writing file information based on file type (extension)
 *
 * @param {string} filepath - path to updated file. usually passed in from Gaze
 * @param {object} store - memory store
 */
export function updateFile(filepath, store) {
  const huron = store.get('config');
  const file = path.parse(filepath);
  const output = path.relative(path.resolve(cwd, huron.get('kss')), file.dir);
  let newStore = store;
  let sectionRef = null;
  let section = null;
  let outputPath = '';

  switch (file.ext) {
    // Plain HTML template, external
    case '.html':
      section = getSection(file.base, 'markup', store);

      if (section) {
        content = wrapMarkup(
          fs.readFileSync(filepath, 'utf8'),
          section.referenceURI
        );
        outputPath = copyFile(file.base, output, content, huron);

        section.templatePath = filepath;
        newStore = store;
      } else if (
        file.dir.indexOf('prototypes') !== -1 &&
        file.name.indexOf('prototype-') !== -1
      ) {
        // If so, copy over to the huron directory.
        let content = wrapMarkup(content, file.name);
        outputPath = copyFile(file.base, output, content, huron);

        newStore = store.setIn(
          ['prototypes', file.name],
          outputPath
        );
      } else {
        console.log(chalk.red(`Failed to write file: ${file.name}`));
      }

      break;

    // Handlebars template, external
    case huron.get('templates').extension:
    case '.json':
      const field = ('.json' === file.ext) ? 'data' : 'markup';

      section = getSection(file.base, field, store);

      if (section) {
        const dest = path.resolve(cwd, huron.get('output'));
        const pairPath = getTemplateDataPair(file, section);
        const pairRelative = `./${path.relative(dest, pairPath)}`;
        const requirePath = `./${path.relative(dest, filepath)}`;
        let content = fs.readFileSync(filepath, 'utf8');

        if (huron.get('templates').extension === file.ext) {
          content = wrapMarkup(content, section.referenceURI);
        };

        outputPath = copyFile(file.base, output, content, huron);
        newStore = store.setIn(
          ['templates', requirePath],
          pairRelative
        );
        section[`${field}Path`] = filepath;
      } else {
        console.log(chalk.red(`No pairing (data or template) file was found for template ${filepath}`));
      }
      break;

    // KSS documentation (default extension is `.css`)
    // Will also output a template if markup is inline
    // Note: inline markup does _not_ support handlebars currently
    case huron.get('kssExtension'):
      const kssSource = fs.readFileSync(filepath, 'utf8');

      if (kssSource) {
        kss.parse(kssSource, huron.get('kssOptions'), (err, styleguide) => {
          if (err) {
            throw err;
          }

          if (styleguide.data.sections.length) {
            section = normalizeSectionData(styleguide.data.sections[0]);
            // Check for any HTML tag in the markup section, which should indicate it's using inline HTML
            const isInline = section.markup.match(/<\/[^>]*>/) !== null;
            const outputName = section.referenceURI;
            const oldData = getSection(filepath, false, store);

            if (isInline) {
              // If reference URI has changed, remove old templates
              // and delete template indices from templates memory store
              if (oldData && oldData.referenceURI !== section.referenceURI) {
                deleteTemplate(`${oldData.referenceURI}`, 'template', output, store);
              }

              // Write new inline markup
              const inlineOutput = writeTemplate(outputName, 'template', output, section.markup, huron);
            }

            if ((oldData && oldData.description !== section.description) || !oldData) {
              const descriptionOutput = writeTemplate(outputName, 'description', output, section.description, huron);
            }

            // Write separate HTML snippet for description
            newStore = updateSection(section, filepath, isInline, store);
            requireTemplates(newStore);
            console.log(chalk.green(`KSS file changed or added ${section.referenceURI}`));
          } else {
            console.log(chalk.magenta(`No KSS found in ${filepath}`));
          }
        });
      } else {
        console.log(chalk.red(`${filepath} does not exist or is empty`));
      }
      break;

    // This should never happen if Gaze is working properly
    default:
      return newStore;
      break;
  }

  return newStore;
}

/**
 * Logic for deleting file information and files based on file type (extension)
 *
 * @param {string} filepath - path to updated file. usually passed in from Gaze
 * @param {object} store - memory store
 */
export function deleteFile(filepath, store) {
  const huron = store.get('config');
  const file = path.parse(filepath);
  const output = path.relative(path.resolve(cwd, huron.get('kss')), file.dir);
  let outputPath = '';
  let sectionRef = null;
  let section = null;
  let sectionStates = null;
  let newStore = store;

  switch (file.ext) {
    // Plain HTML template, external
    case '.html':
      section = getSection(file.base, 'markup', store);

      if (section) {
        outputPath = removeFile(file.base, output, huron);
      } else if (
        file.dir.indexOf('prototypes') !== -1 &&
        file.name.indexOf('prototype-') !== -1
      ) {
        outputPath = removeFile(file.base, output, content, huron);
      }
      break;

    case huron.get('templates').extension:
    case '.json':
      const field = ('.json' === file.ext) ? 'data' : 'markup';
      section = getSection(file.base, field, store);

      if (section) {
        const dest = path.resolve(cwd, huron.get('output'));
        const statesPath = getTemplateDataPair(file, section);
        const requirePath = `./${path.relative(dest, filepath)}`;

        newStore = store.deleteIn(['templates', requirePath]);

        // Remove partner
        outputPath = removeFile(file.base, output, huron);
      }
      break;

    case huron.get('kssExtension'):
      section = getSection(filepath, false, store);

      if (section) {
        const isInline = section.markup.match(/<\/[^>]*>/) !== null;

        // Remove associated inline template
        if (isInline) {
          deleteTemplate(`${section.referenceURI}`, 'template', output, store);
        }

        // Remove description template
        deleteTemplate(section.referenceURI, 'description', output, store);

        // Remove section data from memory store
        unsetSection(sections, section, filepath);
      }
      break;

    default:
      consle.log(`Could not delete: ${file.name}`);
      return newStore;
      break;
  }

  return newStore;
}

// INTERNAL FUNCTIONS

function normalizeSectionData(section) {
  if (section.data) {
    return section.data;
  }

  return section;
}

/**
 * Update the sections store with new data for a specific section
 *
 * @param {object} section - contains updated section data
 * @param {string} sectionPath - path to KSS section
 * @param {bool} isInline - is the markup inline in KSS?
 * @param {object} store - memory store
 */
function updateSection(section, sectionPath, isInline, store) {
  const oldData = getSection(sectionPath, false, store);
  const sectionMarkup = section.markup;
  const sectionFileInfo = path.parse(sectionPath);
  let resetData = null;
  let newSort = sortSection(
    store.getIn(['sections', 'sorted']),
    section.referenceURI
  );

  // Store section data based on filepath so we can garbage-collect references
  // in the future
  if (oldData) {
    // If section exists, merge section data
    resetData = Object.assign({}, oldData, section);
    newSort = unsortSection(newSort, oldData.referenceURI);
  } else {
    // If section does not exist, set the new section
    resetData = section;
  }

  // Required for reference from templates and data
  resetData.sectionPath = sectionPath;

  // Update section sorting
  return store
    .setIn(
      ['sections', 'sectionsByPath', sectionPath],
      resetData
    )
    .setIn(
      ['sections', 'sorted'],
      newSort
    );
}

/**
 * Remove a section from the memory store
 *
 * @param {object} section - contains updated section data
 * @param {string} sectionPath - path to KSS section
 * @param {object} store - memory store
 */
function unsetSection(section, sectionPath, store) {
  const newSort = unsortSection(sorted, section.referenceURI);
  return store
    .deleteIn(['sections', 'sectionsByPath', sectionPath])
    .setIn(['sections', 'sorted'], newSort);
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
      sorted = unsortSection(sorted[parts[0]], newParts.join('-'));
    } else {
      delete sorted[parts[0]];
    }
  }

  return sorted;
}

/**
 * Find .json from a template file or vice versa
 *
 * @param {object} file - file object from path.parse()
 * @param {object} section - KSS section data
 */
function getTemplateDataPair(file, section) {
  let pairPath = false;

  if ('.json' === file.ext) {
    pairPath = path.join(file.dir, section.markup);
  } else {
    pairPath = path.join(file.dir, section.data);
  }

  return pairPath;
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
  let outputRelative = path.join(huron.get('output'), output, `${key}.html`);
  let outputPath = path.resolve(cwd, huron.get('root'), outputRelative);

  fs.outputFileSync(outputPath, wrapMarkup(content, id));

  console.log(chalk.green(`Writing ${outputRelative}`));

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
function deleteTemplate(id, type, output, store) {
  // Create absolute and relative output paths. Relative path will be used to require the template for HMR.
  const huron = store.get('config');
  let key = `${id}-${type}`;
  let outputRelative = path.join(huron.get('output'), output, `${key}.html`);
  let outputPath = path.resolve(cwd, huron.get('root'), outputRelative);

  try {
    fs.unlinkSync(outputPath);
    console.log(chalk.green(`Deleting ${outputRelative}`));
  } catch (e) {
    console.log(chalk.red(`Error deleting file: ${key} ${outputRelative}`));
  }

  return outputPath;
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
  const outputRelative = path.join(huron.get('output'), output, `${filename}`);
  const outputPath = path.resolve(cwd, huron.get('root'), outputRelative);

  try {
    fs.outputFileSync(outputPath, content);
    console.log(chalk.green(`Writing ${outputRelative}`));
  } catch(e) {
    console.log(chalk.red(`Failed to write ${outputRelative}`));
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
  const outputRelative = path.join(huron.get('output'), output, `${filename}`);
  const outputPath = path.resolve(cwd, huron.get('root'), outputRelative);

  try {
    fs.removeSync(outputPath);
    console.log(chalk.green(`Removing ${outputRelative}`));
  } catch(e) {
    console.log(chalk.red(`${outputRelative} does not exist`));
  }

  return outputRelative;
}

/**
 * Request for section data based on section reference
 *
 * @param {string} search - key on which to match section
 * @param {field} string - field in which to look to determine section
 * @param {obj} sections - sections memory store
 */
function getSection(search, field, store) {
  const sectionValues = store
    .getIn(['sections', 'sectionsByPath'])
    .valueSeq();
  let selectedSection = false;

  if (field) {
    selectedSection = sectionValues
      .filter(value => value[field] === search)
      .get(0);
  } else {
    selectedSection = store.getIn(['sections', 'sectionsByPath', search]);
  }

  return selectedSection;
}
