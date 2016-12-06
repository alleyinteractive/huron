// CLI for Huron

// Local imports
import { program } from './parse-args';
import { initFiles, updateFile, deleteFile } from './actions';
import { requireTemplates, writeStore } from './require-templates';
import generateConfig from './generate-config';
import startWebpack from './server';

// Modules
const cwd = process.cwd(); // Current working directory
const path = require('path');
const Gaze = require('gaze').Gaze;
const Immutable = require('immutable');
const chalk = require('chalk'); // Colorize terminal output

// Set vars
/* eslint-disable */
const localConfig = require(path.join(cwd, program.config));
/* eslint-enable */
const config = generateConfig(localConfig);
const huron = config.huron;
const extenstions = [
  huron.kssExtension,
  '.html',
  '.handlebars',
  '.hbs',
  '.json',
];

// Create initial data structure
/* eslint-disable */
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
let store = null; // All updates to store will be here

// Generate watch list for Gaze, start gaze
const gazeWatch = [];
gazeWatch.push(path.resolve(__dirname, huron.sectionTemplate));
extenstions.forEach((ext) => {
  gazeWatch.push(`${huron.kss}/**/*${ext}`);
});
const gaze = new Gaze(gazeWatch);

// Initialize all files watched by gaze
store = initFiles(gaze.watched(), dataStructure);
requireTemplates(store);
writeStore(store);

if (! program.production) {
  // file changed
  gaze.on('changed', (filepath) => {
    store = updateFile(filepath, store);
    console.log(chalk.green(`${filepath} updated!`));
  });

  // file added
  gaze.on('added', (filepath) => {
    store = updateFile(filepath, store);
    writeStore(store);
    console.log(chalk.blue(`${filepath} added!`));
  });

  // file renamed
  gaze.on('renamed', (newPath, oldPath) => {
    store = deleteFile(oldPath, store);
    store = updateFile(newPath, store);
    writeStore(store);
    console.log(chalk.blue(`${newPath} added!`));
  });

  // file deleted
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
