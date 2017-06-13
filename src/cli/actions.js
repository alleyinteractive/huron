/** @module cli/actions */

// Imports
import { htmlHandler } from './handle-html';
import { templateHandler } from './handle-templates';
import { kssHandler } from './handle-kss';
import * as utils from './utils';

// Requires
const path = require('path');
const chalk = require('chalk'); // Colorize terminal output

// EXPORTED FUNCTIONS

/**
 * Recursively loop through initial watched files list from Gaze.
 *
 * @param {object} data - object containing directory and file paths
 * @param {object} store - memory store
 * @param {object} huron - huron configuration options
 * @return {object} newStore - map object of entire data store
 */
export function initFiles(data, store, depth = 0) {
  const type = Object.prototype.toString.call(data);
  let newStore = store;
  let info;
  let files;

  switch (type) {
    case '[object Object]':
      files = Object.keys(data);
      newStore = files.reduce(
        (prevStore, file) => initFiles(data[file], prevStore, depth),
        newStore
      );
      break;

    case '[object Array]':
      newStore = data.reduce(
        (prevStore, file) => initFiles(file, prevStore, depth),
        newStore
      );
      break;

    case '[object String]':
      info = path.parse(data);
      if (info.ext) {
        newStore = updateFile(data, store);
      }
      break;

    default:
      break;
  }

  return newStore;
}

/**
 * Logic for updating and writing file information based on file type (extension)
 *
 * @param {string} filepath - path to updated file. usually passed in from Gaze
 * @param {object} store - memory store
 * @return {object} store - map object of map object of entire data store
 */
export function updateFile(filepath, store) {
  const huron = store.get('config');
  const file = path.parse(filepath);
  let field;
  let section;

  if (- 1 !== filepath.indexOf(huron.get('sectionTemplate'))) {
    return utils.writeSectionTemplate(filepath, store);
  }

  switch (file.ext) {
    // Plain HTML template, external
    case '.html':
      section = utils.getSection(file.base, 'markup', store);

      if (section) {
        return htmlHandler.updateTemplate(filepath, section, store);
      } else if (
        - 1 !== file.dir.indexOf('prototypes') &&
        - 1 !== file.name.indexOf('prototype-')
      ) {
        return htmlHandler.updatePrototype(filepath, store);
      }

      console.log(chalk.red(`Failed to write file: ${file.name}`));
      break;

    // Handlebars template, external
    case huron.get('templates').extension:
    case '.json':
      field = ('.json' === file.ext) ? 'data' : 'markup';
      section = utils.getSection(file.base, field, store);

      if (section) {
        return templateHandler.updateTemplate(filepath, section, store);
      }

      console.log( // eslint-disable-line no-console
        chalk.red(`Could not find associated KSS section for ${filepath}`)
      );
      break;

    // KSS documentation (default extension is `.css`)
    // Will also output a template if markup is inline
    // Note: inline markup does _not_ support handlebars currently
    case huron.get('kssExtension'):
      return kssHandler.updateKSS(filepath, store);

    // This should never happen if Gaze is working properly
    default:
      return store;
  }

  return store;
}

/**
 * Logic for deleting file information and files based on file type (extension)
 *
 * @param {string} filepath - path to updated file. usually passed in from Gaze
 * @param {object} store - memory store
 * @return {object} newStore - map object of map object of entire data store
 */
export function deleteFile(filepath, store) {
  const huron = store.get('config');
  const file = path.parse(filepath);
  let field = '';
  let section = null;
  let newStore = store;

  switch (file.ext) {
    // Plain HTML template, external
    case '.html':
      section = utils.getSection(file.base, 'markup', store);

      if (section) {
        newStore = htmlHandler.deleteTemplate(filepath, section, store);
      } else if (
        - 1 !== file.dir.indexOf('prototypes') &&
        - 1 !== file.name.indexOf('prototype-')
      ) {
        newStore = htmlHandler.deletePrototype(filepath, store);
      }
      break;

    case huron.get('templates').extension:
    case '.json':
      field = ('.json' === file.ext) ? 'data' : 'markup';
      section = utils.getSection(file.base, field, store);

      if (section) {
        newStore = templateHandler.deleteTemplate(filepath, section, store);
      }
      break;

    case huron.get('kssExtension'):
      section = utils.getSection(filepath, false, store);

      if (section) {
        newStore = kssHandler.deleteKSS(filepath, section, store);
      }
      break;

    default:
      console.warn(  // eslint-disable-line no-console
        chalk.red(`Could not delete: ${file.name}`)
      );
      break;
  }

  return newStore;
}
