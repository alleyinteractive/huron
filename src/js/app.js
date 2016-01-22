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

    // Inits
    this.insertScripts();
    this.loopLinks();
  }

  /*
   * Loop through import links, create a custom element for them, and insert import into that element
   */
  loopLinks() {
    let targetList = [];

    // Loop through html import <link> elements
    for (let i = 0; i < this.links.length; i++) {
      // Grab the link contents and the href for insertion
      let linkNode = this.links.item(i),
          template = linkNode.import,
          href = linkNode.attributes.getNamedItem('href'),
          targetID = this.getTargetID(href);

      if (-1 === targetList.indexOf(targetID)) {
        targetList.push(targetID);
        this.buildCustomElement(template, targetID);
      }
    };

    this.replaceEls(targetList);
  }

  /*
   * Replace all custom elements with the actual template markup,
   * ensuring our prototypes look as close as possible to the final product.
   *
   * @param {array} targetList - an array of custom element names
   */
  replaceEls(targetList) {
    targetList.forEach((tagName, idx) => {
      var tags = document.querySelectorAll(tagName);

      for (let i = 0; i < tags.length; i++) {
        var tag = tags.item(i);

        if (tag.children.length) {
          for (let i = 0; i < tag.children.length; i++) {
            var childEl = tag.children.item(i).cloneNode(true);
            tag.parentNode.insertBefore(childEl, tag);
          }
        }

        tag.parentNode.removeChild(tag);
      }
    } );
  }

  /*
   * Register a new custom element and insert the template markup
   *
   * @param {object} template - a document object from one of our HTML imports
   * @param {string} targetID - name of element to generate
   */
  buildCustomElement(template, targetID) {
    let elProto = Object.create(HTMLElement.prototype),
        t = template.getElementById(targetID)

    elProto.createdCallback = function() {
      if ( null !== t ) {
        this.innerHTML = t.innerHTML;
      }
    }

    document.registerElement(targetID, {prototype: elProto});
  }

  /*
   * Generate a custom element name from the <link> href
   *
   * @param {string} href - an href attribute from an html import link
   */
  getTargetID(href) {
    var targetID;

    // Convert href into a class string
    if ('undefined' !== href) {
      targetID = href.nodeValue
        .replace(/^.*[\\\/]/, '')
        .replace('.html', '');

      return targetID;
    }

    return false;
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
  new InsertNodes(initLinks, document);
});
