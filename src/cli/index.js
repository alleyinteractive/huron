// Local imports
import chalk from 'chalk';

import {
  initFiles,
  updateFile,
  deleteFile,
  updateClassNames,
} from './actions';
import { requireTemplates, writeStore } from './requireTemplates';
import { mergeClassnameJSON, matchKssDir } from './utils';
import program from './parseArgs';
import startWebpack from './server';
import { defaultStore, config } from './defaultStore';
import gaze from './fileWatcher';

/**
 * Initialize data store with files from gaze and original data structure
 *
 * @global
 */
const store = initFiles(gaze.watched(), defaultStore);
const huron = defaultStore.get('config');

requireTemplates(store);
writeStore(store);

if (!program.production) {
  /** @module cli/gaze */
  let newStore = store;

  gaze.on('all', (event, filepath) => {
    newStore = updateClassNames(filepath, newStore);
    writeStore(newStore);
  })

  /**
   * Anonymous handler for Gaze 'changed' event indicating a file has changed
   *
   * @callback changed
   * @listens gaze:changed
   * @param {string} filepath - absolute path of changed file
   */
  gaze.on('changed', (filepath) => {
    if (matchKssDir(filepath, huron)) {
      newStore = updateFile(filepath, newStore);
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
      newStore = updateFile(filepath, newStore);
      writeStore(newStore);
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
    if (matchKssDir(filepath, huron)) {
      newStore = deleteFile(oldPath, newStore);
      newStore = updateFile(newPath, newStore);
      writeStore(newStore);
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
      newStore = deleteFile(filepath, newStore);
      writeStore(newStore);
    }

    console.log(chalk.red(`${filepath} deleted`));
  });
} else {
  gaze.close();
}

// Start webpack or build for production
startWebpack(config);
