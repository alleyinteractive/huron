// Accept the huron.js module for Huron development
if (module.hot) {
  module.hot.accept();
}

/* Method for inserting HTML snippets at particular insertion points
 *
 * Uses require() to grab html partials, then inserts that html
 * into an element with an attribute `huron-id` corresponding to the template filename.
 */
class InsertNodes {

  constructor(modules, store) {
    this._modules = modules;
    this._moduleIds = Object.keys(modules);
    this._config = null;
    this._sections = null;
    this._templates = null;
    this._prototypes = null;
    this._types = null;

    // Set store values
    this.store = store;

    // Inits
    this.cycleEls(document);

    // Sections
    const sectionsQuery = document.querySelector('[huron-sections]');
    if (sectionsQuery) {
      sectionsQuery.innerHTML = '';
      this.outputSections(null, sectionsQuery);
      this.cycleEls(document);
    }

    // Menu
    const menuQuery = document.querySelector('[huron-menu]');
    if (menuQuery) {
      menuQuery.innerHTML = '';
      this.outputMenu(null, menuQuery);
    }
  }

  /**
   * Replace all template markers with the actual template markup.
   *
   * @param  {object} context  The context (e.g. document) that you will query
   *                           for the template ID to replace
   * @param  {string} parentId The TemplateID of the tempkate that invoked this function.
   */
  cycleEls(context, parentId = null) {
    // Query any element with huron id
    const huronPartials = context.querySelectorAll('[data-huron-id]');
    const sections = this._sections.sectionsByPath;

    if (null !== huronPartials) {
      for (let i = 0; i < huronPartials.length; i++) {
        const currentTag = huronPartials.item(i);

        // Only replace if the partial does not have children
        if (currentTag.childNodes.length === 0) {
          const meta = this.getMetaFromTag(currentTag);

          if (meta) {
            this.replaceTemplate(meta);
          }
        }
      }
    }
  }

  /**
   * Replace all sections. For hot reloading use when the section template has changed.
   *
   * @param {string} key     Module require path
   * @param {mixed}  module  Module contents
   */
  loadModule(key, module) {
    const meta = this.getMetaFromPath(key);

    if (meta) {
      // Use a special function if we've updated the template used for all sections
      if ('sections-template' !== meta.type) {
        this.replaceTemplate(meta);
      } else {
        this.replaceSections();
      }
    }
  }

  /**
   * Replace all sections. For hot reloading use when the section template has changed.
   */
  replaceSections() {
    const sectionTags = document.querySelectorAll('[data-huron-type="section"]');

    if (sectionTags) {
      for (let i = 0; i < sectionTags.length; i++) {
        const currentSection = sectionTags.item(i);
        const meta = this.getMetaFromTag(currentSection);

        if (meta) {
          this.replaceTemplate(meta);
        }
      }
    }
  }

  /**
   * Hot reload section markup when section data with no corresponding submodule has changed
   * Example: section title, reference URI
   *
   * @param  {string} sectionPath - path to KSS section for accessing section data
   */
  updateChangedSection(sectionPath) {
    const changed = this._sections.sectionsByPath[sectionPath];
    const sectionTemplate = './huron-sections/sections.hbs';

    if (changed) {
      const renderData = this.getModuleRender(
        'section',
        sectionTemplate,
        this._modules[sectionTemplate],
        changed
      );

      this.replaceTemplate(Object.assign({
        id: changed.referenceURI,
        type: 'section',
        key: sectionTemplate,
        module: this._modules[sectionTemplate],
      }, renderData));
    }
  }

  /**
   * Replace a single template marker with template content.
   *
   * @param  {object} meta  Module metadata
   */
  replaceTemplate(meta) {
    let tags = document.querySelectorAll(`[data-huron-id="${meta.id}"][data-huron-type="${meta.type}"]`);

    // Look for implicit type of "template"
    if (!tags || !tags.length) {
      tags = document.querySelectorAll(`[data-huron-id="${meta.id}"]:not([data-huron-type])`);
    }

    if (tags) {
      for (let i = 0; i < tags.length; i++) {
        let currentTag = tags.item(i);
        let modifier = currentTag.dataset.huronModifier;
        let rendered = null;

        if (meta.data) {
          // If we have a modifier, use it, otherwise use the entire data set
          if (modifier && meta.data[modifier]) {
            rendered = meta.render(meta.data[modifier]);
          } else {
            rendered = meta.render(meta.data);
          }
        } else {
          rendered = meta.render();
        }

        currentTag.innerHTML = this.convertToElement(rendered)
          .querySelector('template')
          .innerHTML

        this.cycleEls(currentTag, meta.id);
      }
    }
  }

  /**
   * Get module metadata from an HTMLElement
   *
   * @param  {string} key - Module require path
   *
   * @return {object} - id: huron id (referenceURI)
   *                    type: huron type
   *                    key: module require path (key)
   *                    module: module contents
   */
  getMetaFromTag(tag) {
    const type = this.validateType(tag);
    const id = tag.dataset.huronId;
    const field = `${type}Path`; // Custom field in section data containing require path to partial
    const sections = this._sections.sectionsByURI;
    let key = false;
    let currentSection = false;
    let data = false;

    // Find require path based on huron type
    if ('template' === type || 'description' === type ) {
      if (sections[id] && sections[id].hasOwnProperty(field)) {
        key = sections[id][field];
      } else {
        console.log(`Failed to find template or section '${id}' does not exist`);
      }
    } else if ('prototype' === type) {
      for (let prototype in this._prototypes) {
        if (id === prototype) {
          key = this._prototypes[id];
          break;
        }
      }
    } else if ('section' === type) {
      if (sections[id]) {
        data = sections[id];
        key = `./huron-sections/sections.hbs`;
      } else {
        console.log(`Section '${id}' does not exist`);
      }
    }

    if (key) {
      const module = this._modules[key];
      const renderData = this.getModuleRender(type, key, module, data);

      return Object.assign({id, type, key, module}, renderData);
    }

    console.warn(`Could not find module or this module cannot be hot reloaded
      type: '${type}'
      section: '${id}'
    `);
    return false;
  }

  /**
   * Get module metadata from a module require path
   *
   * @param  {string} key - Module require path
   *
   * @return {object} - id: huron id (referenceURI)
   *                    type: huron type
   *                    key: module require path (key)
   *                    module: module contents
   */
  getMetaFromPath(key) {
    const sections = this._sections.sectionsByPath;
    const templateTypes = this._types.filter((type) => type !== 'prototype');
    let id = false;
    let type = false;

    if (key.indexOf(`./prototypes`) !== -1) {
      const prototype = Object.keys(this._prototypes)
        .filter((name) => this._prototypes[name] === key);

      if (prototype.length) {
        id = prototype;
        type = 'prototype';
      }
    } else if (key.indexOf('sections.hbs') !== -1) {
      id = 'sections-template',
      type = 'sections-template';
    } else {
      for (let section in sections) {
        const testTypes = templateTypes.filter((type) => sections[section][`${type}Path`] === key);

        if (testTypes.length) {
          id = sections[section].referenceURI;
          type = testTypes[0];
        }
      }
    }

    if (id && type) {
      const module = this._modules[key];
      const renderData = this.getModuleRender(type, key, module);

      return Object.assign({id, type, key, module}, renderData);
    }

    console.warn(`Could not find module '${key}' or this module cannot be hot reloaded`);
    return false;
  }

  /**
   * Transform every module into a predictable object
   *
   * @param  {object} type    Module metadata
   * @param  {mixed}  module  Module contents
   * @param  {object} data    Explicit data input
   *
   * @return {object} render: render function
   *                  data: original module contents
   *                  id: id of partial
   */
  getModuleRender(type, key, module, data = false) {
    let render = false;

    if ('template' === type && 'function' === typeof module) {
      // It's a render function for a template
      render = module;
      data = this._modules[this._templates[key]];
    } else if (
      'section' === type &&
      'function' === typeof module
    ) {
      // It's a full KSS section
      // Data is passed in from cycleEls
      render = module;
    } else if (
      ('template' === type || 'description' === type || 'prototype' === type) &&
      'string' === typeof module
    ) {
      // it's straight HTML
      render = () => module;
    } else if ('data' === type && 'object' === typeof module) {
      // It's a data file (.json)
      render = this._modules[this._templates[key]];
      data = module;
    }

    // Only need render, as data will be left empty for static HTML
    if (render) {
      return {render, data};
    }

    return false;
  }

  /**
   * Verify specified element is using an acceptable huron type
   *
   * @param  {HTMLElement} element - Html element to check huron type
   *
   * @return {string} - huron type or 'template' if invalid
   */
  validateType(element) {
    const type = element.dataset.huronType;

    if (!this._types.includes(type)) {
      return 'template';
    }

    return type;
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

  /* Helper function for inserting styleguide sections.
   *
   * Recurses over sorted styleguide sections and inserts a <section> tag with
   * [huron-id] equal to the section template name.
   *
   * @todo: figure out how to handle added/removed sections with HMR
   */
  outputSections(parent, el, sections = this._sections.sorted) {
    let templateId = null;
    let wrapper = null;

    for (let section in sections) {
      if (parent) {
        templateId = `${parent}-${section}`;
      } else {
        templateId = section;
      }

      if (el) {
        wrapper = document.createElement('div');
        wrapper.dataset.huronId = templateId;
        wrapper.dataset.huronType = 'section';
        el.appendChild(wrapper);
      }

      if (Object.keys(sections[section]).length && wrapper) {
        this.outputSections(
          templateId,
          wrapper,
          sections[section]
        );
      }
    }
  }

  /* Helper function for inserting styleguide sections.
   *
   * Recurses over sorted styleguide sections and inserts a <section> tag with
   * [huron-id] equal to the section template name.
   *
   * @todo: figure out how to handle added/removed sections with HMR
   */
  outputMenu(parent, el, sections = this._sections.sorted) {
    let templateId = null;
    let wrapper = null;

    for (let section in sections) {
      if (parent) {
        templateId = `${parent}-${section}`;
      } else {
        templateId = section;
      }

      if (el) {
        wrapper = document.createElement('ul');
        wrapper.classList.add('sections-menu');
        wrapper.innerHTML = `<li class="menu-item"><a href="#${templateId}">${templateId}</a></li>`;
        el.appendChild(wrapper);
      }

      if (sections[section] && wrapper) {
        this.outputMenu(
          templateId,
          wrapper,
          sections[section]
        );
      }
    }
  }

  /*
   * Set new modules object
   */
  set modules(modules) {
    this._modules = modules;
    this._moduleIds = Object.keys(modules);
  }

  /*
   * Set store
   */
  set store(store) {
    this._store = store;
    this._config = store.config;
    this._sections = store.sections;
    this._templates = store.templates;
    this._prototypes = store.prototypes;
    this._types = store.types;
  }
}

// Create a new instance of the InsertNodes class
/*eslint-disable*/
// Create object for modifiying the templates on the page and
// initial first templates.
const insert = new InsertNodes(modules, store);
/*eslint-enable*/
