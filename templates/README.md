# Default Templates

This directory contains default layout templates for styleguide [section][section] and [prototype][prototype_template] documents. You may override each of these with your own markup. Before you do so, however, it's advised you take a look at the existing templates first.

* Styleguide section template: add a path to your own Handlebars template using the Huron `sectionTemplate` configuration field.
* Prototype document template: in your Huron `prototypes` configuration array, supply a configuration object for one or more of your prototypes and include a `template` field in that object. This will override the `template` field of the HTML webpack plugin and allow you to supply a custom template. By default, HTML webpack plugin uses EJS for templates. However, for Huron you may also supply a template in the same language as your prototype partials.
  * [Handlebars][Handlebars]
  * [HTML webpack plugin documentation][html_webpack_plugin]

<!-- External links -->
[Handlebars]: http://handlebarsjs.com/
[html_webpack_plugin]: https://github.com/ampedandwired/html-webpack-plugin

<!-- Docs -->
[section]: section.hbs
[prototype_template]: prototypeTemplate.hbs
