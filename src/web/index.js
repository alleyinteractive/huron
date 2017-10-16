import { compose, isEqual } from 'lodash/fp';

/* eslint-disable no-underscore-dangle */
// Accept the huron.js module for Huron development
if (module.hot) {
  module.hot.accept();
}

/** Class for inserting HTML snippets at particular insertion points.
 * Uses require() to grab html partials, then inserts that html
 * into an element with attribute [huron-id] corresponding to the reference URI of the target KSS section,
 * and [huron-type] corresponding with the required KSS field
 */
export default class InsertNodes {

  constructor(modules, store) {
    /** webpack module list in which keys are relative require paths and values are the module contents */
    this._modules = modules;
    /** array of module keys */
    this._moduleIds = Object.keys(modules);
    /** reference to the huron config */
    this._config = null;
    /** KSS sections organized in various formats including by reference URI, by module key, and modules sorted by parent/child */
    this._sections = null;
    /** Key/value pairs of partner data and template files */
    this._templates = null;
    /** array of prototypes */
    this._prototypes = null;
    /** array of valid huron placeholder types */
    this._types = null;
    /** array of CSS modules classnames */
    this._classNames = null;

    /** Cache for module metadata */
    this.meta = {};

    /** Reference to entire memory store */
    this.store = store;

    // Inits
    this.cycleModules();
    this.cycleStyleguide();
  }

  /**
   * Apply a modifier if one exists
   *
   * @param {object} data - data with which to render template
   * @param {string} modifier - target modifier
   *
   * @return {string} data - subset of data object for supplied modifier
   */
  static applyModifier(data, modifier) {
    // If we have a modifier, use it, otherwise use the entire data set
    if (modifier && data && data[modifier]) {
      return Object.assign({}, data[modifier], { modifier });
    }

    return data;
  }

  /**
   * Get markup from any type of module (html, json or template)
   *
   * @param {string} content - String corresponding to markup
   * @return {object} el.firstElementChild - HTML module
   */
  static convertToElement(content) {
    const el = document.createElement('div');

    el.innerHTML = content;
    return el.firstElementChild;
  }

  /**
   * Filter module object by module key or module type
   *
   * @param {object} filter - Filter for modules. Options:
   * @param {string} filter.property - Which property to filter ('key' or 'type')
   * @param {array} filter.values - Values for property
   * @param {bool} filter.include - Whether the values should be included or excluded (true = include, false = exclude)
   * @param {object} moduleMeta - Filter for modules. Fields explained in the filterModules() function docs
   * @return {bool} match - determine if modules need to be filtered
   */
  static filterModules(filter, moduleMeta) {
    let match = true;

    // Check if we should filter out any modules
    if (
      'object' === typeof filter &&
      {}.hasOwnProperty.call(filter, 'property') &&
      {}.hasOwnProperty.call(filter, 'values') &&
      {}.hasOwnProperty.call(filter, 'include')
    ) {
      match = filter.values.filter(
        (value) => moduleMeta[filter.property] === value
      );
      return Boolean(match.length) === filter.include;
    }

    console.log(` // eslint-disable-line no-console
      filter ${filter} is not in a valid format.
      module filters must include 'property', 'values', and 'include' properties
    `);

    return match;
  }

  /**
   * Retrieve a data attribute from a tag using one of two methods
   *
   * @param {HTMLElement} tag - DOM node on which to check for a data attribute
   * @param {string} attr - attribute to check for
   * @returns {string} data - contents of data attribute
   */
  static getDataAttribute(tag, attr) {
    let data = false;

    // Check if element has dataset and, if so, use it
    if (tag.dataset) {
      data = tag.dataset[attr];
    }

    // Fallback to getAttribute for ugly old Safari
    if (!data && tag.getAttribute) {
      data = tag.getAttribute(`data-${attr}`);
    }

    return data;
  }

  /**
   * Check if this tag is a styleguide helper
   *
   * @param {object} tag - tag to check
   * @param {object} meta - module metadata
   * @return {bool}
   */
  static isSectionHelper(tag, meta) {
    if ('prototype' === meta.type) {
      return tag.hasAttribute('huron-sections') ||
        tag.hasAttribute('huron-menu');
    }

    return false;
  }

  /**
   * Replace all template markers with the actual template markup.
   *
   * @param {string} context - The within which to replace markup
   * @param {object} filter - Filter for modules. Fields explained in the filterModules() function docs
   */
  cycleModules(context = false, filter = false) {
    let moduleList = {};
    let elementList = context;

    // We're replacing top-level elements
    if (!elementList) {
      this.regenCache();

      // Find all top-level huron placeholders
      elementList = [...document.querySelectorAll(
        '[data-huron-id][data-huron-type]'
      )];
    }

    moduleList = this.getModuleListFromTags(elementList);

    // Loop through modules array
    Object.keys(moduleList).forEach((key) => {
      const module = this._modules[key];
      const replaceElements = moduleList[key];

      this.loadModule(key, module, replaceElements, true, filter);
    });
  }

  /**
   * Helper for reloading sections only
   */
  cycleSections() {
    this.cycleModules(false, {
      property: 'type',
      values: ['section'],
      include: true,
    });
  }

  /**
   * Reload styleguide sections and menu helpers
   */
  cycleStyleguide() {
    const sectionsQuery = document.querySelector('[huron-sections]');
    const menuQuery = document.querySelector('[huron-menu]');

    // Sections
    if (sectionsQuery) {
      sectionsQuery.innerHTML = '';
      this.outputSections(null, sectionsQuery);
      this.cycleSections();
    }

    // Menu
    if (menuQuery) {
      menuQuery.innerHTML = '';

      if (null === document.querySelector('.section-menu__expand')) {
        const menuTrigger = document.createElement('button');

        menuTrigger.classList.add('section-menu__expand');
        menuTrigger.innerHTML = 'Sections Menu';
        document.body.insertBefore(
          menuQuery.appendChild(menuTrigger),
          document.body.childNodes[0]
        );

        // Add menu trigger handler
        menuTrigger.addEventListener('click', () => {
          document.body.classList.toggle('section-menu-open');
        });
      }

      // Create menu
      this.outputMenu(null, menuQuery);
    }
  }

  /**
   * Generate a unique key for targeting markup replacement
   *
   * @param {string} key - module key (webpack require path) to convert into a replacement key
   * @return {string} key - generated replacement key
   */
  generateModuleReplaceKey(key) {
    let currentKey = key;

    // If this is section data, use the section template path
    if (key.includes('-section.json')) {
      currentKey = this._sectionTemplatePath;
    // If updated module is a json file, use template key instead
    } else if (key.includes('.json')) {
      currentKey = this._templates[key];
    }

    return `_${currentKey.replace(/[/.]/g, '_')}`;
  }

  /**
   * Get module metadata from a module require path
   *
   * @param  {string} key - Module require path
   * @return {object} containing module id, module type, key and the module contents
   */
  getMetaFromPath(key, module) {
    const sections = this._sections.sectionsByPath;
    const templateTypes = this._types.filter((type) => 'prototype' !== type);
    let id = false;
    let type = false;

    /* eslint-disable space-unary-ops */
    if (-1 !== key.indexOf('./prototypes')) {
    /* eslint-enable space-unary-ops */
      const prototype = Object.keys(this._prototypes)
        .filter((name) => this._prototypes[name] === key);

      if (prototype.length) {
        id = prototype[0];
        type = 'prototype';
      }
    } else if (key === this._sectionTemplatePath) {
      id = 'sections-template';
      type = 'sections-template';
    } else {
      let testTypes = [];
      const testSections = Object.keys(sections).filter((section) => {
        const tempTypes = templateTypes.filter(
          (currentType) => sections[section][`${currentType}Path`] === key
        );

        if (tempTypes.length) {
          testTypes = tempTypes;
          return true;
        }

        return false;
      });

      if (
        testSections &&
        testSections.length &&
        testTypes &&
        testTypes.length
      ) {
        id = sections[testSections[0]].referenceURI;
        type = testTypes[0];
      }
    }

    if (id && type) {
      const renderData = this.getModuleRender(type, key, module);
      const replaceKey = this.generateModuleReplaceKey(key);

      if (renderData) {
        return Object.assign({ id, type, key, replaceKey, module }, renderData);
      }
    }

    console.warn( // eslint-disable-line no-console
      `Module '${key}' does not exist on the page
      or is no longer in use`
    );
    return false;
  }

  /**
   * Check if a tag is a huron placeholder and, if so,
   * return its associated module key
   *
   * @param {object} tag - tag to check
   * @return {bool} associated module key
   */
  getModuleKeyFromTag(tag) {
    // Safari/webkit has some trouble parsing dataset in certain cases.
    // This is a fallback method of accessing the same data.
    const type = InsertNodes.getDataAttribute(tag, 'huron-type');
    const id = InsertNodes.getDataAttribute(tag, 'huron-id');
    const section = this._sections.sectionsByURI[id];

    if (id && type) {
      if (section) {
        return section[`${type}Path`];
      } else if ('prototype' === type) {
        return this._prototypes[id];
      }
    }

    return false;
  }

  /**
   * Check if an array of elements contains a Huron placeholder
   *
   * @param {array} tags - array of DOM nodes
   * @param {bool} recurse - should we recurse this function with a new array
   * @return {object} moduleList - Huron placeholder DOM node
   */
  getModuleListFromTags(elements, recurse = true) {
    const moduleList = {};
    let newList = {};

    if (elements && elements.length) {
      elements.forEach((element) => {
        const moduleKey = this.getModuleKeyFromTag(element);

        if (moduleKey) {
          if (!moduleList[moduleKey]) {
            moduleList[moduleKey] = [];
          }
          moduleList[moduleKey].push(element);
        } else if (recurse) {
          newList = this.getModuleListFromTags(
            [...element.querySelectorAll('[data-huron-id][data-huron-type]')],
            false
          );

          Object.keys(newList).forEach((key) => {
            moduleList[key] = moduleList[key] ?
              moduleList[key].concat(newList[key]) :
              newList[key];
          });
        }
      });
    }

    return moduleList;
  }

  /**
   * Transform every module into a predictable object
   *
   * @param {object} type - Module metadata
   * @param {mixed} module - Module contents
   * @return {object} containing render function, render data and module id
   */
  getModuleRender(type, key, module) {
    let render = false;
    let data = false;

    if ('template' === type && 'function' === typeof module) {
      // It's a render function for a template
      render = module;
      data = this._modules[this._templates[key]];
    } else if (
      'sections-template' === type &&
      'function' === typeof module
    ) {
      // It's a kss section template
      render = module;
    } else if (
      'section' === type &&
      'object' === typeof module
    ) {
      // It's section data
      render = this._modules[this._sectionTemplatePath];
      data = module;
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
      return { render, data };
    }

    return false;
  }

  /**
   * Replace all sections. For hot reloading use when the section template has changed.
   *
   * @param {object} replaceElements - The context (e.g. document) that you will query for the template ID to replace
   * @param {string} key - Module require path
   * @param {mixed} module - Module contents
   * @param {bool} cached - Whether or not to use cached values for module replacement
   * @param {object} filter - Filter for modules. Fields explained in the filterModules() function docs
   */
  loadModule(key, module, replaceElements, cached = false, filter = false) {
    let shouldLoad = true;
    let moduleMeta = false;

    // Check if we should load from internal module metadata cache
    if (cached) {
      moduleMeta = this.meta[key];
    } else {
      moduleMeta = this.meta[key] = this.getMetaFromPath(key, module);
    }

    if (moduleMeta) {
      if (filter) {
        shouldLoad = InsertNodes.filterModules(filter, moduleMeta);
      }

      if (shouldLoad) {
        this.replaceTemplate(moduleMeta, replaceElements);
      }
    }
  }

  /*
   * Helper function for inserting styleguide sections.
   *
   * Recurses over sorted styleguide sections and inserts a <ul> to be used as a menu for each section
   */
  outputMenu(parent, el, sections = this._sections.sorted) {
    let templateId = null;
    let newEl = el;

    Object.keys(sections).forEach((section) => {
      const hasSubmenu = Object.keys(sections[section]).length;
      let menuTarget;
      let nextMenu;

      if (parent) {
        templateId = `${parent}-${section}`;
      } else {
        templateId = section;
      }

      if (newEl) {
        const title = this._sections
            .sectionsByURI[templateId] ?
          this._sections
            .sectionsByURI[templateId]
            .header :
          templateId;
        const sectionMenu = document.createElement('ul');
        const menuItem = document.createElement('li');
        const link = `<a href="#styleguide-section-${templateId}">${title}</a>`;

        sectionMenu.classList.add('section-menu');
        menuItem.classList.add('section-menu__item');
        menuItem.innerHTML = link;

        // Check if this is a UL and, if not, create one
        if ('UL' !== newEl.tagName) {
          menuTarget = sectionMenu.cloneNode();
          newEl.appendChild(menuTarget);
          newEl = menuTarget;
        }

        // Has subsections
        if (hasSubmenu) {
          nextMenu = sectionMenu.cloneNode();
          nextMenu.classList.add('section-menu--submenu');
          menuItem.classList.add('section-menu__item--has-submenu');
          menuItem.appendChild(nextMenu);
        }

        newEl.appendChild(menuItem);

        if (hasSubmenu) {
          this.outputMenu(
            templateId,
            nextMenu,
            sections[section]
          );
        }
      }
    });
  }

  /**
   * Helper function for inserting styleguide sections.
   *
   * Recurses over sorted styleguide sections and inserts a <section> tag with [huron-id] equal to the section template name.
   */
  outputSections(parent, el, sections = this._sections.sorted) {
    let templateId = null;
    let placeholder = null;

    Object.keys(sections).forEach((section) => {
      let istopLevel = false;
      let topLevelWrapper = null;
      let topLevelSection = null;
      let insertionEl = el;

      // Generate section ID and check if it is top-level
      if (parent) {
        templateId = `${parent}-${section}`;
      } else {
        templateId = section;
        istopLevel = true;
      }

      if (el) {
        // Generate huron placeholder for this section
        placeholder = document.createElement('div');
        placeholder.dataset.huronId = templateId;
        placeholder.dataset.huronType = 'section';

        if (istopLevel) {
          // Generate wrapper to contain top-level section and all subsections underneath it
          topLevelWrapper = document.createElement('div');
          topLevelWrapper.classList.add('section--top-level__wrapper');

          // Generate wrapper for top-level section
          topLevelSection = document.createElement('div');
          topLevelSection.classList.add('section', 'section--top-level');

          // Append wrappers to huron-sections element
          topLevelSection.appendChild(placeholder);
          topLevelWrapper.appendChild(topLevelSection);
          el.appendChild(topLevelWrapper);
          insertionEl = topLevelWrapper;
        } else {
          // If this is not top-level, append placeholder
          el.appendChild(placeholder);
        }
      }

      // Recursively call this function to insert other sections
      if (Object.keys(sections[section]).length && placeholder) {
        this.outputSections(
          templateId,
          insertionEl,
          sections[section]
        );
      }
    });
  }

  /**
   * Apply a modifier and merge classnames into template data, if it exists
   *
   * @param {object} data - data with which to render template
   * @param {string} modifier - target modifier
   *
   * @return {string} rendered - the modified HTML module
   */
  provideClassnames(data) {
    if (this._classNames) {
      return Object.assign({}, data, { classNames: this._classNames });
    }

    return data;
  }

  /**
   * Regenerate module meta cache
   */
  regenCache() {
    Object.keys(this._modules).forEach((moduleKey) => {
      this.meta[moduleKey] = this.getMetaFromPath(
        moduleKey, this._modules[moduleKey]
      );
    });
  }

  /**
   * Recursively remove old tags
   *
   * @param {string} replaceKey - key of module for which we need to remove old tags
   * @param {object} tag - tag to start our search with
   *                       (usually the tag immediately preceding the current placeholder)
   */
  removeOldTags(replaceKey, tag) {
    if (tag) {
      const parentModule = InsertNodes.getDataAttribute(tag, 'parent-module');
      const selfModule = InsertNodes.getDataAttribute(tag, 'self-module');

      if (parentModule === replaceKey && selfModule !== replaceKey) {
        // This is a child of the current module,
        // so remove it and its children (if applicable)
        const childrenModule = selfModule;
        let nextTag = tag.previousSibling;

        if (childrenModule) {
          this.removeOldTags(childrenModule, nextTag);
          // Reset nextTag if we removed a child
          nextTag = tag.previousSibling;
        }

        tag.parentNode.removeChild(tag);
        this.removeOldTags(replaceKey, nextTag);
      }
    }
  }

  /**
   * Replace a single template marker with template content.
   *
   * @param {object} replaceElements - Array of elements to check for Huron placeholders
   * @param {object} meta - Module metadata
   */
  replaceTemplate(meta, replaceElements) {
    const type = this.validateType(meta.type);
    const tags = [];
    let replace = replaceElements;
    let hasStyleguideHelpers = false;

    if (!replace) {
      replace = document.querySelectorAll(
        '[data-huron-id][data-huron-type]'
      );
    }

    if (type) {
      replace.forEach((tag) => {
        const tagType = InsertNodes.getDataAttribute(tag, 'huron-type');
        const tagId = InsertNodes.getDataAttribute(tag, 'huron-id');

        if (tagId === meta.id && tagType === type) {
          tags.push(tag);
        }
      });

      if (tags && tags.length && meta.render) {
        tags.forEach((currentTag) => {
          const modifiedPlaceholder = currentTag;
          const modifier = InsertNodes
            .getDataAttribute(modifiedPlaceholder, 'huron-modifier');
          const parent = modifiedPlaceholder.parentNode;
          const data = compose(
            this.provideClassnames.bind(this),
            InsertNodes.applyModifier
          )(meta.data, modifier);
          const rendered = meta.render(data);
          const renderedTemplate = InsertNodes.convertToElement(rendered)
              .querySelector('template');
          let renderedContents = null;

          // Remove existing module tags
          this.removeOldTags(
            meta.replaceKey,
            modifiedPlaceholder.previousSibling
          );

          // Get the contents of the rendered template
          renderedContents = [
            ...renderedTemplate.content.children,
          ];

          // Insert each tag of the template contents before placeholder
          renderedContents.forEach((element) => {
            const newEl = element;

            if (1 === newEl.nodeType) {
              newEl.dataset.parentModule = meta.replaceKey;
              hasStyleguideHelpers = !hasStyleguideHelpers ?
                InsertNodes.isSectionHelper(newEl, meta) :
                hasStyleguideHelpers;

              parent.insertBefore(newEl, modifiedPlaceholder);
            }
          });

          // Add module replacement key to this placeholder
          modifiedPlaceholder.dataset.selfModule = meta.replaceKey;

          // Hide the placeholder
          modifiedPlaceholder.style.display = 'none';

          // Recursively load modules, excluding the current one
          this.cycleModules(renderedContents, {
            property: 'key',
            values: [meta.key, this._sectionTemplatePath],
            include: false,
          });

          if (hasStyleguideHelpers) {
            this.cycleStyleguide();
          }
        });
      }
    } else {
      console.warn( // eslint-disable-line no-console
        `Could not render module
        section: ${meta.id}
        type: ${meta.type}`
      );
    }
  }

  /**
   * Verify specified element is using an acceptable huron type
   *
   * @param  {string} type - type of partial (template, data, description, section or prototype )
   * @return {string} type - huron type or 'template' if invalid
   */
  validateType(type) {
    if ('data' === type) {
      return 'template';
    }

    if (!this._types.includes(type)) {
      return false;
    }

    return type;
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
    this._sectionTemplatePath = store.sectionTemplatePath;

    // Completely rerender prototype if any CSS modules classnames change
    if (!isEqual(this._classNames, store.classNames)) {
      const isInitialRender = !this._classNames;
      this._classNames = store.classNames;

      // Only rerender after initial render (when classnames is not falsy)
      if (!isInitialRender) {
        this.cycleModules();
      }
    }
  }
}
/* eslint-enable */
