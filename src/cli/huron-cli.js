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

/**
 * Available file extensions
 *
 * @global
 */
const extenstions = [
  huron.kssExtension,
  '.html',
  '.handlebars',
  '.hbs',
  '.json',
];

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

/**
 * Data store, to be initialized with dataStructure
 *
 * @global
 */
let store = null; // All updates to store will be here

// Generate watch list for Gaze, start gaze
const gazeWatch = [];
gazeWatch.push(path.resolve(__dirname, huron.sectionTemplate));
extenstions.forEach((ext) => {
  gazeWatch.push(`${huron.kss}/**/*${ext}`);
});

/**
 * Gaze instance for watching all files, including KSS, html, hbs/template, and JSON
 *
 * @global
 */
const gaze = new Gaze(gazeWatch);

// Initialize all files watched by gaze
store = initFiles(gaze.watched(), dataStructure);
requireTemplates(store);
writeStore(store);

if (! program.production) {
  /** @module cli/gaze */

  /**
   * Anonymous handler for Gaze 'changed' event indicating a file has changed
   *
   * @callback changed
   * @listens gaze:changed
   * @param {string} filepath - absolute path of changed file
   */
  gaze.on('changed', (filepath) => {
    store = updateFile(filepath, store);
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
    store = updateFile(filepath, store);
    writeStore(store);
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
    store = deleteFile(oldPath, store);
    store = updateFile(newPath, store);
    writeStore(store);
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
    store = deleteFile(filepath, store);
    writeStore(store);
    console.log(chalk.red(`${filepath} deleted`));
  });
} else {
  gaze.close();
}

// Start webpack or build for production
startWebpack(config);
