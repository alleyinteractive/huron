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
    this.templates = {};
    this.bundle = this.context.getElementById('huron-bundle');
    this.hasBundle = null !== this.bundle && 'LINK' === this.bundle.tagName;

    // Inits
    this.insertScripts();
    this.importTemplates();
    this.buildElements();
  }

  /*
   * Loop through links or bundle, import templates, and cache
   */

  _createClass(InsertNodes, [{
    key: 'importTemplates',
    value: function importTemplates() {
      // Are we using bundled partials or not?
      if (!this.hasBundle) {
        for (var i = 0; i < this.links.length; i++) {
          // Grab the link contents and the href for insertion
          var linkNode = this.links.item(i);
          var templateImport = linkNode.import;
          var template = templateImport.querySelector('template');
          var templateID = template.getAttribute('id');

          this.cacheTemplate(templateID, template);
        };
      } else {
        var bundleImport = this.bundle.import;
        var bundleTemplates = bundleImport.getElementsByTagName('template');

        // Loop through template elements in bundle
        for (var i = 0; i < bundleTemplates.length; i++) {
          var template = bundleTemplates.item(i);
          var templateID = template.getAttribute('id');

          this.cacheTemplate(templateID, template);
        }
      }
    }

    /*
     * Add template to the cache
     */

  }, {
    key: 'cacheTemplate',
    value: function cacheTemplate(templateID, template) {
      if (!this.templates.hasOwnProperty(templateID)) {
        this.templates[templateID] = template;
      }
    }

    /*
     * Loop through targets and build custom elements
     */

  }, {
    key: 'buildElements',
    value: function buildElements() {
      // Loop through html import <link> elements
      for (var templateID in this.templates) {
        this.buildCustomElement(this.templates[templateID], templateID);
      };
    }

    /*
     * Replace all custom elements with the actual template markup,
     * ensuring our prototypes look as close as possible to the final product.
     */

  }, {
    key: 'replaceEls',
    value: function replaceEls() {
      for (var templateID in this.templates) {
        var tags = document.querySelectorAll(templateID);

        for (var i = 0; i < tags.length; i++) {
          var tag = tags.item(i);

          console.log(tag.children);
          console.log(tag.children.length);

          if (tag.childNodes.length) {
            for (var _i = 0; _i < tag.childNodes.length; _i++) {
              var childEl = tag.childNodes.item(_i);
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

  }, {
    key: 'buildCustomElement',
    value: function buildCustomElement(template, templateID) {
      var elProto = Object.create(HTMLElement.prototype),
          protoContext = this;

      elProto.createdCallback = function () {
        this.innerHTML = template.innerHTML;
      };

      document.registerElement(templateID, { prototype: elProto });
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