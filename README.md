Huron: Alley's Prototype Build System
======================

This build system is intended to make your life easier when moving from a KSS styleguide or SC5 styleguide to full-page, in-browser prototypes. This tool will copy all markup from each of your KSS sections into a separate html file, which can then be imported via webcomponents HTML import. If you use SC5's `<sg-insert>` to reference another section, this will be replaced by an import to the partial it references. Below are the steps and, once you read through them, try it out within this repo (it's functional!).

# Installation
 * Don't forget to install the required npm packages with `npm install` (from within the `huron` directory).
 * Add an NPM script or run the `huron` script by hand via `node huron/lib/huron.js`.
 * Make sure you pass at least a KSS source directory with the flag `--source=path/to/my/source`.
 * Run your script and make sure your partials were generated correctly. Default output directory for partials is `prototype/partials/generated`, but this can be changed with the flag `--destination=path/to/output`. I recommended creating separate directories for auto-built partials and custom partials.

# Serving
 * In order to work locally with webcomponents, they must be served and, therefore, you'll need to set a static directory from which to serve. The default is `huron`'s directory. You can change this with the `--root` flag. I recommend you do one of two things:
  * If you want everything encapsulated, keep the default and serve from `huron` root. If you do this, you'll have to copy over any extra static assets to the `huron` directory.
  * Switch to serving from `huron`'s parent directory. This way, you can access extra static assets straight from your parent repo or WP theme without copying anything over.
 * Just rememeber: all static assets and partials you load in your prototype MUST be relative to the server root you set or, if you don't set anything, relative to the `huron` directory.

# Building markup
 * Use the included `index.html` for a base prototype template. If you decide to create a new one, you MUST include `node_modules/webcomponents.js/webcomponents-lite.min.js` and `lib/js/app.js` in the prototype footer.
 * Inserting a partial is a two-step process.
  * First, create an html import in your prototype `<head>` to include the necessary html. This is done via a link element: `<link rel="import" href="path/to/my-partial.html">`.
  * Next, add a new element corresponding to the name of the partial. For example, `<my-partial></my-partial>`.
 * If you need to create custom partials outside of your KSS workflow, you can! Just follow these instructions:
  * You may use any partial within another partial, as long as you add an HTMl import for it in the `<head>` of the prototype.
  * All partial markup should be wrapped in a `<dom-module>` and `<template>` element.

# KSS tools
 * Set `proto-skip` as an empty attribute on any element in your KSS markup to remove it from your generated partials
 * Set `proto-ignore` as an empty attribute on a wrapper element (or any element for that matter, but a wrapper element is more obvious) to prevent a partial from being generated for that KSS section. Example usage: you don't have JS running in your styleguide, but you do in your prototype. Therefore, you need to mimic JS-inserted markup in your styleguide, but can use regular markup for your prototype.
 * When the tool replaces an `<sg-insert>`, it assumes the partial being referenced is also generated and output in `partials/generated` or your custom output path. If this is not the case or you would like to override the default, wrap the `<sg-insert>` in a `<div>` with a `path` attribute set to the path where the partial actually resides, relative to `partials/generated` or your custom output directory. Example if you're using the default output directory: `<div path="../user"><sg-insert>6.1</sg-insert></div>` will search for the partial from section `6.1` in `partials/user` instead of `partials/generated`. If it is a partial you created, make sure it's named the same thing as it would be if it were generated. This means if the section header is "Article Header Area" you'd name it `article-header-area.html`.

# Adding custom JS
 * Because this tool uses html imports, the markup for which is inserted asyncronously, you'll probably want to load custom JS after everything has been output. To do this, create a `<script>` tag anywhere before `app.js` is loaded and create a `window.protoScripts` variable. This variable should contain an array of relative paths to the scripts you'd like to include after all markup has loaded.
 * If you have a vendor JS bundle, you can most likely just load it in a script tag syncronously. No waiting necessary!

# Test it out in this repo!
 * run `npm install`
 * make sure you're in the `huron` directory
 * run `npm run huron`
 * navigate to `localhost:8080/prototype/index.html` in your browser of choice

# Gotchas
* Sometimes you may need to do some "styleguide only" styles. I often delimit these styles in comments. If you do this, please do not use the work 'styleguide' in your comment! This will break the build tool. Only use the keyword 'styleguide' to denote a new styleguide section.

**That's it! Happy prototyping!**
