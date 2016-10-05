const cwd = process.cwd(); // Current working directory
const path = require('path');
const fs = require('fs-extra');
const parse = require('kss').parse;
const chalk = require('chalk'); // Colorize terminal output

import { utils } from './utils';
import { templateHandler } from './handle-templates';
import { writeStore }  from './require-templates';

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
  const oldData = utils.getSection(filepath, false, store);
  let newStore = store;

  if (kssSource) {
    const styleguide = parse(kssSource, huron.get('kssOptions'));

    if (styleguide.data.sections.length) {
      let section = utils.normalizeSectionData(styleguide.data.sections[0]);
      newStore = kssHandler.updateSectionData(section, filepath, store);
      writeStore(newStore);
      console.log(chalk.green(`KSS section ${section.referenceURI} file ${filepath} changed or added`));
      return newStore;
    } else {
      console.log(chalk.magenta(`No KSS found in ${filepath}`));
      return newStore;
    }
  } else {
    if (oldData) {
      newStore = kssHandler.deleteKSS(filepath, oldData, store);
    }
    console.log(chalk.red(`${filepath} not found or empty`));
    return newStore;
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
    utils.removeFile(section.referenceURI, 'template', filepath, store);
  }

  // Remove description template
  utils.removeFile(section.referenceURI, 'description', filepath, store);

  // Remove section data from memory store
  return kssHandler.unsetSection(section, filepath, store);
}

/**
 * Handle detection and output of inline templates, which is
 * markup written in the KSS documentation itself as opposed to an external file
 *
 * @param {string} oldSection - previous iteration of KSS data, if updated
 * @param {object} section - KSS section data
 *
 * @return {mixed} output template path or false
 */
kssHandler.updateInlineTemplate = function(filepath, oldSection, section, store) {
  const isInline = section.markup.match(/<\/[^>]*>/) !== null;
  const newSection = section;

  // If we have inline markup
  if (isInline) {
    newSection.templatePath = utils.writeFile(
      section.referenceURI,
      'template',
      filepath,
      section.markup,
      store
    );
  }

  return newSection;
}

/**
 * Handle output of section description
 *
 * @param {string} oldSection - previous iteration of KSS data, if updated
 * @param {object} section - KSS section data
 *
 * @return {mixed} output description path or false
 */
kssHandler.updateDescription = function(filepath, oldSection, section, store) {
  const newSection = section;

  // If we don't have previous KSS or the KSS has been updated
  if ((oldSection &&
        (oldSection.description !== section.description ||
          oldSection.referenceURI !== section.referenceURI)
    ) ||
    !oldSection
  ) {
    // Write new description
    newSection.descriptionPath = utils.writeFile(
      section.referenceURI,
      'description',
      filepath,
      section.description,
      store
    );
  }

  return newSection;
}

/**
 * Handle output of section description
 *
 * @param {string} file - File data for KSS file from path.parse()
 * @param {object} oldSection - outdate KSS data
 * @param {object} section - KSS section data
 * @param {object} store - memory store
 *
 * @return {object} KSS section data with updated asset paths
 */
kssHandler.updateReferenceURI = function(file, oldSection, section, store) {
  const isInline = section.markup.match(/<\/[^>]*>/) !== null;
  const filepath = path.format(file);
  const huron = store.get('config');
  const newSection = section;
  const dataFilepath = path.join(file.dir, `${file.name}.json`);
  let newStore = store;
  let newSort = kssHandler.sortSection(
    store.getIn(['sections', 'sorted']),
    section.referenceURI
  );

  if (
    oldSection.hasOwnProperty('referenceURI') &&
    oldSection.referenceURI !== newSection.referenceURI
  ) {
    newSort = kssHandler.unsortSection(newSort, oldSection.referenceURI);
    // Remove old description if referenceURI has changed
    utils.removeFile(oldSection.referenceURI, 'description', filepath, store);
    // Remove old inline template if referenceURI has changed
    if (isInline) {
      utils.removeFile(oldSection.referenceURI, 'template', filepath, store);
    }

    ['data', 'markup'].forEach((field) => {
      if (oldSection[field]) {
        const filepath = path.join(file.dir, oldSection[field]);

        newStore = templateHandler.deleteTemplate(filepath, oldSection, newStore);
        newStore = templateHandler.updateTemplate(filepath, section, newStore);
      }
    });

    // Remove old section data
    utils.removeFile(
      oldSection.referenceURI,
      'section',
      dataFilepath,
      store
    );
  }

  return newStore
    .setIn(
      ['sections', 'sorted'],
      newSort
    );
}

/**
 * Update the sections store with new data for a specific section
 *
 * @param {object} section - contains updated section data
 * @param {string} kssPath - path to KSS section
 * @param {object} store - memory store
 */
kssHandler.updateSectionData = function(section, kssPath, store) {
  const huron = store.get('config');
  const oldSection = utils.getSection(kssPath, false, store) || {};
  const sectionMarkup = section.markup;
  const sectionFileInfo = path.parse(kssPath);
  const dataFilepath = path.join(sectionFileInfo.dir, `${sectionFileInfo.name}.json`);
  let newSection = Object.assign({}, oldSection, section);;
  let newStore = store;

  // Required for reference from templates and data
  newSection.kssPath = kssPath;

  // Set section value if inlineTempalte() returned a path
  newSection = kssHandler.updateInlineTemplate(kssPath, oldSection, newSection, newStore);

  // Output section description
  newSection = kssHandler.updateDescription(kssPath, oldSection, newSection, newStore);

  // Output section data
  newSection.sectionPath = utils.writeFile(
    newSection.referenceURI,
    'section',
    dataFilepath,
    JSON.stringify(newSection),
    store
  );

  // Output new version of non-inline templates and data
  // if section URI was changed (as those files are written using referenceURI)
  newStore = kssHandler.updateReferenceURI(sectionFileInfo, oldSection, section, store);

  // Update section sorting
  return newStore
    .setIn(
      ['sections', 'sectionsByPath', kssPath],
      newSection
    )
    .setIn(
      ['sections', 'sectionsByURI', section.referenceURI],
      newSection
    )
}

/**
 * Remove a section from the memory store
 *
 * @param {object} section - contains updated section data
 * @param {string} kssPath - path to KSS section
 * @param {object} store - memory store
 */
kssHandler.unsetSection = function(section, kssPath, store) {
  const sorted = store.getIn(['sections', 'sorted']);
  const newSort = kssHandler.unsortSection(sorted, section.referenceURI);
  return store
    .deleteIn(['sections', 'sectionsByPath', kssPath])
    .deleteIn(['sections', 'sectionsByURI', section.referenceURI])
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
    let newParts = parts.filter((part, idx) => idx !== 0);
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
  const subsections = Object.keys(sorted[parts[0]]);

  if (subsections.length) {
    if (parts.length > 1) {
      let newParts = parts.filter((part, idx) => idx !== 0);
      sorted[parts[0]] = kssHandler.unsortSection(sorted[parts[0]], newParts.join('-'));
    }
  } else {
    delete sorted[parts[0]];
  }

  return sorted;
}
