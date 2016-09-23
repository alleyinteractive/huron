// Accept the huron.js module for Huron development
if (module.hot) {
  module.hot.accept();
}

import { templates, modules, addCallback, templateCallback } from './huron-requires';
const sections = require('./huron-sections.json');

/* Method for inserting HTML snippets at particular insertion points
 *
 * Uses require() to grab html partials, then inserts that html
 * into an element with an attribute `huron-id` corresponding to the template filename.
 */
class InsertNodes {

  constructor(modules, templates) {
    this._modules = modules;
    this._templates = templates;
    this._moduleIds = Object.keys(modules);

    // Inits
    this.cycleEls(document);
  }

  /**
   * Replace all template markers with the actual template markup.
   *
   * @param  {object} context  The context (e.g. document) that you will query
   *                           for the template ID to replace
   * @param  {string} parentId The TemplateID of the tempkate that invoked this function.
   */
  cycleEls(context, parentId = null) {
    for (let section in this._templates) {
      // If key isn't a file path
      if (section !== null && section.indexOf('.') === -1) {
        // Check if there's at least one instance of a template in this context
        const templateMarker = context.querySelector(`[data-huron-id=${section}]`);
        const sectionComponents = this._templates[section];

        if (sectionComponents.template) {
          const module = this._modules[sectionComponents.template];

          if (templateMarker !== null && templateMarker.childNodes.length === 0) {
            this.cycleEl(sectionComponents.template, module, context, parentId);
          }
        }
      }
    }
  }

  /**
   * Get markup from any type of module (html, json or template)
   *
   * @param  {mixed} module
   */
  parseMarkup(module, key) {
    let render = false;
    let id = false;
    let data = false;

    if ('function' === typeof module) {
      // It's a render function for a template
      render = module;
      data = modules[this._templates[key]];
    } else if ('string' === typeof module) {
      // it's straight HTML
      render = () => module;
    } else {
      // It's a data file (.json)
      render = modules[this._templates[key]];
      data = module;
    }

    // Get ID from markup
    // @todo make this accessible via templates object
    let moduleContents = this.convertToElement(render());
    let wrapper = moduleContents.querySelector('template');
    id = wrapper.id;

    if (id) {
      return {render, data, id};
    }

    return false;
  }

  /**
   * Get markup from any type of module (html, json or template)
   *
   * @param {string} content String corresponding to markup
   */
  convertToElement(content) {
    let el = document.createElement('div');
    el.innerHTML = content;
    return el.firstElementChild;
  }

  /**
   * Replace a single template marker with template content.
   * This is called by HMR when modules are edited.
   *
   * @param  {string} key      Key of module in modules object
   * @param  {object} template The contents of the template file.
   * @param  {object} context  The context (e.g. document) that you will
   *                           query for the template ID to replace.
   */
  cycleEl(key, module, context, parentId) {
    // If there is a templateId, use it to query for all the
    // matching tags within the context and replace them with the right
    // templateContents.
    const moduleContents = this.parseMarkup(module, key);

    if (moduleContents) {
      const tags = context.querySelectorAll(`[data-huron-id=${moduleContents.id}`);

      // Cycle through results and replace them.
      for (let i = 0; i < tags.length; i++) {
        let tag = tags.item(i);
        let modifier = tag.dataset.huronModifier;
        let rendered = null;

        if (modifier && moduleContents.data) {
          rendered = moduleContents.render(moduleContents.data[modifier]);
        } else {
          rendered = moduleContents.render();
        }

        tag.innerHTML = this.convertToElement(rendered)
          .querySelector('template')
          .innerHTML

        this.cycleEls(tag, moduleContents.id);
      }
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
        .querySelector(`[data-huron-id=${templateId}`);

      if (subTemplate !== null) {
        return true;
      }
    }

    return false;
  }

  /*
   * Set new modules object
   */
  set modules(modules) {
    this._modules = modules;
    this._moduleIds = Object.keys(modules);
  }

  set templates(templates) {
    this._templates = templates;
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
      wrapper.dataset.huronId = templateString;
      el.appendChild(wrapper);
    }

    if (sections[section] && wrapper) {
      outputSections(
        sections[section],
        templateId,
        document.querySelector(`[data-huron-id=${templateString}]`)
      );
    }
  }
}

// Create a new instance of the InsertNodes class
/*eslint-disable*/
// Create object for modifiying the templates on the page and
// initial first templates.
const insert = new InsertNodes(modules, templates);
const sectionsQuery = document.querySelector('[huron-sections]');

if (sectionsQuery) {
  outputSections(sections.sorted, null, sectionsQuery);
  insert.cycleEls(document);
}

// Cycle elements when a template is changed
addCallback((key, module, modules, templates) => {
  console.log('add callback template', module);
  insert.modules = modules;
  insert.templates = templates;
  insert.cycleEl(key, module, document);
});
/*eslint-enable*/
