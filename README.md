Alley Prototype Build System
======================

This build system is intended to make your life easier when moving from a KSS styleguide or SC5 styleguide to full-page, in-browser prototypes. This tool will copy all markup from each of your KSS sections into a separate html file, which can then be imported via webcomponents HTML import. Here are the steps:

# Installation
 * Don't forget to install the required npm packages with `npm install` (from within the `prototype` directory).
 * Add an NPM script or run the prototypes script by hand via `node prototype/bin/prototype.js`.
 * Make sure you pass at least a KSS source directory with the flag `--kss-source=path/to/my/source`.
 * Run your script and make sure your partials were generated correctly. Default output directory for partials is `prototype/partials`, but this can be changed with the flag `--destination=path/to/output`. I recommended creating separate directories for auto-built partials and custom partials.

# Serving
 * In order to work locally with webcomponents, they must be served and, therefore, you'll need to set a static directory from which to serve. The default is `huron`'s directory. You can change this with the `--serve-root` flag. I recommend you do one of two things:
  * If you want everything encapsulated, keep the default and serve from `huron` root. If you do this, you'll have to copy over any extra static assets to the `huron` directory.
  * Swith to serving from `huron`'s parent directory. This way, you can access extra static assets straight from your parent repo or WP theme without copying anything over.
 * Just rememeber: all static assets and partials you load in your prototype MUST be relative to the server root you set or, if you don't set anthing, relative to the `huron` directory.

# Building markup
 * Use the included `index.html` for a base prototype template. If you decide to create a new one, you MUST include `node_modulees/webcomponents.js/webcomponents-lite.min.js` and `js/insert-nodes.js` in the prototype footer.
 * Inserting a partial is a two-step process.
  * First, create an html import in your prototype `<head>` to include the necessary html. This is done via a link element: `<link rel="import" href="path/to/my-partial.html">`.
  * Next, insert an empty `<div>` tag with a `class` attribute corresponding to the filename of the partial you wish to insert and a `partial` attribute set with no value. Example: `<div class="my-partial" partial></div>` would insert the contents of `my-partial.html` imported in the previous step.

# KSS tools
 * Set `proto-skip` as an empty attribute on any element in your KSS markup to remove it from your generated partials
 * Set `proto-ignore` as an empty attribute on a wrapper element (or any element for that matter, but a wrapper element is more obvious) to prevent a partial from being generated for that KSS section. Example usage: you don't have JS running in your styleguide, but you do in your prototype. Therefore, you need to mimic JS-inserted markup in your styleguide, but can use regular markup for your prototype.

# Adding Custom JS
 * Because this tool uses html imports, the markup for which is inserted asyncronously, you'll probably want to load custom JS after everything has been output. To do this, create a `<script>` tag anywhere before `insert-nodes.js` is loaded and create a `window.protoScripts` variable. This variable should contain an array of relative paths to the scripts you'd like to include after all markup has loaded.
 * If you have a vendor JS bundle, you can most likely

Gotchas:
* Sometimes you may need to do some "styleguide only" styles. I often delimit these styles in comments. If you do this, please do not use the work 'styleguide' in your comment! This will break the build tool. Only use the keyword 'styleguide' to denote a new styleguide section.

That's it! Happy prototyping!