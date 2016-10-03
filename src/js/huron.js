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
          const meta = getMetaFromTag(tag);
          if (meta) {
            this.replaceTemplate(meta);
          } else {
            console.warn(`Could not find module ${key} or this module cannot be hot reloaded`);
          }
        }
      }
    }
  }

  loadModule(key) {
    const meta = this.getMetaFromPath(key);
    if (meta) {
      // Use a special function if we've updated the template used for all sections
      if ('sections-template' !== meta.type) {
        this.replaceTemplate(meta);
      } else {
        this.replaceSections();
      }
    } else {
      console.warn(`Could not find module ${key} or this module cannot be hot reloaded`);
    }
  }

  replaceSections() {
    const sectionTags = document.querySelectorAll('[data-huron-type="section"]');

    if (sectionTags) {
      for (let i = 0; i < sectionTags.length; i++) {
        const currentSection = sectionTags.item(i);
        const meta = getMetaFromTag(currentSection);

        if (meta) {
          this.replaceTemplate(meta);
        } else {
          console.warn(`Could not find module ${key} or this module cannot be hot reloaded`);
        }
      }
    }
  }

  updateChangedSection(sectionPath) {
    const changed = this._sections.sectionsByPath[sectionPath];
    const sectionTemplate = './huron-sections/sections.hbs';

    if (changed) {
      const renderData = getModuleRender(sectionTemplate, this._modules[sectionTemplate], changed);
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
    const tags = document.querySelectorAll(`[data-huron-id="${meta.id}"][data-huron-type="${meta.type}"]`);

    if (tags) {
      for (let i = 0; i < tags.length; i++) {
        let modifier = tag.dataset.huronModifier;
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

        tag.innerHTML = this.convertToElement(rendered)
          .querySelector('template')
          .innerHTML

        this.cycleEls(tag, meta.id);
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
    let key = false;
    let currentSection = false;
    let data = false;

    // Find require path based on huron type
    if ('template' === type || 'description' === type ) {
      for (let section in sections) {
        if (id === sections[section].referenceURI) {
          key = sections[section][field];
          break;
        }
      }
    } else if ('prototype' === type) {
      for (let prototype in this._prototypes) {
        if (id === prototype) {
          key = this._prototypes[id];
          break;
        }
      }
    } else if ('section' === type) {
      for (let section in sections) {
        if (id === sections[section].referenceURI) {
          data = sections[section];
          break;
        }
      }

      key = `./huron-sections/sections.hbs`;
    }

    if (key) {
      const module = this._modules[key];
      const renderData = this.getModuleRender(type, module, data);

      return Object.assign({id, type, key, module}, renderData);
    }

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
    const id = false;
    const type = false;

    if (path.indexOf(`${this._config.output}/prototypes`) !== -1) {
      const prototype = Object.keys(this._prototypes)
        .filter((key) => this._prototypes[key] === path);

      if (prototype.length) {
        id = prototype;
        type = 'prototype';
      }
    } else if (path.indexOf('sections.hbs') !== -1) {
      id = 'sections-template',
      type = 'sections-template';
    } else {
      for (let section in sections) {
        const testTypes = templateTypes.filter((type) => sections[section][`${type}Path`] === path);

        if (testTypes.length) {
          id = sections[section].referenceURI;
          type = testTypes[0];
        }
      }
    }

    if ( id && type ) {
      const module = this._modules[key];
      const renderData = this.getModuleRender(type, module);

      return Object.assign({id, type, key, module}, renderData);
    }

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
  getModuleRender(type, module, data = false) {
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
   * @todo: incorporate this function into the InsertNodes class
   */
  outputSections(sections, parent, el) {
    const sectionsQuery = document.querySelector('[huron-sections]');
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

  /* Helper function for inserting styleguide sections.
   *
   * Recurses over sorted styleguide sections and inserts a <section> tag with
   * [huron-id] equal to the section template name.
   *
   * @todo: figure out how to handle added/removed sections with HMR
   * @todo: incorporate this function into the InsertNodes class
   */
  outputMenu(sections, parent, el) {
    const menuQuery = document.querySelector('[huron-menu]');
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

if (sectionsQuery) {
  outputSections(sections.sorted, null, sectionsQuery);
  insert.cycleEls(document);
}
/*eslint-enable*/
