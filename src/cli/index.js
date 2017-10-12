// Local imports
import chalk from 'chalk';

import { initFiles, updateFile, deleteFile } from './actions';
import { requireTemplates, writeStore } from './requireTemplates';
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

requireTemplates(store);
writeStore(store);

if (!program.production) {
  /** @module cli/gaze */
  let newStore = store;

  /**
   * Anonymous handler for Gaze 'changed' event indicating a file has changed
   *
   * @callback changed
   * @listens gaze:changed
   * @param {string} filepath - absolute path of changed file
   */
  gaze.on('changed', (filepath) => {
    newStore = updateFile(filepath, newStore);
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
    newStore = updateFile(filepath, newStore);
    writeStore(newStore);
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
    newStore = deleteFile(oldPath, newStore);
    newStore = updateFile(newPath, newStore);
    writeStore(newStore);
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
    newStore = deleteFile(filepath, newStore);
    writeStore(newStore);
    console.log(chalk.red(`${filepath} deleted`));
  });
} else {
  gaze.close();
}

// Start webpack or build for production
startWebpack(config);

if (module.hot) {
  module.hot.accept();
}
