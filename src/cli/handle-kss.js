const cwd = process.cwd(); // Current working directory
const path = require('path');
const fs = require('fs-extra');
const parse = require('kss').parse;
const chalk = require('chalk'); // Colorize terminal output

import { utils } from './utils';
import requireTemplates from './require-templates';

export const kssHandler = {};

/**
 * Handle update of a KSS section
 *
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} store - memory store
 */
kssHandler.updateKSS = function(filepath, store) {
  const kssSource = fs.readFileSync(filepath, 'utf8');
  const huron = store.get('config');
  const file = path.parse(filepath);

  if (kssSource) {
    const styleguide = parse(kssSource, huron.get('kssOptions'));

    if (styleguide.data.sections.length) {
      const section = utils.normalizeSectionData(styleguide.data.sections[0]);
      // Check for any HTML tag in the markup section, which should indicate it's using inline HTML
      const isInline = section.markup.match(/<\/[^>]*>/) !== null;
      const oldData = utils.getSection(filepath, false, store);

      // Copy over section template
      section.sectionPath = utils.writeFile(
        section.referenceURI,
        'section',
        fs.readFileSync(huron.get('templates').sectionTemplate, 'utf8'),
        store
      );

      // If we have inline markup
      if (isInline) {
        // If reference URI has changed, remove old templates
        // and delete template indices from templates memory store
        if (oldData && oldData.referenceURI !== section.referenceURI) {
          utils.removeFile(oldData.referenceURI, 'template', store);
        }

        // Write new inline markup
        const inlineOutput = utils.writeFile(section.referenceURI, 'template', section.markup, store);
        section.templatePath = inlineOutput;
      }

      // If we don't have previous KSS or the KSS has been updated
      if ((oldData && oldData.description !== section.description) || !oldData) {
        const descriptionOutput = utils.writeFile(section.referenceURI, 'description', section.description, store);
        section.descriptionPath = descriptionOutput;
      }

      const newStore = kssHandler.updateSection(section, filepath, isInline, store);
      requireTemplates(newStore);
      console.log(chalk.green(`KSS section ${section.referenceURI} file ${filepath} changed or added`));
      return newStore;
    } else {
      console.log(chalk.magenta(`No KSS found in ${filepath}`));
      return store;
    }
  } else {
    console.log(chalk.red(`${filepath} not found or empty`));
    return store;
  }
}

/**
 * Handle removal of a KSS section
 *
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} section - KSS section data
 * @param {object} store - memory store
 */
kssHandler.deleteKSS = function(filepath, section, store) {
  const isInline = section.markup.match(/<\/[^>]*>/) !== null;
  const huron = store.get('config');
  const file = path.parse(filepath);

  // Remove associated inline template
  if (isInline) {
    utils.removeFile(section.referenceURI, 'template', store);
  }

  // Remove description template
  utils.removeFile(section.referenceURI, 'description', store);

  // Remove section data from memory store
  return unsetSection(sections, section, filepath);
}

/**
 * Update the sections store with new data for a specific section
 *
 * @param {object} section - contains updated section data
 * @param {string} sectionPath - path to KSS section
 * @param {bool} isInline - is the markup inline in KSS?
 * @param {object} store - memory store
 */
kssHandler.updateSection = function(section, sectionPath, isInline, store) {
  const oldData = utils.getSection(sectionPath, false, store);
  const sectionMarkup = section.markup;
  const sectionFileInfo = path.parse(sectionPath);
  let resetData = null;
  let newSort = kssHandler.sortSection(
    store.getIn(['sections', 'sorted']),
    section.referenceURI
  );

  // Store section data based on filepath so we can garbage-collect references
  // in the future
  if (oldData) {
    // If section exists, merge section data
    resetData = Object.assign({}, oldData, section);
    newSort = kssHandler.unsortSection(newSort, oldData.referenceURI);
  } else {
    // If section does not exist, set the new section
    resetData = section;
  }

  // Required for reference from templates and data
  resetData.sectionPath = sectionPath;

  // Update section sorting
  return store
    .setIn(
      ['sections', 'sectionsByPath', sectionPath],
      resetData
    )
    .setIn(
      ['sections', 'sorted'],
      newSort
    );
}

/**
 * Remove a section from the memory store
 *
 * @param {object} section - contains updated section data
 * @param {string} sectionPath - path to KSS section
 * @param {object} store - memory store
 */
kssHandler.unsetSection = function(section, sectionPath, store) {
  const newSort = kssHandler.unsortSection(sorted, section.referenceURI);
  return store
    .deleteIn(['sections', 'sectionsByPath', sectionPath])
    .setIn(['sections', 'sorted'], newSort);
}

/**
 * Sort sections and subsections
 *
 * @param {object} sorted - currently sorted sections
 * @param {string} reference - reference URI of section to sort
 */
kssHandler.sortSection = function(sorted, reference) {
  let parts = reference.split('-');
  let newSort = sorted[parts[0]] || {};

  if (parts.length > 1) {
    let newParts = parts.filter((part, idx) => {
      return idx !== 0;
    });
    sorted[parts[0]] = kssHandler.sortSection(newSort, newParts.join('-'));
  } else {
    sorted[parts[0]] = newSort;
  }

  return sorted;
}

/**
 * Remove a section from the sorted sections
 *
 * @param {object} sorted - currently sorted sections
 * @param {string} reference - reference URI of section to sort
 */
kssHandler.unsortSection = function(sorted, reference) {
  let parts = reference.split('-');

  if (sorted[parts[0]]) {
    if (parts.length > 1) {
      let newParts = parts.filter((part, idx) => {
        return idx !== 0;
      });
      sorted = kssHandler.unsortSection(sorted[parts[0]], newParts.join('-'));
    } else {
      delete sorted[parts[0]];
    }
  }

  return sorted;
}