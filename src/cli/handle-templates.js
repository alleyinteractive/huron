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
  const dest = path.resolve(cwd, huron.get('output'));
  const pairPath = utils.getTemplateDataPair(file, section, store);
  const type = '.json' === file.ext ? 'data' : 'template';
  let content = fs.readFileSync(filepath, 'utf8');

  let requirePath = utils.writeFile(section.referenceURI, type, filepath, content, store);
  section[`${type}Path`] = requirePath;

  return store
    .setIn(
      ['templates', requirePath],
      pairPath
    )
    .setIn(
      ['sections', 'sectionsByPath', section.kssPath],
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
  const dest = path.resolve(cwd, huron.get('output'));
  const type = '.json' === file.ext ? 'data' : 'template';

  // Remove partner
  let requirePath = utils.removeFile(section.referenceURI, type, filepath, store);
  delete section[`${type}Path`];

  return store
    .deleteIn(['templates', requirePath])
    .setIn(
      ['sections', 'sectionsByPath', section.kssPath],
      section
    );
}
