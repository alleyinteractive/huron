'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.kssHandler = undefined;

var _utils = require('./utils');

var _handleTemplates = require('./handle-templates');

var _requireTemplates = require('./require-templates');

var path = require('path'); /** @module cli/kss-handler */

var fs = require('fs-extra');
var parse = require('kss').parse;
var chalk = require('chalk'); // Colorize terminal output

/* eslint-disable */
var kssHandler = exports.kssHandler = {
  /* eslint-enable */

  /**
   * Handle update of a KSS section
   *
   * @function updateKSS
   * @param {string} filepath - filepath of changed file (comes from gaze)
   * @param {object} store - memory store
   */
  updateKSS: function updateKSS(filepath, store) {
    var kssSource = fs.readFileSync(filepath, 'utf8');
    var huron = store.get('config');
    var oldSection = _utils.utils.getSection(filepath, false, store) || {};
    var file = path.parse(filepath);
    var newStore = store;

    if (kssSource) {
      var styleguide = parse(kssSource, huron.get('kssOptions'));

      if (styleguide.data.sections.length) {
        var section = _utils.utils.normalizeSectionData(styleguide.data.sections[0]);

        // Update or add section data
        newStore = kssHandler.updateSectionData(filepath, section, oldSection, newStore);

        // Remove old section data if reference URI has changed
        if (oldSection && oldSection.referenceURI && oldSection.referenceURI !== section.referenceURI) {
          newStore = this.unsetSection(oldSection, file, newStore, false);
        }

        (0, _requireTemplates.writeStore)(newStore);
        console.log(chalk.green('KSS source in ' + filepath + ' changed or added'));
        return newStore;
      }

      console.log(chalk.magenta('No KSS found in ' + filepath));
      return newStore;
    }

    if (oldSection) {
      newStore = kssHandler.deleteKSS(filepath, oldSection, newStore);
    }

    console.log(chalk.red(filepath + ' not found or empty')); // eslint-disable-line no-console
    return newStore;
  },


  /**
   * Handle removal of a KSS section
   *
   * @function deleteKSS
   * @param {string} filepath - filepath of changed file (comes from gaze)
   * @param {object} section - KSS section data
   * @param {object} store - memory store
   */
  deleteKSS: function deleteKSS(filepath, section, store) {
    var file = path.parse(filepath);

    // Remove section data from memory store
    return kssHandler.unsetSection(section, file, store, true);
  },


  /**
   * Update the sections store with new data for a specific section
   *
   * @function updateSectionData
   * @param {object} section - contains updated section data
   * @param {string} kssPath - path to KSS section
   * @param {object} store - memory store
   */
  updateSectionData: function updateSectionData(kssPath, section, oldSection, store) {
    var sectionFileInfo = path.parse(kssPath);
    var dataFilepath = path.join(sectionFileInfo.dir, sectionFileInfo.name + '.json');
    var isInline = null !== section.markup.match(/<\/[^>]*>/);
    var newSort = kssHandler.sortSection(store.getIn(['sections', 'sorted']), section.reference, store.get('referenceDelimiter'));
    var newSection = Object.assign({}, oldSection, section);
    var newStore = store;

    // Required for reference from templates and data
    newSection.kssPath = kssPath;

    if (isInline) {
      // Set section value if inlineTempalte() returned a path
      newStore = kssHandler.updateInlineTemplate(kssPath, oldSection, newSection, newStore);
    } else {
      // Remove inline template, if it exists
      _utils.utils.removeFile(newSection.referenceURI, 'template', kssPath, store);
      // Update markup and data fields
      newStore = kssHandler.updateTemplateFields(sectionFileInfo, oldSection, newSection, newStore);
    }

    // Output section description
    newStore = kssHandler.updateDescription(kssPath, oldSection, newSection, newStore);

    // Output section data to a JSON file
    newSection.sectionPath = _utils.utils.writeSectionData(newStore, newSection, dataFilepath);

    // Update section sorting
    return newStore.setIn(['sections', 'sorted'], newSort).setIn(['sections', 'sectionsByPath', kssPath], newSection).setIn(['sections', 'sectionsByURI', section.referenceURI], newSection);
  },


  /**
   * Handle detection and output of inline templates, which is markup written
   * in the KSS documentation itself as opposed to an external file
   *
   * @function updateInlineTemplate
   * @param {string} oldSection - previous iteration of KSS data, if updated
   * @param {object} section - KSS section data
   * @return {object} updated memory store with new template path info
   */
  updateInlineTemplate: function updateInlineTemplate(filepath, oldSection, section, store) {
    var newSection = section;
    var newStore = store;

    // If we have inline markup
    if (this.fieldShouldOutput(oldSection, section, 'markup')) {
      newSection.templatePath = _utils.utils.writeFile(section.referenceURI, 'template', filepath, section.markup, store);
      newSection.templateContent = section.markup;

      return newStore.setIn(['sections', 'sectionsByPath', filepath], newSection).setIn(['sections', 'sectionsByURI', section.referenceURI], newSection);
    }

    return newStore;
  },


  /**
   * Handle output of section description
   *
   * @function updateDescription
   * @param {string} oldSection - previous iteration of KSS data, if updated
   * @param {object} section - KSS section data
   * @return {object} updated memory store with new descripton path info
   */
  updateDescription: function updateDescription(filepath, oldSection, section, store) {
    var newSection = section;
    var newStore = store;

    // If we don't have previous KSS or the KSS has been updated
    if (this.fieldShouldOutput(oldSection, section, 'description')) {
      // Write new description
      newSection.descriptionPath = _utils.utils.writeFile(section.referenceURI, 'description', filepath, section.description, store);

      return newStore.setIn(['sections', 'sectionsByPath', filepath], newSection).setIn(['sections', 'sectionsByURI', section.referenceURI], newSection);
    }

    return newStore;
  },


  /**
   * Handle Data and Markup fields
   *
   * @function updateTemplateFields
   * @param {string} file - File data for KSS file from path.parse()
   * @param {object} oldSection - outdated KSS data
   * @param {object} section - KSS section data
   * @param {object} store - memory store
   * @return {object} KSS section data with updated asset paths
   */
  updateTemplateFields: function updateTemplateFields(file, oldSection, section, store) {
    var kssPath = path.format(file);
    var newSection = section;
    var filepath = '';
    var oldFilepath = '';
    var newStore = store;

    ['data', 'markup'].forEach(function (field) {
      if (newSection[field]) {
        if (oldSection[field]) {
          oldFilepath = path.join(file.dir, oldSection[field]);
          newStore = _handleTemplates.templateHandler.deleteTemplate(oldFilepath, oldSection, newStore);
        }

        filepath = path.join(file.dir, newSection[field]);
        newStore = _handleTemplates.templateHandler.updateTemplate(filepath, newSection, newStore);
      } else {
        delete newSection[field];
        newStore = newStore.setIn(['sections', 'sectionsByPath', kssPath], newSection).setIn(['sections', 'sectionsByURI', newSection.referenceURI], newSection);
      }
    });

    return newStore;
  },


  /**
   * Remove a section from the memory store
   *
   * @function unsetSection
   * @param {object} section - contains updated section data
   * @param {string} file - file object from path.parse()
   * @param {object} store - memory store
   * @param {bool} removed - has the file been removed or just the section information changed?
   */
  unsetSection: function unsetSection(section, file, store, removed) {
    var sorted = store.getIn(['sections', 'sorted']);
    var kssPath = path.format(file);
    var dataFilepath = path.join(file.dir, file.name + '.json');
    var isInline = section.markup && null !== section.markup.match(/<\/[^>]*>/);
    var newSort = kssHandler.unsortSection(sorted, section.reference, store.get('referenceDelimiter'));
    var newStore = store;

    // Remove old section data
    _utils.utils.removeFile(section.referenceURI, 'section', dataFilepath, newStore);

    // Remove associated inline template
    if (isInline) {
      _utils.utils.removeFile(section.referenceURI, 'template', kssPath, newStore);
    }

    // Remove description template
    _utils.utils.removeFile(section.referenceURI, 'description', kssPath, newStore);

    // Remove data from sectionsByPath if file has been removed
    if (removed) {
      newStore = newStore.deleteIn(['sections', 'sectionsByPath', kssPath]);
    }

    return newStore.deleteIn(['sections', 'sectionsByURI', section.referenceURI]).setIn(['sections', 'sorted'], newSort);
  },


  /**
   * Sort sections and subsections
   *
   * @function sortSection
   * @param {object} sorted - currently sorted sections
   * @param {string} reference - reference URI of section to sort
   */
  sortSection: function sortSection(sorted, reference, delimiter) {
    var parts = reference.split(delimiter);
    var newSort = sorted[parts[0]] || {};
    var newSorted = sorted;

    if (1 < parts.length) {
      var newParts = parts.filter(function (part, idx) {
        return 0 !== idx;
      });
      newSorted[parts[0]] = kssHandler.sortSection(newSort, newParts.join(delimiter), delimiter);
    } else {
      newSorted[parts[0]] = newSort;
    }

    return newSorted;
  },


  /**
   * Remove a section from the sorted sections
   *
   * @function unsortSection
   * @param {object} sorted - currently sorted sections
   * @param {string} reference - reference URI of section to sort
   */
  unsortSection: function unsortSection(sorted, reference, delimiter) {
    var parts = reference.split(delimiter);
    var subsections = Object.keys(sorted[parts[0]]);
    var newSorted = sorted;

    if (subsections.length) {
      if (1 < parts.length) {
        var newParts = parts.filter(function (part, idx) {
          return 0 !== idx;
        });
        newSorted[parts[0]] = kssHandler.unsortSection(newSorted[parts[0]], newParts.join(delimiter), delimiter);
      }
    } else {
      delete newSorted[parts[0]];
    }

    return newSorted;
  },


  /**
   * Compare a KSS field between old and new KSS data to see if we need to output
   * a new module for that field
   *
   * @function fieldShouldOutput
   * @param {object} oldSection - currently sorted sections
   * @param {object} newSection - reference URI of section to sort
   * @param {string} field - KSS field to check
   */
  fieldShouldOutput: function fieldShouldOutput(oldSection, newSection, field) {
    return oldSection && (oldSection[field] !== newSection[field] || oldSection.referenceURI !== newSection.referenceURI) || !oldSection;
  }
};
//# sourceMappingURL=handle-kss.js.map