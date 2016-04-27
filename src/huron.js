if (module.hot) {
  module.hot.accept();
}

/* Method for inserting nodes via html import
 *
 * Uses webcomponents import() method to grab html, then inserts that html
 * into a custom element. That element is then replaced with the element's template contents
 * in order to keep prototype markup as close to WordPress markup as possible.
 */
class InsertNodes {

  constructor(context, templates) {
    this.templates = templates;
    this.context = context;

    // Inits
    this.replaceEls(this.context);
    this.insertScripts();
  }

  /*
   * Replace all template markers with the actual template markup,
   * ensuring our prototypes look as close as possible to the final product.
   */
  replaceEls(context) {
    for (let templateId in this.templates) {
      this.replaceEl(this.templates[templateId]);
    };
  }

  /*
   * Replace a single template marker with template content. This is called by HMR
   * when templates are edited.
   */
  replaceEl(template) {
    const templateWrapper = template
      .querySelector('template');
    const templateId = templateWrapper.getAttribute('id');
    const tags = this.context.querySelectorAll(templateId);

    for (let i = 0; i < tags.length; i++) {
      let tag = tags.item(i);

      tag.innerHTML = templateWrapper.innerHTML;
    }

    this.checkNestedTemplates(templateId, templateWrapper);
  }

  /*
   * Check if a template has nested templates and, if so, call this.replaceEl recursively to replace nested templates
   */
  checkNestedTemplates(parentId, templateWrapper) {
    for (let templateId in this.templates) {
      let subTemplateMarker = templateWrapper.content
        .querySelector(templateId);

      if (null !== subTemplateMarker && 0 === subTemplateMarker.children.length) {
        let subTemplate = this.templates[templateId];

        if (!this.hasTemplate(parentId, subTemplate)) {
          this.replaceEl(subTemplate);
        } else {
          throw "You have an infinite loop in your template parts! This usually means you have two templates including each other."
        }
      }
    }
  }

  /*
   * Check if a template contains a specific subtemplate.
   */
  hasTemplate(templateId, template) {
    let subTemplate = template
      .querySelector('template')
      .content
      .querySelector(templateId);

    if (null !== subTemplate) {
      return true;
    }

    return false;
  }

  /*
   * Insert script tags into <body> after all elemnts have loaded
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

InsertNodes = new InsertNodes(document, templates);
function templateReplaceCallback(template) {
  InsertNodes.replaceEl(template);
}
