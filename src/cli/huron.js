// CLI for Huron

// Modules
const cwd = process.cwd(); // Current working directory
const kss = require('kss'); // node implementation of KSS: a methodology for documenting CSS and generating style guides
const path = require('path');
const fs = require('fs-extra');
const Gaze = require('gaze').Gaze;
const Immutable = require('immutable');
const chalk = require('chalk'); // Colorize terminal output

// Local imports
import { program } from './parse-args';
import { initFiles, updateFile, deleteFile } from './actions';
import { requireTemplates, writeStore } from './require-templates';
import { utils } from './utils';
import generateConfig from './generate-config';
import startWebpack from './server';

// Set vars
const localConfig = require(path.join(cwd, program.config));
const config = generateConfig(localConfig);
const huron = config.huron;
const extenstions = [
  huron.kssExtension,
  '.html',
  '.handlebars',
  '.hbs',
  '.json'
];

// Create initial data structure
const dataStructure = Immutable.Map({
  types: [
    'template',
    'data',
    'description',
    'section',
    'prototype',
  ],
  config: Immutable.Map(config.huron),
  sections: Immutable.Map({
    sectionsByPath: Immutable.Map({}),
    sectionsByURI: Immutable.Map({}),
    sorted: {},
  }),
  templates: Immutable.Map({}),
  prototypes: Immutable.Map({})
});
let store = null; // All updates to store will be here

// Generate watch list for Gaze, start gaze
const gazeWatch = [];
gazeWatch.push(path.resolve(__dirname, huron.sectionTemplate));
extenstions.forEach(ext => {
  gazeWatch.push(`${huron.kss}/**/*${ext}`);
});
const gaze = new Gaze(gazeWatch);

// Initialize all files watched by gaze
store = initFiles(gaze.watched(), dataStructure);
requireTemplates(store);
writeStore(store);

if (!program.production) {
  // file changed
  gaze.on('changed', (filepath) => {
    const file = path.parse(filepath);
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
