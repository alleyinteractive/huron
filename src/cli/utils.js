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
 * @param {object} section - KSS section data
 */
utils.getTemplateDataPair = function(file, section, store) {
  const huron = store.get('config');
  const componentPath = path.relative(path.resolve(cwd, huron.get('kss')), file.dir);
  let pairPath = false;

  if ('.json' === file.ext) {
    pairPath = path.join(componentPath, section.markup);
  } else {
    pairPath = path.join(componentPath, section.data);
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

utils.generateFilename = function(id, type, store) {
  const huron = store.get('config');
  // Type of file and its corresponding extension(s)
  const types = {
    template: ['.html', huron.get('templates').extension],
    data: ['.json'],
    description: ['.html'],
    section: ['.html'],
    prototype: ['.html'],
  };

  if (!types.hasOwnProperty(type)) {
    console.log(`Huron data ${type} does not exist`);
    return false;
  }

  return `${id}-${key}${types[type]}`;
}

/**
 * Copy an HTML file into the huron output directory.
 * @param  {string} id - The name of the file (with extension).
 * @param  {string} content - The content of the file to write.
 * @param  {string} type - the type of file output
 * @param  {object} store - The data store
 *
 * @return {string} Path to output file, relative to ouput dir (can be use in require statements)
 */
utils.writeFile = function(id, type, content, store) {
  const huron = store.get('config');
  const filename = utils.generateFilename(id, type, store);
  const componentPath = path.relative(path.resolve(cwd, huron.get('kss')), file.dir);
  const outputRelative = path.join(huron.get('output'), componentPath, `${filename}`);
  const outputPath = path.resolve(cwd, huron.get('root'), outputRelative);

  if ('data' !=== type) {
    content = utils.wrapMarkup(content, id);
  }

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
 * @param  {object} store - The data store
 *
 * @return {string} Path to output file, relative to ouput dir (can be use in require statements)
 */
utils.removeFile = function(id, type, store) {
  const huron = store.get('config');
  const filename = utils.generateFilename(id, type, store);
  const componentPath = path.relative(path.resolve(cwd, huron.get('kss')), file.dir);
  const outputRelative = path.join(huron.get('output'), componentPath, `${filename}`);
  const outputPath = path.resolve(cwd, huron.get('root'), outputRelative);

  try {
    fs.removeSync(outputPath);
    console.log(chalk.green(`Removing ${outputRelative}`));
  } catch(e) {
    console.log(chalk.red(`${outputRelative} does not exist or cannot be deleted`));
  }

  return `./${outputRelative.replace(`${huron.get('output')}/`, '')}`;;
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
