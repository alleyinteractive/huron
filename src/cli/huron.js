// CLI for Huron

// External
const cwd = process.cwd(); // Current working directory
const kss = require('kss'); // node implementation of KSS: a methodology for documenting CSS and generating style guides
const path = require('path');
const fs = require('fs-extra');
const Gaze = require('gaze').Gaze;
const memStore = require('memory-store');

// Local
import { program } from './parseArgs';
import { updateSection } from './actions';
import generateConfig from './generateConfig';
import requireTemplates from './requireTemplates';
import startWebpack from './server';

// Set vars
const localConfig = require(path.join(cwd, program.config));
const huronScript = requireTemplates(localConfig);
const config = generateConfig(localConfig, huronScript);
const huron = config.huron; // huron config
const sections = memStore.createStore();

const gaze = new Gaze([
  `${huron.kss}/**/*.html`,
  `${huron.kss}/**/*.css`,
  `${huron.kss}/**/*.md`,
  `${huron.kss}/**/*.handlebars`,
]);

gaze.on('changed', (event, filepath) => {
  console.log(filepath);
});

gaze.on('added', (event, filepath) => {
  console.log(filepath);
});

// Generate initial dataset
kss.traverse(huron.kss, {}, (err, sg) => {
  if (err) {
    throw err;
  }

  sg.data.sections.forEach(section => {
      updateSection(sections, section);
  });
});

// Start webpack or build for production
startWebpack(config);
