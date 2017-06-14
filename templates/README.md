# Default Templates

This directory contains default layout templates for styleguide [sections](./sections.hbs) and [prototype documents](./prototype-template.ejs). You may override each of these with your own markup. Before you do so, however, it's advised you take a look at the existing templates first.

* Styleguide section template: add a path to your own Handlebars template using the Huron `sectionTemplate` configuration field.
* Prototype document template: in your Huron `prototypes` configuration array, supply a configuration object for one or more of your prototypes and include a `template` field in that object. This will override the `template` field of the HTML webpack plugin and allow you to supply a custom template. By default, HTML webpack plugin uses EJS for templates. However, for Huron you may also supply a template in the same language as your prototype partials.
  * [EJS syntax](http://www.embeddedjs.com/)
  * [HTML webpack plugin documentation](https://github.com/ampedandwired/html-webpack-plugin)