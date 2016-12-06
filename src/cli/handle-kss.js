import { utils } from './utils';
import { templateHandler } from './handle-templates';
import { writeStore } from './require-templates';

const path = require('path');
const fs = require('fs-extra');
const parse = require('kss').parse;
const chalk = require('chalk'); // Colorize terminal output

/* eslint-disable */
export const kssHandler = {};
/* eslint-enable */

/**
 * Handle update of a KSS section
 *
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} store - memory store
 */
kssHandler.updateKSS = function updateKSS(filepath, store) {
  const kssSource = fs.readFileSync(filepath, 'utf8');
  const huron = store.get('config');
  const oldSection = utils.getSection(filepath, false, store) || {};
  const file = path.parse(filepath);
  let newStore = store;

  if (kssSource) {
    const styleguide = parse(kssSource, huron.get('kssOptions'));

    if (styleguide.data.sections.length) {
      const section = utils.normalizeSectionData(
        styleguide.data.sections[0]
      );

      // Update or add section data
      newStore = kssHandler.updateSectionData(
        filepath,
        section,
        oldSection,
        newStore
      );

      // Remove old section data if reference URI has changed
      if (oldSection &&
        oldSection.referenceURI &&
        oldSection.referenceURI !== section.referenceURI
      ) {
        newStore = this.unsetSection(oldSection, file, newStore, false);
      }

      writeStore(newStore);
      console.log(
        chalk.green(
          `KSS source in ${filepath} changed or added`
        )
      );
      return newStore;
    }

    console.log(chalk.magenta(`No KSS found in ${filepath}`));
    return newStore;
  }

  if (oldSection) {
    newStore = kssHandler.deleteKSS(filepath, oldSection, newStore);
  }

  console.log(chalk.red(`${filepath} not found or empty`));
  return newStore;
};

/**
 * Handle removal of a KSS section
 *
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} section - KSS section data
 * @param {object} store - memory store
 */
kssHandler.deleteKSS = function deleteKSS(filepath, section, store) {
  const file = path.parse(filepath);

  // Remove section data from memory store
  return kssHandler.unsetSection(section, file, store, true);
};

/**
 * Update the sections store with new data for a specific section
 *
 * @param {object} section - contains updated section data
 * @param {string} kssPath - path to KSS section
 * @param {object} store - memory store
 */
kssHandler.updateSectionData = function updateSectionData(
  kssPath,
  section,
  oldSection,
  store
) {
  const sectionFileInfo = path.parse(kssPath);
  const dataFilepath = path.join(
    sectionFileInfo.dir,
    `${sectionFileInfo.name}.json`
  );
  const isInline = null !== section.markup.match(/<\/[^>]*>/);
  const newSort = kssHandler.sortSection(
    store.getIn(['sections', 'sorted']),
    section.reference,
    store.get('referenceDelimiter')
  );
  const newSection = Object.assign({}, oldSection, section);
  let newStore = store;

  // Required for reference from templates and data
  newSection.kssPath = kssPath;

  if (isInline) {
    // Set section value if inlineTempalte() returned a path
    newStore = kssHandler.updateInlineTemplate(
      kssPath,
      oldSection,
      newSection,
      newStore
    );
  } else {
    // Remove inline template, if it exists
    utils.removeFile(
      newSection.referenceURI,
      'template',
      kssPath,
      store
    );
    // Update markup and data fields
    newStore = kssHandler.updateTemplateFields(
      sectionFileInfo,
      oldSection,
      newSection,
      newStore
    );
  }

  // Output section description
  newStore = kssHandler.updateDescription(
    kssPath,
    oldSection,
    newSection,
    newStore
  );

  // Output section data to a JSON file
  newSection.sectionPath = utils.writeSectionData(
    newStore,
    newSection,
    dataFilepath
  );

  // Update section sorting
  return newStore
    .setIn(
      ['sections', 'sorted'],
      newSort
    )
    .setIn(
      ['sections', 'sectionsByPath', kssPath],
      newSection
    )
    .setIn(
      ['sections', 'sectionsByURI', section.referenceURI],
      newSection
    );
};

/**
 * Handle detection and output of inline templates, which is
 * markup written in the KSS documentation itself as opposed to an external file
 *
 * @param {string} oldSection - previous iteration of KSS data, if updated
 * @param {object} section - KSS section data
 *
 * @return {mixed} output template path or false
 */
kssHandler.updateInlineTemplate = function updateInlineTemplate(
  filepath,
  oldSection,
  section,
  store
) {
  const newSection = section;
  const newStore = store;

  // If we have inline markup
  if (this.fieldShouldOutput(oldSection, section, 'markup')) {
    newSection.templatePath = utils.writeFile(
      section.referenceURI,
      'template',
      filepath,
      section.markup,
      store
    );
    newSection.templateContent = section.markup;

    return newStore
      .setIn(
        ['sections', 'sectionsByPath', filepath],
        newSection
      )
      .setIn(
        ['sections', 'sectionsByURI', section.referenceURI],
        newSection
      );
  }

  return newStore;
};

/**
 * Handle output of section description
 *
 * @param {string} oldSection - previous iteration of KSS data, if updated
 * @param {object} section - KSS section data
 *
 * @return {mixed} output description path or false
 */
kssHandler.updateDescription = function updateDescription(
  filepath,
  oldSection,
  section,
  store
) {
  const newSection = section;
  const newStore = store;

  // If we don't have previous KSS or the KSS has been updated
  if (this.fieldShouldOutput(oldSection, section, 'description')) {
    // Write new description
    newSection.descriptionPath = utils.writeFile(
      section.referenceURI,
      'description',
      filepath,
      section.description,
      store
    );

    return newStore
      .setIn(
        ['sections', 'sectionsByPath', filepath],
        newSection
      )
      .setIn(
        ['sections', 'sectionsByURI', section.referenceURI],
        newSection
      );
  }

  return newStore;
};

/**
 * Handle Data and Markup fields
 *
 * @param {string} file - File data for KSS file from path.parse()
 * @param {object} oldSection - outdated KSS data
 * @param {object} section - KSS section data
 * @param {object} store - memory store
 *
 * @return {object} KSS section data with updated asset paths
 */
kssHandler.updateTemplateFields = function updateTemplateFields(
  file,
  oldSection,
  section,
  store
) {
  const kssPath = path.format(file);
  const newSection = section;
  let filepath = '';
  let oldFilepath = '';
  let newStore = store;

  ['data', 'markup'].forEach((field) => {
    if (newSection[field]) {
      if (oldSection[field]) {
        oldFilepath = path.join(file.dir, oldSection[field]);
        newStore = templateHandler.deleteTemplate(
          oldFilepath,
          oldSection,
          newStore
        );
      }

      filepath = path.join(file.dir, newSection[field]);
      newStore = templateHandler.updateTemplate(filepath, newSection, newStore);
    } else {
      delete newSection[field];
      newStore = newStore
        .setIn(
          ['sections', 'sectionsByPath', kssPath],
          newSection
        )
        .setIn(
          ['sections', 'sectionsByURI', newSection.referenceURI],
          newSection
        );
    }
  });

  return newStore;
};

/**
 * Remove a section from the memory store
 *
 * @param {object} section - contains updated section data
 * @param {string} file - file object from path.parse()
 * @param {object} store - memory store
 * @param {bool}   removed - has the file been removed or just the section information changed?
 */
kssHandler.unsetSection = function unsetSection(section, file, store, removed) {
  const sorted = store.getIn(['sections', 'sorted']);
  const kssPath = path.format(file);
  const dataFilepath = path.join(file.dir, `${file.name}.json`);
  const isInline = null !== section.markup.match(/<\/[^>]*>/);
  const newSort = kssHandler.unsortSection(
    sorted,
    section.reference,
    store.get('referenceDelimiter')
  );
  let newStore = store;

  // Remove old section data
  utils.removeFile(
    section.referenceURI,
    'section',
    dataFilepath,
    newStore
  );

   // Remove associated inline template
  if (isInline) {
    utils.removeFile(section.referenceURI, 'template', kssPath, newStore);
  }

  // Remove description template
  utils.removeFile(section.referenceURI, 'description', kssPath, newStore);

  // Remove data from sectionsByPath if file has been removed
  if (removed) {
    newStore = newStore.deleteIn(['sections', 'sectionsByPath', kssPath]);
  }

  return newStore
    .deleteIn(['sections', 'sectionsByURI', section.referenceURI])
    .setIn(['sections', 'sorted'], newSort);
};

/**
 * Sort sections and subsections
 *
 * @param {object} sorted - currently sorted sections
 * @param {string} reference - reference URI of section to sort
 */
kssHandler.sortSection = function sortSection(sorted, reference, delimiter) {
  const parts = reference.split(delimiter);
  const newSort = sorted[parts[0]] || {};
  const newSorted = sorted;

  if (1 < parts.length) {
    const newParts = parts.filter((part, idx) => 0 !== idx);
    newSorted[parts[0]] = kssHandler.sortSection(
      newSort,
      newParts.join(delimiter),
      delimiter
    );
  } else {
    newSorted[parts[0]] = newSort;
  }

  return newSorted;
};

/**
 * Remove a section from the sorted sections
 *
 * @param {object} sorted - currently sorted sections
 * @param {string} reference - reference URI of section to sort
 */
kssHandler.unsortSection = function unsortSection(
  sorted,
  reference,
  delimiter
) {
  const parts = reference.split(delimiter);
  const subsections = Object.keys(sorted[parts[0]]);
  const newSorted = sorted;

  if (subsections.length) {
    if (1 < parts.length) {
      const newParts = parts.filter((part, idx) => 0 !== idx);
      newSorted[parts[0]] = kssHandler.unsortSection(
        newSorted[parts[0]],
        newParts.join(delimiter),
        delimiter
      );
    }
  } else {
    delete newSorted[parts[0]];
  }

  return newSorted;
};

/**
 * Compare a KSS field between old and new KSS data to see if we need to output
 * a new module for that field
 *
 * @param {object} oldSection - currently sorted sections
 * @param {object} newSection - reference URI of section to sort
 * @param {string} field - KSS field to check
 */
kssHandler.fieldShouldOutput = function fieldShouldOutput(
  oldSection,
  newSection,
  field
) {
  return (oldSection &&
      (oldSection[field] !== newSection[field] ||
      oldSection.referenceURI !== newSection.referenceURI)
    ) ||
    ! oldSection;
};
