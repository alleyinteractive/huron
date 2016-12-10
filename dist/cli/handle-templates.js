'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.templateHandler = undefined;

var _utils = require('./utils');

var path = require('path'); /** @module cli/template-handler */

var fs = require('fs-extra');
var chalk = require('chalk');

/* eslint-disable */
var templateHandler = exports.templateHandler = {
  /* eslint-enable */
  /**
   * Handle update of a template or data (json) file
   *
   * @function updateTemplate
   * @param {string} filepath - filepath of changed file (comes from gaze)
   * @param {object} section - contains KSS section data
   * @param {object} store - memory store
   */
  updateTemplate: function updateTemplate(filepath, section, store) {
    var file = path.parse(filepath);
    var pairPath = _utils.utils.getTemplateDataPair(file, section, store);
    var type = '.json' === file.ext ? 'data' : 'template';
    var newSection = section;
    var newStore = store;
    var content = false;

    try {
      content = fs.readFileSync(filepath, 'utf8');
    } catch (e) {
      console.log(chalk.red(filepath + ' does not exist'));
    }

    if (content) {
      var requirePath = _utils.utils.writeFile(newSection.referenceURI, type, filepath, content, newStore);
      newSection[type + 'Path'] = requirePath;

      if ('template' === type) {
        newSection.templateContent = content;

        // Rewrite section data with template content
        newSection.sectionPath = _utils.utils.writeSectionData(newStore, newSection);
      }

      return newStore.setIn(['templates', requirePath], pairPath).setIn(['sections', 'sectionsByPath', newSection.kssPath], newSection).setIn(['sections', 'sectionsByURI', newSection.referenceURI], newSection);
    }

    return newStore;
  },


  /**
   * Handle removal of a template or data (json) file
   *
   * @function deleteTemplate
   * @param {string} filepath - filepath of changed file (comes from gaze)
   * @param {object} section - contains KSS section data
   * @param {object} store - memory store
   */
  deleteTemplate: function deleteTemplate(filepath, section, store) {
    var file = path.parse(filepath);
    var type = '.json' === file.ext ? 'data' : 'template';
    var newSection = section;
    var newStore = store;

    // Remove partner
    var requirePath = _utils.utils.removeFile(newSection.referenceURI, type, filepath, newStore);
    delete newSection[type + 'Path'];

    return newStore.deleteIn(['templates', requirePath]).setIn(['sections', 'sectionsByPath', newSection.kssPath], newSection).setIn(['sections', 'sectionsByURI', newSection.referenceURI], newSection);
  }
};
//# sourceMappingURL=handle-templates.js.map