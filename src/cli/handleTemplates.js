/** @module cli/template-handler */
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';

import * as utils from './utils';

/**
 * Handle update of a template or data (json) file
 *
 * @function updateTemplate
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} section - contains KSS section data
 * @param {object} store - memory store
 * @return {object} updated memory store
 */
export function updateTemplate(filepath, section, store) {
  const file = path.parse(filepath);
  const pairPath = utils.getTemplateDataPair(file, section, store);
  const type = '.json' === file.ext ? 'data' : 'template';
  const newSection = section;
  const newStore = store;
  let content = false;

  try {
    content = fs.readFileSync(filepath, 'utf8');
  } catch (e) {
    console.log(chalk.red(`${filepath} does not exist`));
  }

  if (content) {
    const requirePath = utils.writeFile(
      newSection.referenceURI,
      type,
      filepath,
      content,
      newStore
    );
    newSection[`${type}Path`] = requirePath;

    if ('template' === type) {
      newSection.templateContent = content;

      // Rewrite section data with template content
      newSection.sectionPath = utils.writeSectionData(newStore, newSection);
    }

    return newStore
      .setIn(
        ['templates', requirePath],
        pairPath
      )
      .setIn(
        ['sections', 'sectionsByPath', newSection.kssPath],
        newSection
      )
      .setIn(
        ['sections', 'sectionsByURI', newSection.referenceURI],
        newSection
      );
  }

  return newStore;
}

/**
 * Handle removal of a template or data (json) file
 *
 * @function deleteTemplate
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} section - contains KSS section data
 * @param {object} store - memory store
 * @return {object} updated memory store
 */
export function deleteTemplate(filepath, section, store) {
  const file = path.parse(filepath);
  const type = '.json' === file.ext ? 'data' : 'template';
  const newSection = section;
  const newStore = store;

  // Remove partner
  const requirePath = utils.removeFile(
    newSection.referenceURI,
    type,
    filepath,
    newStore
  );
  delete newSection[`${type}Path`];

  return newStore
    .deleteIn(['templates', requirePath])
    .setIn(
      ['sections', 'sectionsByPath', newSection.kssPath],
      newSection
    )
    .setIn(
      ['sections', 'sectionsByURI', newSection.referenceURI],
      newSection
    );
}
