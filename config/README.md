# Configuration

This document contains references to each Huron configuration field and guidelines when integrating your own local webpack configuration file.

## Huron
Huron's configuration object must currently be a top-level `huron` property of the webpack configuration. In future versions we will move this to a separate file, however, as webpack is discouraging use of custom properties in its configuration. Here is a list of the available configuration options and how to use them:
 * **css** {array|string} : default `[]` - CSS files that should be included on all prototypes, but are not a part of your webpack bundle. These will go directly in the the `href` attribute of a `<link>` tag, so could reference remote resources. These files, if local, will automatiacally be copied to the directory configured in the huron `root` option within a `css` subdirectory.
 * **entry** {string} : default `'huron'` - webpack entry point you want huron to use. Since Huron development uses HMR, it assumes you will combine all necessary assets into a single entry point for evelopment purposes, which will allow you to hot reload all assets. You will likely want to create a specific entry point for use with Huron and/or HMR containing all these assets you need.
 * **js** {array|string}: default `[]` - JS files that should be included on all prototypes, but are not a part of your webpack bundle. These will go directly into the `src` attribute of a `<script>` tag, so could reference remote resources. These files, if local, will automatiacally be copied to the directory configured in the huron `root` option within a `js` subdirectory.
 * **kss** {string} : default `'/css'` - relative path to KSS source directory. Currently you may only provide a single directory, but in the future we may allow an array.
 * **kssExtension** {string} : default `'.css'` - Extension of files containing your KSS documentation
 * **kssOptions**: {object} default
 	```javascript
 	{
    multiline: true,
    markdown: true,
    custom: ['data'],
  }
  ```
    Object containing options to pass through to KSS-node. I can't find a good source of the available options here, but I'll keep looking.
 * **output** {string} : default `'partials'` - Relative path (relative to the `huron.root` option) to the directory where you want your templates to be generated.
 * **port** {number} : default `8080` - Localhost port from which to server your prototypes via webpack-dev-server
 * **prototypes** {array} : default `['index']` - Array of prototypes to generate via HTML webpack plugin. For each array entry you can either pass in a single string corresponding to the title of the prototype, or an object containing option overrides for HTML webpack plugin [(configuration)](https://github.com/ampedandwired/html-webpack-plugin). If you use an object, you must at least provide a `title` field. The title field, whether passed in as a string or the `title` property value, must be the same name as your prototype file located in your `prototypes` directory. So for example, if you provided `['homepage']` in the prototypes option, you would need to have a `prototypes/prototype-homepage.html` file in order for the prototype to display correctly.
 * **root** {string} : default `'dist/'` - Root directory for `webpack-dev-server`. All static assets you need for your prototype(s) should be located in this directory. The `output` option should be relative to this path.
 * **sectionTemplate** {string} : default `path.join(__dirname, '../templates/section.hbs')` - Override for the template used to produce styleguide sections. This should always be a handlebars file, and will utilize the KSS data as its source.
 * **templates** {object} : default

  ```javascript
  {
    loader: {
      test: /\.hbs$/,
      loader: 'handlebars-loader',
    },
    extension: '.hbs',
  }
  ```

    Object containing a webpack loader for your template files and a corresponding file extension. Instructions for configuring a webpack loader can be found [here](https://webpack.github.io/docs/configuration.html#module-loaders).
 * **window** {object} : default `{}` - Object containing variables that should be attached to the global `window` object on every prototype.
 * Complete default huron configuration object:

 ```javascript
 huron: {
    css: [],
    entry: 'huron',
    js: [],
    kss: 'css/',
    kssExtension: '.css',
    kssOptions: {
      multiline: true,
      markdown: true,
      custom: ['data'],
    },
    output: 'partials',
    port: 8080,
    prototypes: ['index'],
    root: 'dist/',
    sectionTemplate: path.join(__dirname, '../templates/section.hbs'),
    templates: {
      loader: {
        test: /\.hbs$/,
        loader: 'handlebars-loader',
      },
      extension: '.hbs',
    },
    window: {},
  }
  ```

## Webpack
Huron will attempt to merge its own configuration requirements for webpack with your local configuration, allowing you to use the same build tools (and resulting scripts and styles) in your prototypes as you do on your live site.
 * Huron will automatically add `webpack-dev-server/client?http://localhost:${huron.port}`, `webpack/hot/dev-server` and the Huron frontend script to your configured entry point, so you do not need to worry about configuring this. In addition, Huron will de-dupe the `HotModuleReplacementPlugin()` if you're using it in your production webpack configuration.
 * Huron will automatically add configurations for the `html-loader` and `json-loader` for HTML templates and JSON data respectively
 * The HTML webpack plugin will be largely configured automatically, so you're only required to supply the title of the prototype. As described above, however, you may reconfigure the options. Just beware that this may break your setup, especially if you override the `chunks` option. NOTE: this is also the method by which you may supply a custom ejs template for your prototypes. Again, do this at your own risk and consult the [default template](../templates/prototype-teplate.ejs) first.
 * Huron will override the `devServer` property in your webpack config in favor of its own.
 * As described above, your Huron entry point should use the following guiedlines:
 	** Huron will only support a _single_ entry point. This entry point may be an array of modules, however.
 	** Becuase of the above (and depending on your production setup) you may want to create a new entry point specfically for use with Huron and HMR. For example: If you have a separate entry point in production for you article page and homepage, you may want to combine these to support hot reloading both sets of assets.
 	** If you're using `extract-text-webpack-plugin` you will need to conditionally disable this for Huron in order to hot reload your styles.
 	** In addition, your styles should conditionally run through the `style-loader` to properly support HMR.
 	** To support the above conditions, our recommendation is to set a variable in your webpack config based on the npm lifecycle event. Example: `const isHuron = 'huron' === process.env.npm_lifecycle_event;`. This would be set to `true` when you run `npm run huron`.
