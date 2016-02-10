'use strict';

/* Method for inserting nodes via html import
 *
 * Uses webcomponents import() method to grab html, then inserts that html
 * into a custom element. That element is then replaced with the element's template contents
 * in order to keep prototype markup as close to WordPress markup as possible.
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var InsertNodes = function () {
  function InsertNodes(links, context) {
    _classCallCheck(this, InsertNodes);

    this.links = links;
    this.context = context;
    this.targetList = [];

    // Inits
    this.insertScripts();
    this.loopLinks();
  }

  /*
   * Loop through import links, create a custom element for them, and insert import into that element
   */

  _createClass(InsertNodes, [{
    key: 'loopLinks',
    value: function loopLinks() {
      // Loop through html import <link> elements
      for (var i = 0; i < this.links.length; i++) {
        // Grab the link contents and the href for insertion
        var linkNode = this.links.item(i),
            template = linkNode.import,
            href = linkNode.attributes.getNamedItem('href'),
            targetID = this.getTargetID(href);

        if (-1 === this.targetList.indexOf(targetID)) {
          this.targetList.push(targetID);
          this.buildCustomElement(template, targetID);
        }
      };
    }

    /*
     * Replace all custom elements with the actual template markup,
     * ensuring our prototypes look as close as possible to the final product.
     *
     * @param {obj} context - node object
     */

  }, {
    key: 'replaceEls',
    value: function replaceEls(context) {
      this.targetList.forEach(function (tagName, idx) {
        var tags = context.querySelectorAll(tagName);

        for (var i = 0; i < tags.length; i++) {
          var tag = tags.item(i);

          if (tag.children.length) {
            for (var _i = 0; _i < tag.children.length; _i++) {
              var childEl = tag.children.item(_i).cloneNode(true);
              tag.parentNode.insertBefore(childEl, tag);
            }
          }

          tag.parentNode.removeChild(tag);
        }
      });
    }

    /*
     * Register a new custom element and insert the template markup
     *
     * @param {object} template - a document object from one of our HTML imports
     * @param {string} targetID - name of element to generate
     */

  }, {
    key: 'buildCustomElement',
    value: function buildCustomElement(template, targetID) {
      var elProto = Object.create(HTMLElement.prototype),
          t = template.getElementById(targetID),
          protoContext = this;

      elProto.createdCallback = function () {
        if (null !== t) {
          this.innerHTML = t.innerHTML;
        }
      };

      document.registerElement(targetID, { prototype: elProto });
    }

    /*
     * Generate a custom element name from the <link> href
     *
     * @param {string} href - an href attribute from an html import link
     */

  }, {
    key: 'getTargetID',
    value: function getTargetID(href) {
      var targetID;

      // Convert href into a class string
      if ('undefined' !== href) {
        targetID = href.nodeValue.replace(/^.*[\\\/]/, '').replace('.html', '');

        return targetID;
      }

      return false;
    }

    /*
     * Insert script tags into <body> after all elemnts have loaded
     */

  }, {
    key: 'insertScripts',
    value: function insertScripts() {
      if (document === this.context && 'undefined' !== window.protoScripts && window.protoScripts.length) {
        var scriptArray = protoScripts,
            bodyNodes = document.body.children;

        scriptArray.forEach(function (value) {
          var scriptTag = document.createElement('script');

          scriptTag.type = 'text/javascript';
          scriptTag.src = value;

          document.body.insertBefore(scriptTag, bodyNodes[bodyNodes.length - 1]);
        });
      }
    }
  }]);

  return InsertNodes;
}();

// Top level insert

window.addEventListener('WebComponentsReady', function () {
  var initLinks = document.querySelectorAll('link[rel="import"]');
  var insertNodes = new InsertNodes(initLinks, document);
  insertNodes.replaceEls(document);
});