// Accept the huron.js module for Huron development
if (module.hot) {
  module.hot.accept();
}

import { sections, templates, addCallback } from './huron-requires';

/* Method for inserting HTML snippets at particular insertion points
 *
 * Uses require() to grab html partials, then inserts that html
 * into an element with an attribute `huron-id` corresponding to the template filename.
 */
class InsertNodes {

  constructor(templates) {
    this._templates = templates;
    this._templateIds = Object.keys(templates);

    // Inits
    this.cycleEls(document);
  }

  /*
   * Replace all template markers with the actual template markup,
   * ensuring our prototypes look as close as possible to the final product.
   */
  cycleEls(context, parentId = null) {
    for (const templateId in this._templates) {
      if (templateId !== null) {
        // Check if there's at least one instance of a template in this context
        const templateMarker = context.querySelector(`[huron-id=${templateId}`);

        if (templateMarker !== null && templateMarker.childNodes.length === 0) {
          const template = this._templates[templateId];

          if (!this.hasTemplate(template, parentId)) {
            this.cycleEl(template, context);
          } else {
            throw [
              'You have an infinite loop in your template parts!',
              'This usually means you have two templates including each other.',
            ].join(' ');
          }
        }
      }
    }
  }

  /*
   * Replace a single template marker with template content. This is called by HMR
   * when templates are edited.
   */
  cycleEl(template, context) {
    const templateWrapper = template
      .querySelector('template');
    const templateId = templateWrapper.getAttribute('id');
    const tags = context.querySelectorAll(`[huron-id=${templateId}`);

    for (let i = 0; i < tags.length; i++) {
      const tag = tags.item(i);
      tag.innerHTML = templateWrapper.innerHTML;
      this.cycleEls(tag, templateId);
    }
  }

  /*
   * Check if a template contains a specific subtemplate.
   */
  hasTemplate(template, templateId) {
    if (templateId !== null) {
      const subTemplate = template
        .querySelector('template')
        .content
        .querySelector(`[huron-id=${templateId}`);

      if (subTemplate !== null) {
        return true;
      }
    }

    return false;
  }

  /*
   * Set new templates object
   */
  set templates(templates) {
    this._templates = templates;
    this._templateIds = Object.keys(templates);
  }
}

/* Helper function for inserting styleguide sections.
 *
 * Recurses over sorted styleguide sections and inserts a <section> tag with
 * [huron-id] equal to the section template name.
 *
 * @todo: figure out how to handle added/removed sections with HMR
 * @todo: incorporate this function into the InsertNodes class
 */
function outputSections(sections, parent, el) {
  let templateId = null;
  let templateString = null;
  let wrapper = null;

  for (let section in sections) {
    if (parent) {
      templateId = `${parent}-${section}`;
    } else {
      templateId = section;
    }

    templateString = `section-${templateId}`;

    if (el) {
      wrapper = document.createElement('div');
      wrapper.setAttribute('huron-id', templateString);
      el.appendChild(wrapper);
    }

    if (sections[section] && wrapper) {
      outputSections(
        sections[section],
        templateId,
        document.querySelector(`[huron-id=${templateString}]`)
      );
    }
  }
}

// Create a new instance of the InsertNodes class
/*eslint-disable*/
const insert = new InsertNodes(templates);
const sectionsQuery = document.querySelector('[huron-sections]');

if (sectionsQuery) {
  outputSections(sections.sorted, null, sectionsQuery);
  insert.cycleEls(document);
}

// Cycle elements when a template is changed
addCallback((template, templates) => {
  insert.templates = templates;
  insert.cycleEl(template, document);
});
/*eslint-enable*/
