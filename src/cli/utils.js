/** @module cli/utilities */

const cwd = process.cwd(); // Current working directory
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk'); // Colorize terminal output

// Exports
/* eslint-disable */
export const utils = {};
/* eslint-enable */

/**
 * Ensure predictable data structure for KSS section data
 *
 * @param {object} section - section data
 */
utils.normalizeSectionData = function normalizeSectionData(section) {
  const data = section.data || section;

  if (! data.referenceURI || '' === data.referenceURI) {
    data.referenceURI = section.referenceURI();
  }

  return data;
};

/**
 * Ensure predictable data structure for KSS section data
 *
 * @param {object} store - data store
 * @param {object} section - section data
 * @param {string} sectionPath - output destination for section data file
 */
utils.writeSectionData = function writeSectionData(
  store,
  section,
  sectionPath = false
) {
  let outputPath = sectionPath;
  let sectionFileInfo;

  if (! outputPath && {}.hasOwnProperty.call(section, 'kssPath')) {
    sectionFileInfo = path.parse(section.kssPath);
    outputPath = path.join(sectionFileInfo.dir, `${sectionFileInfo.name}.json`);
  }

  // Output section data
  if (outputPath) {
    return utils.writeFile(
      section.referenceURI,
      'section',
      outputPath,
      JSON.stringify(section),
      store
    );
  }

  console.warn(
    chalk.red(`Failed to write section data for ${section.referenceURI}`)
  );
  return false;
};

/**
 * Find .json from a template file or vice versa
 *
 * @param {object} file - file object from path.parse()
 * @param {object} section - KSS section data
 */
utils.getTemplateDataPair = function getTemplateDataPair(
  file,
  section,
  store
) {
  const huron = store.get('config');
  const componentPath = path.relative(
    path.resolve(cwd, huron.get('kss')),
    file.dir
  );
  const partnerType = '.json' === file.ext ? 'template' : 'data';
  const partnerExt = '.json' === file.ext ?
    huron.get('templates').extension :
    '.json';

  const pairPath = path.join(
    componentPath,
    utils.generateFilename(
      section.referenceURI,
      partnerType,
      partnerExt,
      store
    )
  );

  return `./${pairPath}`;
};

/**
 * Normalize a section title for use as a filename
 *
 * @param {string} header - section header extracted from KSS documentation
 */
utils.normalizeHeader = function normalizeHeader(header) {
  return header
    .toLowerCase()
    .replace(/\s?\W\s?/g, '-');
};

/**
 * Wrap html in required template tags
 *
 * @param {string} content - html or template markup
 * @param {string} templateId - id of template (should be section reference)
 */
utils.wrapMarkup = function wrapMarkup(content, templateId) {
  return `<dom-module>
<template id="${templateId}">
${content}
</template>
</dom-module>\n`;
};

/**
 * Generate a filename based on referenceURI, type and file object
 *
 * @param  {string} id - The name of the file (with extension).
 * @param  {string} type - the type of file output
 * @param  {object} ext - file extension
 * @param  {store} store - data store
 *
 * @return {string} Path to output file, relative to ouput dir (can be use in require statements)
 */
utils.generateFilename = function generateFilename(id, type, ext, store) {
  // Type of file and its corresponding extension(s)
  const types = store.get('types');
  const outputExt = '.scss' !== ext ? ext : '.html';

  /* eslint-disable */
  if (-1 === types.indexOf(type)) {
    console.log(`Huron data ${type} does not exist`);
    return false;
  }
  /* eslint-enable */

  return `${id}-${type}${outputExt}`;
};

/**
 * Copy an HTML file into the huron output directory.
 * @param  {string} id - The name of the file (with extension).
 * @param  {string} content - The content of the file to write.
 * @param  {string} type - the type of file output
 * @param  {object} store - The data store
 *
 * @return {string} Path to output file, relative to ouput dir (can be use in require statements)
 */
utils.writeFile = function writeFile(id, type, filepath, content, store) {
  const huron = store.get('config');
  const file = path.parse(filepath);
  const filename = utils.generateFilename(id, type, file.ext, store);
  const componentPath = path.relative(
    path.resolve(cwd, huron.get('kss')),
    file.dir
  );
  const outputRelative = path.join(
    huron.get('output'),
    componentPath,
    `${filename}`
  );
  const outputPath = path.resolve(cwd, huron.get('root'), outputRelative);
  let newContent = content;

  if ('data' !== type && 'section' !== type) {
    newContent = utils.wrapMarkup(content, id);
  }

  try {
    fs.outputFileSync(outputPath, newContent);
    console.log(chalk.green(`Writing ${outputRelative}`));
  } catch (e) {
    console.log(chalk.red(`Failed to write ${outputRelative}`));
  }

  return `./${outputRelative.replace(`${huron.get('output')}/`, '')}`;
};

/**
 * Delete a file in the huron output directory
 * @param  {string} filename - The name of the file (with extension).
 * @param  {object} store - The data store
 *
 * @return {string} Path to output file, relative to ouput dir (can be use in require statements)
 */
utils.removeFile = function removeFile(id, type, filepath, store) {
  const huron = store.get('config');
  const file = path.parse(filepath);
  const filename = utils.generateFilename(id, type, file.ext, store);
  const componentPath = path.relative(
    path.resolve(cwd, huron.get('kss')),
    file.dir
  );
  const outputRelative = path.join(
    huron.get('output'),
    componentPath,
    `${filename}`
  );
  const outputPath = path.resolve(cwd, huron.get('root'), outputRelative);

  try {
    fs.removeSync(outputPath);
    console.log(chalk.green(`Removing ${outputRelative}`));
  } catch (e) {
    console.log(
      chalk.red(`${outputRelative} does not exist or cannot be deleted`)
    );
  }

  return `./${outputRelative.replace(`${huron.get('output')}/`, '')}`;
};

/**
 * Write a template for sections
 *
 * @param  {string} filepath - the original template file
 * @param  {object} store - data store
 *
 * @return {object} updated store
 */
utils.writeSectionTemplate = function writeSectionTemplate(filepath, store) {
  const huron = store.get('config');
  const sectionTemplate = utils.wrapMarkup(fs.readFileSync(filepath, 'utf8'));
  const componentPath = './huron-sections/sections.hbs';
  const output = path.join(
    cwd,
    huron.get('root'),
    huron.get('output'),
    componentPath
  );

  // Move huron script and section template into huron root
  fs.outputFileSync(output, sectionTemplate);
  console.log(chalk.green(`writing section template to ${output}`));

  return store.set('sectionTemplatePath', componentPath);
};

/**
 * Request for section data based on section reference
 *
 * @param {string} search - key on which to match section
 * @param {field} string - field in which to look to determine section
 * @param {obj} sections - sections memory store
 */
utils.getSection = function getSection(search, field, store) {
  const sectionValues = store
    .getIn(['sections', 'sectionsByPath'])
    .valueSeq();
  let selectedSection = false;

  if (field) {
    selectedSection = sectionValues
      .filter((value) => value[field] === search)
      .get(0);
  } else {
    selectedSection = store.getIn(['sections', 'sectionsByPath', search]);
  }

  return selectedSection;
};
