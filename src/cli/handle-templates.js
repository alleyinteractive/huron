import { utils } from './utils';

export const templateHandler = {};

const cwd = process.cwd(); // Current working directory
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk')

/**
 * Handle update of a template or data (json) file
 *
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} section - contains KSS section data
 * @param {object} store - memory store
 */
templateHandler.updateTemplate = function(filepath, section, store) {
  const huron = store.get('config');
  const file = path.parse(filepath);
  const dest = path.resolve(cwd, huron.get('output'));
  const pairPath = utils.getTemplateDataPair(file, section, store);
  const type = '.json' === file.ext ? 'data' : 'template';
  const newSection = section;
  let newStore = store;
  let content = false;

  try {
    content = fs.readFileSync(filepath, 'utf8');
  } catch(e) {
    console.log(chalk.red(`${filepath} does not exist`));
  }

  if (content) {
    let requirePath = utils.writeFile(newSection.referenceURI, type, filepath, content, newStore);
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
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} section - contains KSS section data
 * @param {object} store - memory store
 */
templateHandler.deleteTemplate = function(filepath, section, store) {
  const huron = store.get('config');
  const file = path.parse(filepath);
  const dest = path.resolve(cwd, huron.get('output'));
  const type = '.json' === file.ext ? 'data' : 'template';
  const newSection = section;
  let newStore = store;

  // Remove partner
  let requirePath = utils.removeFile(newSection.referenceURI, type, filepath, newStore);
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
