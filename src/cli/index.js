// Local imports
import chalk from 'chalk';

import {
  initFiles,
  updateFile,
  deleteFile,
  updateClassNames,
} from './actions';
import { requireTemplates, writeStore } from './requireTemplates';
import { matchKssDir } from './utils';
import program from './parseArgs';
import startWebpack from './server';
import { defaultStore, config } from './defaultStore';
import gaze from './fileWatcher';

/**
 * Initialize data store with files from gaze and original data structure
 *
 * @global
 */
const huron = defaultStore.get('config');
let store = initFiles(gaze.watched(), defaultStore);

requireTemplates(store);
writeStore(store);

// If building for production, close gaze and exit process once initFiles is done.
if (program.production) {
  gaze.close();
}

/** @module cli/gaze */
gaze.on('all', (event, filepath) => {
  store = updateClassNames(filepath, store);
  writeStore(store);
});

/**
 * Anonymous handler for Gaze 'changed' event indicating a file has changed
 *
 * @callback changed
 * @listens gaze:changed
 * @param {string} filepath - absolute path of changed file
 */
gaze.on('changed', (filepath) => {
  if (matchKssDir(filepath, huron)) {
    store = updateFile(filepath, store);
  }

  console.log(chalk.green(`${filepath} updated!`));
});

/**
 * Anonymous handler for Gaze 'added' event indicating a file has been added to the watched directories
 *
 * @callback added
 * @listens gaze:added
 * @param {string} filepath - absolute path of changed file
 */
gaze.on('added', (filepath) => {
  if (matchKssDir(filepath, huron)) {
    store = updateFile(filepath, store);
    writeStore(store);
  }

  console.log(chalk.blue(`${filepath} added!`));
});

/**
 * Anonymous handler for Gaze 'renamed' event indicating a file has been renamed
 *
 * @callback renamed
 * @listens gaze:renamed
 * @param {string} filepath - absolute path of changed file
 */
gaze.on('renamed', (newPath, oldPath) => {
  if (matchKssDir(newPath, huron)) {
    store = deleteFile(oldPath, store);
    store = updateFile(newPath, store);
    writeStore(store);
  }

  console.log(chalk.blue(`${newPath} added!`));
});

/**
 * Anonymous handler for Gaze 'deleted' event indicating a file has been removed
 *
 * @callback deleted
 * @listens gaze:deleted
 * @param {string} filepath - absolute path of changed file
 */
gaze.on('deleted', (filepath) => {
  if (matchKssDir(filepath, huron)) {
    store = deleteFile(filepath, store);
    writeStore(store);
  }

  console.log(chalk.red(`${filepath} deleted`));
});

// Start webpack or build for production
startWebpack(config);
