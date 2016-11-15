const cwd = process.cwd(); // Current working directory
const path = require('path');
const fs = require('fs-extra');

import { utils } from './utils';

export const htmlHandler = {};

/**
 * Handle update of an HMTL template
 *
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} section - contains KSS section data
 * @param {object} store - memory store
 */
htmlHandler.updateTempate = function(filepath, section, store) {
  const huron = store.get('config');
  const file = path.parse(filepath);
  const content = fs.readFileSync(filepath, 'utf8');
  let newSection = section;

  if (content) {
    newSection.templatePath = utils.writeFile(
      section.referenceURI,
      'template',
      filepath,
      content,
      store
    );
    newSection.templateContent = content;

    // Rewrite section data with template content
    utils.writeSectionData(store, newSection);

    return store
      .setIn(
        ['sections', 'sectionsByPath', section.kssPath],
        newSection
      )
      .setIn(
        ['sections', 'sectionsByURI', section.referenceURI],
        newSection
      );
  } else {
    console.log(`File ${file.base} could not be read`);
    return store;
  }
}

/**
 * Handle removal of an HMTL template
 *
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} section - contains KSS section data
 * @param {object} store - memory store
 */
htmlHandler.deleteTempate = function(filepath, section, store) {
  const huron = store.get('config');
  const file = path.parse(filepath);

  requirePath = utils.removeFile(section.referenceURI, 'template', filepath, store);
  delete section.templatePath;

  return store.deleteIn(
      ['sections', 'sectionsByPath', section.kssPath],
      section
    );
}

/**
 * Handle update for a prototype file
 *
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} store - memory store
 */
htmlHandler.updatePrototype = function(filepath, store) {
  const huron = store.get('config');
  const file = path.parse(filepath);
  const content = fs.readFileSync(filepath, 'utf8');

  if (content) {
    const requirePath = utils.writeFile(file.name, 'prototype', filepath, content, store);

    return store.setIn(
        ['prototypes', file.name],
        requirePath
      );
  } else {
    console.log(`File ${file.base} could not be read`);
    return store;
  }
}

/**
 * Handle removal of a prototype file
 *
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} store - memory store
 */
htmlHandler.deletePrototype = function(filepath, store) {
  const huron = store.get('config');
  const file = path.parse(filepath);

  requirePath = utils.removeFile(file.name, 'prototype', filepath, store);

  return store.setIn(
      ['prototypes', file.name],
      requirePath
    );
}
