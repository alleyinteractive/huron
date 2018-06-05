/**
 * @module cli/utilities
 */
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';

const cwd = process.cwd(); // Current working directory

/**
 * Ensure predictable data structure for KSS section data
 *
 * @function normalizeSectionData
 * @param {object} section - section data
 * @return {object} section data
 */
export function normalizeSectionData(section) {
  const data = section.data || section;

  if (!data.referenceURI || '' === data.referenceURI) {
    data.referenceURI = section.referenceURI();
  }

  return data;
}

/**
 * Ensure predictable data structure for KSS section data
 *
 * @function writeSectionData
 * @param {object} store - data store
 * @param {object} section - section data
 * @param {string} sectionPath - output destination for section data file
 */
export function writeSectionData(store, section, sectionPath = false) {
  let outputPath = sectionPath;
  let sectionFileInfo;

  if (!outputPath && {}.hasOwnProperty.call(section, 'kssPath')) {
    sectionFileInfo = path.parse(section.kssPath);
    outputPath = path.join(
      sectionFileInfo.dir,
      `${sectionFileInfo.name}.json`
    );
  }

  // Output section data
  if (outputPath) {
    return writeFile(
      section.referenceURI,
      'section',
      outputPath,
      JSON.stringify(section),
      store
    );
  }

  console.warn(chalk.red(`Failed to write data for ${section.referenceURI}`));
  return false;
}

/**
 * Find .json from a template file or vice versa
 *
 * @function getTemplateDataPair
 * @param {object} file - file object from path.parse()
 * @param {object} section - KSS section data
 * @return {string} relative path to module JSON file
 */
export function getTemplateDataPair(file, section, store) {
  const huron = store.get('config');
  const kssDir = matchKssDir(file.dir, huron);

  if (kssDir) {
    const componentPath = path.relative(
      path.resolve(cwd, kssDir),
      file.dir
    );
    const partnerType = '.json' === file.ext ? 'template' : 'data';
    const partnerExt = '.json' === file.ext ?
      huron.get('templates').extension :
      '.json';

    const pairPath = path.join(
      componentPath,
      generateFilename(
        section.referenceURI,
        partnerType,
        partnerExt,
        store
      )
    );

    return `./${pairPath}`;
  }

  return false;
}

/**
 * Normalize a section title for use as a filename
 *
 * @function normalizeHeader
 * @param {string} header - section header extracted from KSS documentation
 * @return {string} modified header, lowercase and words separated by dash
 */
export function normalizeHeader(header) {
  return header
    .toLowerCase()
    .replace(/\s?\W\s?/g, '-');
}

/**
 * Wrap html in required template tags
 *
 * @function wrapMarkup
 * @param {string} content - html or template markup
 * @param {string} templateId - id of template (should be section reference)
 * @return {string} modified HTML
 */
export function wrapMarkup(content, templateId) {
  return `<dom-module>
<template id="${templateId}">
${content}
</template>
</dom-module>\n`;
}

/**
 * Generate a filename based on referenceURI, type and file object
 *
 * @function generateFilename
 * @param  {string} id - The name of the file (with extension).
 * @param  {string} type - the type of file output
 * @param  {object} ext - file extension
 * @param  {store} store - data store
 * @return {string} Path to output file, relative to ouput dir (can be use in require statements)
 */
export function generateFilename(id, type, ext, store) {
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
}

/**
 * Copy an HTML file into the huron output directory.
 *
 * @function writeFile
 * @param  {string} id - The name of the file (with extension).
 * @param  {string} content - The content of the file to write.
 * @param  {string} type - the type of file output
 * @param  {object} store - The data store
 * @return {string} Path to output file, relative to ouput dir (can be use in require statements)
 */
export function writeFile(id, type, filepath, content, store) {
  const huron = store.get('config');
  const file = path.parse(filepath);
  const filename = generateFilename(id, type, file.ext, store);
  const kssDir = matchKssDir(filepath, huron);

  if (kssDir) {
    const componentPath = path.relative(
      path.resolve(cwd, kssDir),
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
      newContent = wrapMarkup(content, id);
    }

    try {
      fs.outputFileSync(outputPath, newContent);
      console.log(chalk.green(`Writing ${outputRelative}`)); // eslint-disable-line no-console
    } catch (e) {
      console.log(chalk.red(`Failed to write ${outputRelative}`)); // eslint-disable-line no-console
    }

    return `./${outputRelative.replace(`${huron.get('output')}/`, '')}`;
  }

  return false;
}

/**
 * Delete a file in the huron output directory
 *
 * @function removeFile
 * @param  {string} filename - The name of the file (with extension).
 * @param  {object} store - The data store
 * @return {string} Path to output file, relative to ouput dir (can be use in require statements)
 */
export function removeFile(id, type, filepath, store) {
  const huron = store.get('config');
  const file = path.parse(filepath);
  const filename = generateFilename(id, type, file.ext, store);
  const kssDir = matchKssDir(filepath, huron);

  if (kssDir) {
    const componentPath = path.relative(
      path.resolve(cwd, kssDir),
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
      console.log(chalk.green(`Removing ${outputRelative}`)); // eslint-disable-line no-console
    } catch (e) {
      console.log(chalk.red(`${outputRelative} does not exist or cannot be deleted`)); // eslint-disable-line
    }

    return `./${outputRelative.replace(`${huron.get('output')}/`, '')}`;
  }

  return false;
}

/**
 * Write a template for sections
 *
 * @function writeSectionTemplate
 * @param  {string} filepath - the original template file
 * @param  {object} store - data store
 * @return {object} updated store
 */
export function writeSectionTemplate(filepath, store) {
  const huron = store.get('config');
  const sectionTemplate = wrapMarkup(fs.readFileSync(filepath, 'utf8'));
  const componentPath = './huron-assets/section.hbs';
  const output = path.join(
    cwd,
    huron.get('root'),
    componentPath
  );

  // Move huron script and section template into huron root
  fs.outputFileSync(output, sectionTemplate);
  console.log(chalk.green(`writing section template to ${output}`)); // eslint-disable-line no-console

  return store.set('sectionTemplatePath', componentPath);
}

/**
 * Request for section data based on section reference
 *
 * @function writeSectionTemplate
 * @param {string} search - key on which to match section
 * @param {field} string - field in which to look to determine section
 * @param {obj} store - sections memory store
 */
export function getSection(search, field, store) {
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
}

/**
 * Find which configured KSS directory a filepath exists in
 *
 * @function matchKssDir
 * @param {string} filepath - filepath to search for
 * @param {object} huron - huron configuration
 * @return {string} kssMatch - relative path to KSS directory
 */
export function matchKssDir(filepath, huron) {
  const kssSource = huron.get('kss');
  // Include forward slash in our test to make sure we're matchin a directory, not a file extension
  const kssMatch = kssSource.filter((dir) => filepath.includes(`/${dir}`));

  if (kssMatch.length) {
    return kssMatch[0];
  }

  return false;
}

/**
 * Ingest the classnames from the file specified in the huron config.
 *
 * @function getClassnamesFromJSON
 * @param {string} filepath - file containing classname JSON files
 *
 * @return {object}           merged classnames. contents of each JSON file is nested within
 *                           the returned object by filename. (e.g. article.json -> { article: {...json contents}})
 */
export function getClassnamesFromJSON(filepath) {
  const fileInfo = path.parse(filepath);
  let classNames = {};

  if ('.json' === fileInfo.ext) {
    try {
      const contents = fs.readFileSync(
        filepath,
        'utf8'
      );
      classNames = JSON.parse(contents);
    } catch (e) {
      console.warn(chalk.red(e));
    }
  }

  return classNames;
}

/**
 * Remove the trailing slash from a provided directory
 *
 * @function removeTrailingSlash
 * @param {string} directory - directory path
 * @return {string} directory - directory path with trailing slash removed
 */
export function removeTrailingSlash(directory) {
  if ('/' === directory.slice(-1)) {
    return directory.slice(0, -1);
  }

  return directory;
}
