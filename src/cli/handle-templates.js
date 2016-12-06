/** @module cli/template-handler */
import { utils } from './utils';

/* eslint-disable */
export const templateHandler = {};
/* eslint-enable */

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');

/**
 * Handle update of a template or data (json) file
 *
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} section - contains KSS section data
 * @param {object} store - memory store
 */
templateHandler.updateTemplate = function updateTemplate(
  filepath,
  section,
  store
) {
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
};

/**
 * Handle removal of a template or data (json) file
 *
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} section - contains KSS section data
 * @param {object} store - memory store
 */
templateHandler.deleteTemplate = function deleteTemplate(
  filepath,
  section,
  store
) {
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
};
