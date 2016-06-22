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
const config = generateConfig(localConfig);
const huron = config.huron; // huron config
const sections = memStore.createStore();
const templates = memStore.createStore();

// Generate initial dataset
const gaze = new Gaze([
  `${huron.kss}/**/*.html`,
  `${huron.kss}/**/*${huron.kssExt}`,
  `${huron.kss}/**/*.handlebars`,
  `${huron.kss}/**/*.hbs`,
  `${huron.kss}/**/*.json`,
]);

initFiles(gaze.watched(), sections, templates, huron);
requireTemplates(huron, templates);

// file changed
gaze.on('changed', (filepath) => {
  updateFile(filepath, sections, templates, huron);
});

// file added
gaze.on('added', (filepath) => {
  updateFile(filepath, sections, templates, huron);
  requireTemplates(huron, templates);
});

// file renamed
gaze.on('renamed', (filepath) => {
  updateFile(filepath, sections, templates, huron);
  requireTemplates(huron, templates);
});

// file deleted
gaze.on('deleted', (filepath) => {
  // TODO: Add logic to remove output HTML
  requireTemplates(huron, templates);
});

// Start webpack or build for production
// startWebpack(config);
