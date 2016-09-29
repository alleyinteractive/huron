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
import generateConfig from './generate-config';
import requireTemplates from './require-templates';
import startWebpack from './server';

// Set vars
const localConfig = require(path.join(cwd, program.config));
const config = generateConfig(localConfig);
const huron = config.huron;
const huronScript = fs.readFileSync(path.resolve(__dirname, '../js/huron.js'), 'utf8');
const sectionTemplate = fs.readFileSync(path.resolve(__dirname, '../../templates/section.hbs'), 'utf8');
const extenstions = [
  huron.kssExtension,
  '.html',
  '.handlebars',
  '.hbs',
  '.json'
];

// Create initial data structure
const dataStructure = Immutable.Map({
  config: Immutable.Map(config.huron),
  sections: Immutable.Map({
    sectionsByPath: Immutable.Map({}),
    sorted: {},
  }),
  templates: Immutable.Map({}),
  prototypes: Immutable.Map({})
});
let store = null; // All updates to store will be here

// Move huron script and section template into huron root
// @todo move to separate file/function
fs.outputFileSync(path.join(cwd, huron.root, 'huron.js'), huronScript);
fs.outputFileSync(
  path.join(cwd, huron.root, huron.output, 'huron-sections/sections.hbs'),
  sectionTemplate
);

// Generate watch list for Gaze, start gaze
const gazeWatch = [];
extenstions.forEach(ext => {
  gazeWatch.push(`${huron.kss}/**/*${ext}`);
});
const gaze = new Gaze(gazeWatch);

// Initialize all files watched by gaze
store = initFiles(gaze.watched(), dataStructure);
requireTemplates(store);

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
    requireTemplates(store);
    console.log(chalk.blue(`${filepath} added!`));
  });

  // file renamed
  gaze.on('renamed', (newPath, oldPath) => {
    store = deleteFile(oldPath, store);
    store = updateFile(newPath, store);
    requireTemplates(store);
    console.log(chalk.blue(`${newPath} added!`));
  });

  // file deleted
  gaze.on('deleted', (filepath) => {
    store = deleteFile(filepath, store);
    console.log(store);
    requireTemplates(store);
    console.log(chalk.red(`${filepath} deleted`));
  });
} else {
  gaze.close();
}

// Start webpack or build for production
// startWebpack(config);


