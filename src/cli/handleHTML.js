/** @module cli/html-handler */
import path from 'path';
import fs from 'fs-extra';

import * as utils from './utils';

/**
 * Handle update of an HMTL template
 *
 * @function updateHTML
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} section - contains KSS section data
 * @param {object} store - memory store
 * @return {object} updated data store
 */
export function updateHTML(filepath, section, store) {
  const file = path.parse(filepath);
  const content = fs.readFileSync(filepath, 'utf8');
  const newSection = section;

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
    newSection.sectionPath = utils.writeSectionData(store, newSection);

    return store
      .setIn(
        ['sections', 'sectionsByPath', section.kssPath],
        newSection
      )
      .setIn(
        ['sections', 'sectionsByURI', section.referenceURI],
        newSection
      );
  }

  console.log(`File ${file.base} could not be read`);
  return store;
}

/**
 * Handle removal of an HMTL template
 *
 * @function deleteHTML
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} section - contains KSS section data
 * @param {object} store - memory store
 * @return {object} updated data store
 */
export function deleteHTML(filepath, section, store) {
  const newSection = section;

  utils.removeFile(
    newSection.referenceURI,
    'template',
    filepath,
    store
  );

  delete newSection.templatePath;

  return store
    .setIn(
      ['sections', 'sectionsByPath', section.kssPath],
      newSection
    )
    .setIn(
      ['sections', 'sectionsByURI', section.referenceURI],
      newSection
    );
}

/**
 * Handle update for a prototype file
 *
 * @function updatePrototype
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} store - memory store
 * @return {object} updated data store
 */
export function updatePrototype(filepath, store) {
  const file = path.parse(filepath);
  const content = fs.readFileSync(filepath, 'utf8');

  if (content) {
    const requirePath = utils.writeFile(
      file.name,
      'prototype',
      filepath,
      content,
      store
    );

    return store.setIn(
        ['prototypes', file.name],
        requirePath
      );
  }

  console.log(`File ${file.base} could not be read`);
  return store;
}

/**
 * Handle removal of a prototype file
 *
 * @function deletePrototype
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} store - memory store
 * @return {object} updated data store
 */
export function deletePrototype(filepath, store) {
  const file = path.parse(filepath);
  const requirePath = utils.removeFile(
    file.name,
    'prototype',
    filepath,
    store
  );

  return store.setIn(
      ['prototypes', file.name],
      requirePath
    );
}
