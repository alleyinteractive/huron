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
    this.insertScripts();
    this.cycleEls(document);
  }

  /*
   * Replace all template markers with the actual template markup,
   * ensuring our prototypes look as close as possible to the final product.
   */
  cycleEls(context, parentId = null) {
    for (let templateId in this.templates) {
      let templateMarker = context.querySelector(templateId);

      if (null !== templateMarker && 0 === templateMarker.childNodes.length) {
        let template = this.templates[templateId];

        if (!this.hasTemplate(template, parentId)) {
          this.cycleEl(template, context);
        } else {
          throw "You have an infinite loop in your template parts! This usually means you have two templates including each other."
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
    this.insertEl(tags, templateId, templateChildren);
  }

  /*
   * Replace template marker with contents of template
   */
  insertEl(tags, templateId, templateChildren) {
    for (let i = 0; i < tags.length; i++) {
      let tag = tags.item(i);

      for (let i = 0; i < templateChildren.length; i++) {
        // Child node must be cloned to allow insertion in multiple places
        let childEl = templateChildren.item(i).cloneNode(true);

        // Set the template-id attribute to mark it for disposal on the next cycle
        childEl.setAttribute( 'template-id', templateId );
        tag.parentNode.insertBefore(childEl, tag);
      }

      tag.style.display = 'none';
    }
  }

  /*
   * Ensure previously inserted template children are cleared before re-insertion
   */
  disposeEl(tags, templateId) {
    const templateChildren = document
      .querySelectorAll('[template-id="' + templateId + '"]');

    // Loop through all instances of this template's children and remove them.
    for (let i = 0; i < templateChildren.length; i++) {
      let childEl = templateChildren.item(i);
      childEl.parentNode.removeChild(childEl);
    }

    // Show the template insertion marker again
    for (let i = 0; i < tags.length; i++) {
      let tag = tags.item(i);
      tag.style.display = '';
    }
  }

  /*
   * Check if a template contains a specific subtemplate.
   */
  hasTemplate(template, templateId) {
    if (null !== templateId) {
      let subTemplate = template
        .querySelector('template')
        .content
        .querySelector(templateId);

      if (null !== subTemplate) {
        return true;
      }
    }

    return false;
  }

  /*
   * Insert script tags into <body> after all elements have loaded
   */
  insertScripts() {
    if (document === this.context && 'undefined' !== window.protoScripts) {
      if (window.protoScripts.length) {
        var scriptArray = protoScripts,
          bodyNodes = document.body.children;

        scriptArray.forEach((value) => {
          var scriptTag = document.createElement('script');

          scriptTag.type = 'text/javascript';
          scriptTag.src = value;

          document.body.insertBefore(scriptTag, bodyNodes[bodyNodes.length - 1]);
        });
      }
    }
  }
}

// Accept the huron.js module for Huron development
if (module.hot) {
  module.hot.accept();
}

// Create a new instance of the InsertNodes class
let insert = new InsertNodes(templates);

// Cycle elements when a template is changed
function templateReplaceCallback(template) {
  insert.cycleEl(template, document);
}
