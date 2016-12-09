#!/usr/bin/env node

// Local imports
import { initFiles, updateFile, deleteFile } from './actions';
import { requireTemplates, writeStore } from './require-templates';
import program from './parse-args';
import generateConfig from './generate-config';
import startWebpack from './server';

// Modules
const cwd = process.cwd(); // Current working directory
const path = require('path');
const Gaze = require('gaze').Gaze;
const Immutable = require('immutable');
const chalk = require('chalk'); // Colorize terminal output

// Set vars
const localConfig = require(path.join(cwd, program.config)); // eslint-disable-line import/no-dynamic-require
const config = generateConfig(localConfig);

/**
 * Huron configuration object
 *
 * @global
 */
const huron = config.huron;

// Make sure the kss option is represented as an array
huron.kss = Array.isArray(huron.kss) ?
  huron.kss :
  [huron.kss];

/**
 * Available file extensions. Extensions should not include the leading '.'
 *
 * @global
 */
const extensions = [
  huron.kssExtension,
  huron.templates.extension,
  'html',
  'json',
].map((extension) => extension.replace('.', ''));

// Create initial data structure
/* eslint-disable */
/**
 * Initial structure for immutable data store
 *
 * @global
 */
const dataStructure = Immutable.Map({
  types: [
    'template',
    'data',
    'description',
    'section',
    'prototype',
    'sections-template',
  ],
  config: Immutable.Map(config.huron),
  sections: Immutable.Map({
    sectionsByPath: Immutable.Map({}),
    sectionsByURI: Immutable.Map({}),
    sorted: {},
  }),
  templates: Immutable.Map({}),
  prototypes: Immutable.Map({}),
  sectionTemplatePath: '',
  referenceDelimiter: '.',
});
/* eslint-enable */

// Generate watch list for Gaze, start gaze
const gazeWatch = [];

// Push KSS source directories and section template to Gaze
gazeWatch.push(path.resolve(__dirname, huron.sectionTemplate));
huron.kss.forEach((sourceDir) => {
  let gazeDir = sourceDir;

  /* eslint-disable space-unary-ops */
  if ('/' === sourceDir.slice(-1)) {
    gazeDir = sourceDir.slice(0, -1);
  }
  /* eslint-enable space-unary-ops */

  gazeWatch.push(
    `${gazeDir}/**/*.+(${extensions.join('|')})`
  );
});

/**
 * Gaze instance for watching all files, including KSS, html, hbs/template, and JSON
 *
 * @global
 */
const gaze = new Gaze(gazeWatch);

/**
 * Initialize data store with files from gaze and original data structure
 *
 * @global
 */
const store = initFiles(gaze.watched(), dataStructure);

requireTemplates(store);
writeStore(store);

if (! program.production) {
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
