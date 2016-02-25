'use strict';

/* Method for inserting nodes via html import
 *
 * Uses webcomponents import() method to grab html, then inserts that html
 * into a custom element. That element is then replaced with the element's template contents
 * in order to keep prototype markup as close to WordPress markup as possible.
 */
class InsertNodes {

  constructor(links, context) {
    this.links = links;
    this.context = context;
    this.templates = {};
    this.bundle = this.context.getElementById('huron-bundle');
    this.hasBundle = (null !== this.bundle) && ('LINK' === this.bundle.tagName);

    // Inits
    this.insertScripts();
    this.importTemplates();
    this.buildElements();
  }

  /*
   * Loop through links or bundle, import templates, and cache
   */
  importTemplates() {
    // Are we using bundled partials or not?
    if (!this.hasBundle) {
      for (let i = 0; i < this.links.length; i++) {
        // Grab the link contents and the href for insertion
        let linkNode = this.links.item(i);
        let templateImport = linkNode.import;
        let template = templateImport.querySelector('template');
        let templateID = template.getAttribute('id');

        this.cacheTemplate(templateID, template);
      };
    } else {
      let bundleImport = this.bundle.import;
      let bundleTemplates = bundleImport.getElementsByTagName('template');

      // Loop through template elements in bundle
      for (let i = 0; i < bundleTemplates.length; i++) {
        let template = bundleTemplates.item(i);
        let templateID = template.getAttribute('id');

        this.cacheTemplate(templateID, template);
      }
    }
  }

  /*
   * Add template to the cache
   */
  cacheTemplate(templateID, template) {
    if (!this.templates.hasOwnProperty(templateID)) {
      this.templates[templateID] = template;
    }
  }

  /*
   * Loop through targets and build custom elements
   */
  buildElements() {
    // Loop through html import <link> elements
    for (let templateID in this.templates) {
      this.buildCustomElement(this.templates[templateID], templateID);
    };
  }

  /*
   * Replace all custom elements with the actual template markup,
   * ensuring our prototypes look as close as possible to the final product.
   */
  replaceEls() {
    for (let templateID in this.templates) {
      let tags = document.querySelectorAll(templateID);

      for (let i = 0; i < tags.length; i++) {
        let tag = tags.item(i);

        console.log(tag.children);
        console.log(tag.children.length);

        if (tag.childNodes.length) {
          for (let i = 0; i < tag.childNodes.length; i++) {
            let childEl = tag.childNodes.item(i);
            tag.parentNode.insertBefore(childEl, tag);
          }
        }

        tag.parentNode.removeChild(tag);
      }
    };
  }

  /*
   * Register a new custom element and insert the template markup
   *
   * @param {object} template - a document object from one of our HTML imports
   * @param {string} templateID - name of element to generate
   */
  buildCustomElement(template, templateID) {
    let elProto = Object.create(HTMLElement.prototype),
        protoContext = this;

    elProto.createdCallback = function() {
      this.innerHTML = template.innerHTML;
    }

    document.registerElement(templateID, {prototype: elProto});
  }

  /*
   * Insert script tags into <body> after all elemnts have loaded
   */
  insertScripts() {
    if (document === this.context && 'undefined' !== window.protoScripts && window.protoScripts.length) {
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

// Top level insert
window.addEventListener('WebComponentsReady', () => {
  const initLinks = document.querySelectorAll('link[rel="import"]');
  const insertNodes = new InsertNodes(initLinks, document);
  insertNodes.replaceEls(document);
});
