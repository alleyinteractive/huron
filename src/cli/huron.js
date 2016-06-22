// CLI for Huron

// Modules
const cwd = process.cwd(); // Current working directory
const kss = require('kss'); // node implementation of KSS: a methodology for documenting CSS and generating style guides
const path = require('path');
const fs = require('fs-extra');
const Gaze = require('gaze').Gaze;
const memStore = require('memory-store');

// Local imports
import { program } from './parse-args';
import { initFiles, updateSection, updateFile } from './actions';
import generateConfig from './generate-config';
import requireTemplates from './require-templates';
import startWebpack from './server';

// Set vars
const localConfig = require(path.join(cwd, program.config));
const huronScript = requireTemplates(localConfig);
const config = generateConfig(localConfig, huronScript);
const huron = config.huron; // huron config
const sections = memStore.createStore();

// Generate initial dataset
const gaze = new Gaze([
  `${huron.kss}/**/*.html`,
  `${huron.kss}/**/*${huron.kssExt}`,
  `${huron.kss}/**/*.handlebars`,
  `${huron.kss}/**/*.hbs`,
  `${huron.kss}/**/*.json`,
]);

initFiles(gaze.watched(), sections, huron);

gaze.on('changed', (filepath) => {
  updateFile(filepath, sections, huron);
});

gaze.on('added', (filepath) => {
  console.log(filepath);
});

// Start webpack or build for production
// startWebpack(config);
