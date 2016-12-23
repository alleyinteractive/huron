'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.htmlHandler = undefined;

var _utils = require('./utils');

var path = require('path'); /** @module cli/html-handler */

var fs = require('fs-extra');

/* eslint-disable */
var htmlHandler = exports.htmlHandler = {
  /* eslint-enable */

  /**
   * Handle update of an HMTL template
   *
   * @function updateTemplate
   * @param {string} filepath - filepath of changed file (comes from gaze)
   * @param {object} section - contains KSS section data
   * @param {object} store - memory store
   * @return {object} updated data store
   */
  updateTemplate: function updateTemplate(filepath, section, store) {
    var file = path.parse(filepath);
    var content = fs.readFileSync(filepath, 'utf8');
    var newSection = section;

    if (content) {
      newSection.templatePath = _utils.utils.writeFile(section.referenceURI, 'template', filepath, content, store);
      newSection.templateContent = content;

      // Rewrite section data with template content
      newSection.sectionPath = _utils.utils.writeSectionData(store, newSection);

      return store.setIn(['sections', 'sectionsByPath', section.kssPath], newSection).setIn(['sections', 'sectionsByURI', section.referenceURI], newSection);
    }

    console.log('File ' + file.base + ' could not be read');
    return store;
  },


  /**
   * Handle removal of an HMTL template
   *
   * @function deleteTemplate
   * @param {string} filepath - filepath of changed file (comes from gaze)
   * @param {object} section - contains KSS section data
   * @param {object} store - memory store
   * @return {object} updated data store
   */
  deleteTemplate: function deleteTemplate(filepath, section, store) {
    var newSection = section;

    _utils.utils.removeFile(newSection.referenceURI, 'template', filepath, store);

    delete newSection.templatePath;

    return store.setIn(['sections', 'sectionsByPath', section.kssPath], newSection).setIn(['sections', 'sectionsByURI', section.referenceURI], newSection);
  },


  /**
   * Handle update for a prototype file
   *
   * @function updatePrototype
   * @param {string} filepath - filepath of changed file (comes from gaze)
   * @param {object} store - memory store
   * @return {object} updated data store
   */
  updatePrototype: function updatePrototype(filepath, store) {
    var file = path.parse(filepath);
    var content = fs.readFileSync(filepath, 'utf8');

    if (content) {
      var requirePath = _utils.utils.writeFile(file.name, 'prototype', filepath, content, store);

      return store.setIn(['prototypes', file.name], requirePath);
    }

    console.log('File ' + file.base + ' could not be read');
    return store;
  },


  /**
   * Handle removal of a prototype file
   *
   * @function deletePrototype
   * @param {string} filepath - filepath of changed file (comes from gaze)
   * @param {object} store - memory store
   * @return {object} updated data store
   */
  deletePrototype: function deletePrototype(filepath, store) {
    var file = path.parse(filepath);
    var requirePath = _utils.utils.removeFile(file.name, 'prototype', filepath, store);

    return store.setIn(['prototypes', file.name], requirePath);
  }
};
//# sourceMappingURL=handle-html.js.map