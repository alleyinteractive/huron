const cwd = process.cwd(); // Current working directory
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk'); // Colorize terminal output

// Exports
export const utils = {};

/**
 * Ensure predictable data structure for KSS section data
 *
 * @param {object} section - section data
 */
utils.normalizeSectionData = function(section) {
  const data = section.data || section;

  if (!data.referenceURI || '' === data.referenceURI) {
    data.referenceURI = section.referenceURI();
  }

  return data;
}

/**
 * Find .json from a template file or vice versa
 *
 * @param {object} file - file object from path.parse()
 * @param {string} output - relative output path
 * @param {object} section - KSS section data
 */
utils.getTemplateDataPair = function(file, output, section) {
  let pairPath = false;

  if ('.json' === file.ext) {
    pairPath = path.join(output, section.markup);
  } else {
    pairPath = path.join(output, section.data);
  }

  return `./${pairPath}`;
}

/**
 * Normalize a section title for use as a filename
 *
 * @param {string} header - section header extracted from KSS documentation
 */
utils.normalizeHeader = function(header) {
  return header
    .toLowerCase()
    .replace(/\s?\W\s?/g, '-');
}

/**
 * Wrap html in required template tags
 *
 * @param {string} content - html or template markup
 * @param {string} templateId - id of template (should be section reference)
 */
utils.wrapMarkup = function(content, templateId) {
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
utils.writeTemplate = function(id, type, output, content, huron) {
  // Create absolute and relative output paths. Relative path will be used to require the template for HMR.
  let key = `${type}-${id}`;
  let outputRelative = path.join(huron.get('output'), output, `${key}.html`);
  let outputPath = path.resolve(cwd, huron.get('root'), outputRelative);

  fs.outputFileSync(outputPath, utils.wrapMarkup(content, id));

  console.log(chalk.green(`Writing ${outputRelative}`));

  return `./${outputRelative.replace(`${huron.get('output')}/`, '')}`;
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
utils.deleteTemplate = function(id, type, output, store) {
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
utils.copyFile = function(filename, output, content, huron) {
  const outputRelative = path.join(huron.get('output'), output, `${filename}`);
  const outputPath = path.resolve(cwd, huron.get('root'), outputRelative);

  try {
    fs.outputFileSync(outputPath, content);
    console.log(chalk.green(`Writing ${outputRelative}`));
  } catch(e) {
    console.log(chalk.red(`Failed to write ${outputRelative}`));
  }

  return `./${outputRelative.replace(`${huron.get('output')}/`, '')}`;;
}

/**
 * Delete a file in the huron output directory
 * @param  {string} filename - The name of the file (with extension).
 * @param  {string} output - The relative path to this file within the huron.kss directory.
 * @param  {object} huron - The huron config object.
 *
 * @return {string} The location where the file was saved.
 */
utils.removeFile = function(filename, output, huron) {
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
utils.getSection = function(search, field, store) {
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
