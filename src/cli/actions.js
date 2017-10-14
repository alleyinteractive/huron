/** @module cli/actions */

// Imports
import path from 'path';
import chalk from 'chalk';
import isEqual from 'lodash/isEqual';

import {
  updateHTML,
  deleteHTML,
  updatePrototype,
  deletePrototype,
} from './handleHTML';
import { updateTemplate, deleteTemplate } from './handleTemplates';
import { updateKSS, deleteKSS } from './handleKSS';
import * as utils from './utils';

// EXPORTED FUNCTIONS

/**
 * Recursively loop through initial watched files list from Gaze.
 *
 * @param {object} data - object containing directory and file paths
 * @param {object} store - memory store
 * @return {object} newStore - map object of entire data store
 */
export function initFiles(data, store, depth = 0) {
  const type = Object.prototype.toString.call(data);
  const huron = store.get('config');
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

      // Only call update if data is a filepath and it's within the KSS source directory
      if (info.ext && utils.matchKssDir(data, huron)) {
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

  if (filepath.includes(huron.get('sectionTemplate'))) {
    return utils.writeSectionTemplate(filepath, store);
  }

  switch (file.ext) {
    // Plain HTML template, external
    case '.html':
      section = utils.getSection(file.base, 'markup', store);

      if (section) {
        return updateHTML(filepath, section, store);
      } else if (
        file.dir.includes('prototypes') &&
        file.name.includes('prototype-')
      ) {
        return updatePrototype(filepath, store);
      }

      console.log(chalk.red(`Failed to write file: ${file.name}`));
      break;

    // Handlebars template, external
    case huron.get('templates').extension:
    case '.json':
      field = ('.json' === file.ext) ? 'data' : 'markup';
      section = utils.getSection(file.base, field, store);

      if (section) {
        return updateTemplate(filepath, section, store);
      }

      console.log( // eslint-disable-line no-console
        chalk.red(`Could not find associated KSS section for ${filepath}`)
      );
      break;

    // KSS documentation (default extension is `.css`)
    // Will also output a template if markup is inline
    // Note: inline markup does _not_ support handlebars currently
    case huron.get('kssExtension'):
      return updateKSS(filepath, store);

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
        newStore = deleteHTML(filepath, section, store);
      } else if (
        file.dir.includes('prototypes') &&
        file.name.includes('prototype-')
      ) {
        newStore = deletePrototype(filepath, store);
      }
      break;

    case huron.get('templates').extension:
    case '.json':
      field = ('.json' === file.ext) ? 'data' : 'markup';
      section = utils.getSection(file.base, field, store);

      if (section) {
        newStore = deleteTemplate(filepath, section, store);
      }
      break;

    case huron.get('kssExtension'):
      section = utils.getSection(filepath, false, store);

      if (section) {
        newStore = deleteKSS(filepath, section, store);
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

/**
 * Logic for updating localized classnames from CSS modules
 *
 * @param {string} filepath - path to updated file. usually passed in from Gaze
 * @param {object} store - memory store
 *
 * @return void
 */
export function updateClassNames(filepath, store) {
  const classNamesPath = store.getIn(['config', 'classNames']);

  if (filepath.includes(classNamesPath)) {
    const oldClassnames = store.get('classNames');
    const newClassnames = utils.mergeClassnameJSON(classNamesPath);

    if (!isEqual(oldClassnames, newClassnames)) {
      return store.set('classNames', newClassnames);
    }
  }

  return store;
}
