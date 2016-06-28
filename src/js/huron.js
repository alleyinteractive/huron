// Accept the huron.js module for Huron development
if (module.hot) {
  module.hot.accept();
}

import { templates, addCallback } from './huron-requires';

/* Method for inserting nodes via html import
 *
 * Uses webcomponents import() method to grab html, then inserts that html
 * into a custom element. That element is then replaced with the element's template contents
 * in order to keep prototype markup as close to WordPress markup as possible.
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
        const templateMarker = context.querySelector(templateId);

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
    const tags = context.querySelectorAll(templateId);

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
        .querySelector(templateId);

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

// Create a new instance of the InsertNodes class
/*eslint-disable*/
const insert = new InsertNodes(templates);

// Cycle elements when a template is changed
addCallback((template, templates) => {
  insert.templates = templates;
  insert.cycleEl(template, document);
});
/*eslint-enable*/
