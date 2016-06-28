// Accept the huron.js module for Huron development
if (module.hot) {
  module.hot.accept();
}

import { templates, addCallback } from './huron-requires';
console.log(templates);

/* Method for inserting nodes via html import
 *
 * Uses webcomponents import() method to grab html, then inserts that html
 * into a custom element. That element is then replaced with the element's template contents
 * in order to keep prototype markup as close to WordPress markup as possible.
 */
class InsertNodes {

  constructor(templates) {
    this.templates = templates;

    // Inits
    this.cycleEls(document);
  }

  /*
   * Replace all template markers with the actual template markup,
   * ensuring our prototypes look as close as possible to the final product.
   */
  cycleEls(context, parentId = null) {
    for (const templateId in this.templates) {
      if (templateId !== null) {
        // Check if there's at least one instance of a template in this context
        const templateMarker = context.querySelector(templateId);

        if (templateMarker !== null && templateMarker.childNodes.length === 0) {
          const template = this.templates[templateId];

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
    const templateChildren = templateWrapper.content.children;
    const templateId = templateWrapper.getAttribute('id');
    const tags = context.querySelectorAll(templateId);

    if (document === context) {
      this.disposeEl(tags, templateId);
    }
    this.cycleEls(templateWrapper.content, templateId);

    for (let i = 0; i < tags.length; i++) {
      const tag = tags.item(i);
      console.log(tag);
      if (!tag.hasAttribute('huron-inserted')) {
        this.insertEl(tag, templateId, templateChildren);
        // Hide the tag and add huron-inserted attr to ensure it's not re-inserted on a later pass
        tag.style.display = 'none';
        tag.setAttribute('huron-inserted', '');
      }
    }
  }

  /*
   * Replace template marker with contents of template
   */
  insertEl(tag, templateId, templateChildren) {
    for (let i = 0; i < templateChildren.length; i++) {
      // Child node must be cloned to allow insertion in multiple places
      const childEl = templateChildren.item(i).cloneNode(true);

      // Set the template-id attribute to mark it for disposal on the next cycle
      childEl.setAttribute('huron-id', templateId);
      tag.parentNode.insertBefore(childEl, tag);
    }
  }

  /*
   * Ensure previously inserted template children are cleared before re-insertion
   */
  disposeEl(tags, templateId) {
    const templateChildren = document
      .querySelectorAll(`[huron-id="${templateId}"]`);

    // Loop through all instances of this template's children and remove them.
    for (let i = 0; i < templateChildren.length; i++) {
      const childEl = templateChildren.item(i);
      childEl.parentNode.removeChild(childEl);
    }

    // Remove huron-insert attribute from each tag
    for (let i = 0; i < tags.length; i++) {
      const tag = tags.item(i);
      tag.removeAttribute('huron-inserted');
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
}

// Create a new instance of the InsertNodes class
/*eslint-disable*/
const insert = new InsertNodes(templates);

// Cycle elements when a template is changed
addCallback(template => {
  insert.cycleEl(template, document);
});
/*eslint-enable*/
