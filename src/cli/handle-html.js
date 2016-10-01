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
  const output = path.relative(path.resolve(cwd, huron.get('kss')), file.dir);

  const content = utils.wrapMarkup(
    fs.readFileSync(filepath, 'utf8'),
    section.referenceURI
  );

  section.markupPath = utils.copyFile(file.base, output, content, huron);

  return store.setIn(
      ['sections', 'sectionsByPath', section.sectionPath],
      section
    );
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
  const output = path.relative(path.resolve(cwd, huron.get('kss')), file.dir);

  outputPath = utils.removeFile(file.base, output, huron);

  delete section.markupPath;

  return store.deleteIn(
      ['sections', 'sectionsByPath', section.sectionPath],
      section
    );
}

/**
 * Handle update for a prototype file
 *
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} section - contains KSS section data
 * @param {object} store - memory store
 */
htmlHandler.updatePrototype = function(filepath, section, store) {
  const huron = store.get('config');
  const file = path.parse(filepath);
  const output = path.relative(path.resolve(cwd, huron.get('kss')), file.dir);
  const content = utils.wrapMarkup(fs.readFileSync(filepath, 'utf8'), file.name);
  const outputPath = utils.copyFile(file.base, output, content, huron);

  return store.setIn(
      ['prototypes', file.name],
      outputPath
    );
}

/**
 * Handle removal of a prototype file
 *
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} section - contains KSS section data
 * @param {object} store - memory store
 */
htmlHandler.deletePrototype = function(filepath, section, store) {
  const huron = store.get('config');
  const file = path.parse(filepath);
  const output = path.relative(path.resolve(cwd, huron.get('kss')), file.dir);

  outputPath = utils.removeFile(file.base, output, content, huron);

  return store.setIn(
      ['prototypes', file.name],
      outputPath
    );
}
