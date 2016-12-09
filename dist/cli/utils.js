'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/** @module cli/utilities */

var cwd = process.cwd(); // Current working directory
var path = require('path');
var fs = require('fs-extra');
var chalk = require('chalk'); // Colorize terminal output

// Exports
/* eslint-disable */
var utils = exports.utils = {
  /* eslint-enable */

  /**
   * Ensure predictable data structure for KSS section data
   *
   * @function normalizeSectionData
   * @param {object} section - section data
   */
  normalizeSectionData: function normalizeSectionData(section) {
    var data = section.data || section;

    if (!data.referenceURI || '' === data.referenceURI) {
      data.referenceURI = section.referenceURI();
    }

    return data;
  },


  /**
   * Ensure predictable data structure for KSS section data
   *
   * @function writeSectionData
   * @param {object} store - data store
   * @param {object} section - section data
   * @param {string} sectionPath - output destination for section data file
   */
  writeSectionData: function writeSectionData(store, section) {
    var sectionPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var outputPath = sectionPath;
    var sectionFileInfo = void 0;

    if (!outputPath && {}.hasOwnProperty.call(section, 'kssPath')) {
      sectionFileInfo = path.parse(section.kssPath);
      outputPath = path.join(sectionFileInfo.dir, sectionFileInfo.name + '.json');
    }

    // Output section data
    if (outputPath) {
      return utils.writeFile(section.referenceURI, 'section', outputPath, JSON.stringify(section), store);
    }

    console.warn( // eslint-disable-line no-console
    chalk.red('Failed to write section data for ' + section.referenceURI));
    return false;
  },


  /**
   * Find .json from a template file or vice versa
   *
   * @function getTemplateDataPair
   * @param {object} file - file object from path.parse()
   * @param {object} section - KSS section data
   */
  getTemplateDataPair: function getTemplateDataPair(file, section, store) {
    var huron = store.get('config');
    var kssDir = utils.matchKssDir(file.dir, huron);

    if (kssDir) {
      var componentPath = path.relative(path.resolve(cwd, kssDir), file.dir);
      var partnerType = '.json' === file.ext ? 'template' : 'data';
      var partnerExt = '.json' === file.ext ? huron.get('templates').extension : '.json';

      var pairPath = path.join(componentPath, utils.generateFilename(section.referenceURI, partnerType, partnerExt, store));

      return './' + pairPath;
    }

    return false;
  },


  /**
   * Normalize a section title for use as a filename
   *
   * @function normalizeHeader
   * @param {string} header - section header extracted from KSS documentation
   */
  normalizeHeader: function normalizeHeader(header) {
    return header.toLowerCase().replace(/\s?\W\s?/g, '-');
  },


  /**
   * Wrap html in required template tags
   *
   * @function wrapMarkup
   * @param {string} content - html or template markup
   * @param {string} templateId - id of template (should be section reference)
   */
  wrapMarkup: function wrapMarkup(content, templateId) {
    return '<dom-module>\n<template id="' + templateId + '">\n' + content + '\n</template>\n</dom-module>\n';
  },


  /**
   * Generate a filename based on referenceURI, type and file object
   *
   * @function generateFilename
   * @param  {string} id - The name of the file (with extension).
   * @param  {string} type - the type of file output
   * @param  {object} ext - file extension
   * @param  {store} store - data store
   * @return {string} Path to output file, relative to ouput dir (can be use in require statements)
   */
  generateFilename: function generateFilename(id, type, ext, store) {
    // Type of file and its corresponding extension(s)
    var types = store.get('types');
    var outputExt = '.scss' !== ext ? ext : '.html';

    /* eslint-disable */
    if (-1 === types.indexOf(type)) {
      console.log('Huron data ' + type + ' does not exist');
      return false;
    }
    /* eslint-enable */

    return id + '-' + type + outputExt;
  },


  /**
   * Copy an HTML file into the huron output directory.
   *
   * @function writeFile
   * @param  {string} id - The name of the file (with extension).
   * @param  {string} content - The content of the file to write.
   * @param  {string} type - the type of file output
   * @param  {object} store - The data store
   * @return {string} Path to output file, relative to ouput dir (can be use in require statements)
   */
  writeFile: function writeFile(id, type, filepath, content, store) {
    var huron = store.get('config');
    var file = path.parse(filepath);
    var filename = utils.generateFilename(id, type, file.ext, store);
    var kssDir = utils.matchKssDir(filepath, huron);

    if (kssDir) {
      var componentPath = path.relative(path.resolve(cwd, kssDir), file.dir);
      var outputRelative = path.join(huron.get('output'), componentPath, '' + filename);
      var outputPath = path.resolve(cwd, huron.get('root'), outputRelative);
      var newContent = content;

      if ('data' !== type && 'section' !== type) {
        newContent = utils.wrapMarkup(content, id);
      }

      try {
        fs.outputFileSync(outputPath, newContent);
        console.log(chalk.green('Writing ' + outputRelative)); // eslint-disable-line no-console
      } catch (e) {
        console.log(chalk.red('Failed to write ' + outputRelative)); // eslint-disable-line no-console
      }

      return './' + outputRelative.replace(huron.get('output') + '/', '');
    }

    return false;
  },


  /**
   * Delete a file in the huron output directory
   *
   * @function removeFile
   * @param  {string} filename - The name of the file (with extension).
   * @param  {object} store - The data store
   * @return {string} Path to output file, relative to ouput dir (can be use in require statements)
   */
  removeFile: function removeFile(id, type, filepath, store) {
    var huron = store.get('config');
    var file = path.parse(filepath);
    var filename = utils.generateFilename(id, type, file.ext, store);
    var kssDir = utils.matchKssDir(filepath, huron);

    if (kssDir) {
      var componentPath = path.relative(path.resolve(cwd, kssDir), file.dir);
      var outputRelative = path.join(huron.get('output'), componentPath, '' + filename);
      var outputPath = path.resolve(cwd, huron.get('root'), outputRelative);

      try {
        fs.removeSync(outputPath);
        console.log(chalk.green('Removing ' + outputRelative)); // eslint-disable-line no-console
      } catch (e) {
        console.log( // eslint-disable-line no-console
        chalk.red(outputRelative + ' does not exist or cannot be deleted'));
      }

      return './' + outputRelative.replace(huron.get('output') + '/', '');
    }

    return false;
  },


  /**
   * Write a template for sections
   *
   * @function writeSectionTemplate
   * @param  {string} filepath - the original template file
   * @param  {object} store - data store
   * @return {object} updated store
   */
  writeSectionTemplate: function writeSectionTemplate(filepath, store) {
    var huron = store.get('config');
    var sectionTemplate = utils.wrapMarkup(fs.readFileSync(filepath, 'utf8'));
    var componentPath = './huron-sections/sections.hbs';
    var output = path.join(cwd, huron.get('root'), huron.get('output'), componentPath);

    // Move huron script and section template into huron root
    fs.outputFileSync(output, sectionTemplate);
    console.log(chalk.green('writing section template to ' + output)); // eslint-disable-line no-console

    return store.set('sectionTemplatePath', componentPath);
  },


  /**
   * Request for section data based on section reference
   *
   * @function writeSectionTemplate
   * @param {string} search - key on which to match section
   * @param {field} string - field in which to look to determine section
   * @param {obj} sections - sections memory store
   */
  getSection: function getSection(search, field, store) {
    var sectionValues = store.getIn(['sections', 'sectionsByPath']).valueSeq();
    var selectedSection = false;

    if (field) {
      selectedSection = sectionValues.filter(function (value) {
        return value[field] === search;
      }).get(0);
    } else {
      selectedSection = store.getIn(['sections', 'sectionsByPath', search]);
    }

    return selectedSection;
  },


  /**
   * Match which configured KSS directory the current file
   *
   * @function matchKssDir
   * @param {string} search - key on which to match section
   * @param {field} string - field in which to look to determine section
   * @param {obj} sections - sections memory store
   */
  matchKssDir: function matchKssDir(filepath, huron) {
    var kssSource = huron.get('kss');
    /* eslint-disable space-unary-ops */
    var kssMatch = kssSource.filter(function (dir) {
      return -1 !== filepath.indexOf(dir);
    });
    /* eslint-enable space-unary-ops */

    if (kssMatch.length) {
      return kssMatch[0];
    }

    console.error(chalk.red('filepath ' + filepath + ' does not exist in any\n      of the configured KSS directories'));
    return false;
  }
};
//# sourceMappingURL=utils.js.map