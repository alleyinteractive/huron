Huron: Alley's Prototype Build System
======================

This build system is intended to make your life easier when moving from a KSS styleguide or SC5 styleguide to full-page, in-browser prototypes. This tool will copy all markup from each of your KSS sections into a separate html file, which can then be imported via webcomponents HTML import. If you use SC5's `<sg-insert>` to reference another section, this will be replaced by an import to the partial it references. Below are the steps and, once you read through them, try it out within this repo (it's functional!).

# Installation
 * Don't forget to install the required npm packages with `npm install` (from within the `huron` directory).
 * Add an NPM script or run the `huron` script by hand via `node dist/cli/huron.js`.
 * Make sure you pass at least a KSS source directory with the flag `--source=path/to/my/source`.
 * Run your script and make sure your partials were generated correctly. Default output directory for partials is `prototype/partials/generated`, but this can be changed with the flag `--destination=path/to/output`. I recommended creating separate directories for auto-built partials and custom partials.

# Serving
 * In order to work locally with webcomponents, they must be served and, therefore, you'll need to set a static directory from which to serve. The default is `huron`'s directory. You can change this with the `--root` flag. I recommend you do one of two things:
  * If you want everything encapsulated, keep the default and serve from `huron` root. If you do this, you'll have to copy over any extra static assets to the `huron` directory.
  * Switch to serving from `huron`'s parent directory. This way, you can access extra static assets straight from your parent repo or WP theme without copying anything over.
 * Just remember: all static assets and partials you load in your prototype MUST be relative to the server root you set or, if you don't set anything, relative to the `huron` directory.

# Building markup
 * Use the included `index.html` for a base prototype template. If you decide to create a new one, you MUST include `node_modules/webcomponents.js/webcomponents-lite.min.js` and `lib/js/app.js` in the prototype footer.
 * Inserting a partial is a two-step process.
  * First, create an html import in your prototype `<head>` to include the necessary html. This is done via a link element: `<link rel="import" href="path/to/my-partial.html">`.
  * Next, add a new element corresponding to the name of the partial. For example, `<my-partial></my-partial>`.
 * If you need to create custom partials outside of your KSS workflow, you can! Just follow these instructions:
  * You may use any partial within another partial, as long as you add an HTMl import for it in the `<head>` of the prototype.
  * All partial markup should be wrapped in a `<dom-module>` and `<template>` element.

# KSS tools

# Webpack Config Guidelines
Huron uses webpack (and for best results, webpack-dev-server and hot module replacement). By default, huron will attempt to merge your local webpack settings with its internal defaults. However, you may also use the internal defaults as a boilerplate for using your own config exclusively. To do this, set the `skipConfig` option to `true`;
**entry:** Huron will add webpack-dev-server, HMR, and huron frontend script to your specified entry point by default. If you're skipping huron's config helper, however, you'll have to add these yourself.
**output:** Huron will override your output settings by default and set `path` to the huron root directory, and `filename` and `chunkfilename` to sensible and simple defaults. In additional, `plublicPath` will be set via webpack-dev-server options, so this cannot be overridden.
**plugins:** By default, huron will add the HMR plugin.
**resolve and resolveLoaders:** These are not used by default in Huron; they're more guildlines for those setting up their own config. Currently, huron is not registered in npm, so if you prefer you can run an `npm install` within the huron directory and add the `resolve` and `resolveLoaders` settings shown in the boilerplate to access the required modules for Huron.
**loaders:** Huron will currently only set a loader for html templates. This loader will be restricted to files in the provided `templates` option by default.
**huron:** Default Huron options.

**That's it! Happy prototyping!**
