const cwd = process.cwd(); // Current working directory
const path = require('path');
const fs = require('fs-extra');

import { utils } from './utils';

export const templateHandler = {};

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
  const output = path.relative(path.resolve(cwd, huron.get('kss')), file.dir);
  const field = ('.json' === file.ext) ? 'data' : 'markup';
  const dest = path.resolve(cwd, huron.get('output'));
  const pairPath = utils.getTemplateDataPair(file, output, section);
  let content = fs.readFileSync(filepath, 'utf8');

  if (huron.get('templates').extension === file.ext) {
    content = utils.wrapMarkup(content, section.referenceURI);
  };

  const requirePath = utils.copyFile(file.base, output, content, huron);

  section[`${field}Path`] = requirePath;
  return store
    .setIn(
      ['templates', requirePath],
      pairPath
    )
    .setIn(
      ['sections', 'sectionsByPath', section.sectionPath],
      section
    );
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
  const output = path.relative(path.resolve(cwd, huron.get('kss')), file.dir);
  const field = ('.json' === file.ext) ? 'data' : 'markup';
  const dest = path.resolve(cwd, huron.get('output'));
  const pairPath = utils.getTemplateDataPair(file, output, section);
  const requirePath = `./${path.relative(dest, filepath)}`;

  // Remove partner
  outputPath = utils.removeFile(file.base, output, huron);
  delete section[`${field}Path`];

  return store
    .deleteIn(['templates', requirePath])
    .setIn(
      ['sections', 'sectionsByPath', section.sectionPath],
      section
    );
}
