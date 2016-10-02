// Requires
const cwd = process.cwd(); // Current working directory
const path = require('path');
const fs = require('fs-extra');
const Promise = require('bluebird');
const chalk = require('chalk'); // Colorize terminal output

// Imports
import { htmlHandler } from './handle-html';
import { templateHandler } from './handle-templates';
import { kssHandler } from './handle-kss';
import { utils } from './utils';

// EXPORTED FUNCTIONS

/**
 * Recursively loop through initial watched files list from Gaze.
 *
 * @param {object} data - object containing directory and file paths
 * @param {object} store - memory store
 * @param {object} huron - huron configuration options
 */
export function initFiles(data, store, depth = 0) {
  const huron = store.get('config');
  const type = Object.prototype.toString.call( data );
  const currentDepth = depth++;

  switch (type) {
    case '[object Object]':
      for (let file in data) {
        store = initFiles(data[file], store, depth);
      }
      break;

    case '[object Array]':
      data.forEach(file => {
        store = initFiles(file, store, depth);
      });
      break;

    case '[object String]':
      const info = path.parse(data);
      if (info.ext) {
        store = updateFile(data, store)
      }
      break;
  }

  return store;
}

/**
 * Logic for updating and writing file information based on file type (extension)
 *
 * @param {string} filepath - path to updated file. usually passed in from Gaze
 * @param {object} store - memory store
 */
export function updateFile(filepath, store) {
  const huron = store.get('config');
  const file = path.parse(filepath);
  let section = null;

  switch (file.ext) {
    // Plain HTML template, external
    case '.html':
      section = utils.getSection(file.base, 'markup', store);

      if (section) {
        return htmlHandler.updateTempate(filepath, section, store);
      } else if (
        file.dir.indexOf('prototypes') !== -1 &&
        file.name.indexOf('prototype-') !== -1
      ) {
        return htmlHandler.updatePrototype(filepath, store);
      } else {
        console.log(chalk.red(`Failed to write file: ${file.name}`));
      }

      break;

    // Handlebars template, external
    case huron.get('templates').extension:
    case '.json':
      const field = ('.json' === file.ext) ? 'data' : 'markup';
      section = utils.getSection(file.base, field, store);

      if (section) {
        return templateHandler.updateTemplate(filepath, section, store);
      } else {
        console.log(chalk.red(`No pairing (data or template) file was found for template ${filepath}`));
      }
      break;

    // KSS documentation (default extension is `.css`)
    // Will also output a template if markup is inline
    // Note: inline markup does _not_ support handlebars currently
    case huron.get('kssExtension'):
      return kssHandler.updateKSS(filepath, store);
      break;

    // This should never happen if Gaze is working properly
    default:
      return store;
      break;
  }

  return store;
}

/**
 * Logic for deleting file information and files based on file type (extension)
 *
 * @param {string} filepath - path to updated file. usually passed in from Gaze
 * @param {object} store - memory store
 */
export function deleteFile(filepath, store) {
  const huron = store.get('config');
  const file = path.parse(filepath);
  let section = null;

  switch (file.ext) {
    // Plain HTML template, external
    case '.html':
      section = utils.getSection(file.base, 'markup', store);

      if (section) {
        return htmlHandler.deleteTemplate(filepath, section, store);
      } else if (
        file.dir.indexOf('prototypes') !== -1 &&
        file.name.indexOf('prototype-') !== -1
      ) {
        return htmlHandler.deletePrototype(filepath, store);
      }
      break;

    case huron.get('templates').extension:
    case '.json':
      const field = ('.json' === file.ext) ? 'data' : 'markup';
      section = utils.getSection(file.base, field, store);

      if (section) {
        return templateHandler.deleteTemplate(filepath, section, store);
      }
      break;

    case huron.get('kssExtension'):
      section = utils.getSection(filepath, false, store);

      if (section) {
        return kssHandler.deleteKSS(filepath, section, store);
      }
      break;

    default:
      consle.log(`Could not delete: ${file.name}`);
      return store;
      break;
  }

  return newStore;
}
