# Huron: A Prototype Build System built by Alley Interactive
===========================================================

Huron is intended as a one-stop shop for generating both an in-browser styleguide and a series of in-browser prototypes. Huron utilizes a custom CLI to process Knyle Style Sheets [(KSS)](http://warpspire.com/kss/) documentation and webpack to build the styleguides and prototoypes. In addition, Huron makes heavy use of webpack's Hot Module Reloading [HMR](https://webpack.github.io/docs/hot-module-replacement.html) system to provide a quick and seamless development experience.

## Table of contents
This file contains basic information on Huron installation and writing prototypes. However, there are several other subsections of this documentation:

 * [Configuration](config/README.md) - Configuration for huron and for your local webpack setup
 * [Templates](templates/README.md) - Peripheral template documentation
 * [CLI](src/cli/README.md) - General information on the Huron CLI. Source code is further documented via jsdoc
 * [Web](src/web/README.md) - General infomration on browser script for inserting/replacing markup. Source code is further documented via jsdoc
 * [Dist](dist/README.md) - General information on the distribution (build) directory.

## Installation
 * Huron is not yet registered in NPM, so for now you'll have to check it out add it to your `package.json` via `file:./huron` or use a github link.
 * Don't forget to run `npm install` once you're done!
 * Once `npm install` finishes, you'll need to write a configuration or use the default. The default settings and how to modify them is documented in the configuration section of this readme.
 * Start the CLI using the `dist/cli/huron-cli.js` file.
 * Once the CLI has started, if you didn't run the CLI with the `--production` flag, you can access your prototype(s) at `localhost:[huron.port]/[huron.root]/[prototype-name].html`. You can find the defaults for the `port` and `root` options and how to change them in the config documentation, but using the defaults this URL would resolve to `localhost:8080/dist/index.html`.

## Writing KSS, templates and data
KSS is a documentation syntax and styleguide generator. All documentation should be located in your stylesheets, and should largely follow the regular [KSS syntax](http://warpspire.com/kss/syntax/). However, Huron uses [kss-node](https://github.com/kss-node/kss-node) which includes some changes, and there are a few differences specific to Huron as well. All your KSS should include the following:
 * Title - This is the first line of your KSS comment block
 * Description - This starts on the second line of your KSS comment block (may be multple lines), and will be exported to a separate file by Huron after running through a markdown compliler. As is probably obvious, this means you may use markdown your KSS descriptions
 * Modifiers - These are different variations of your component. Modifiers are used _exclusively_ in the Huron styleguide helper tags, and are not required to render a variant of a template in your prototypes (we'll get into that later). So for example, you could include a 'with-images' variant of your component markup, but not include it in the KSS modifiers block. This would allow you to still use that variant in your prototypes, but would not show up in the styleguide.
 * Markup - This field can contain one of three options:
 	* HTML written directly inline in your KSS.
 	* A reference to an external HTML file (currently this must be in the same directory as the file containing your KSS).
 	* A reference to an external Handlebars template
 * Data - If you're using a handlebars template in your markup field, you may also provide a reference to an external JSON data file. This file may be written in one of two formats:
 	* All data fields at the top level of your JSON. This indicates the same data should be used every time you render the template. This probably won't happen too often, as you might consider just using a static HTML file if you only have one variant. Example:

 	```json
 	{
		"title": "Lorem ipusm dolor sit amet",
		"excerpt": "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Impedit nemo accusamus nobis sunt nihil, voluptatem qui itaque. Eius saepe rem perspiciatis beatae ea nulla, sed facilis exercitationem a aspernatur ullam?"
 	}
 	```

 	* Variants listed at the top level of your JSON, and all data fields (and variations thereof) directly beneath them. Example:

 	```json
 	{
 		"type-one": {
			"title": "Lorem ipusm dolor sit amet",
			"excerpt": "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Impedit nemo accusamus nobis sunt nihil, voluptatem qui itaque. Eius saepe rem perspiciatis beatae ea nulla, sed facilis exercitationem a aspernatur ullam?"
		},
		"type-two": {
			"title": "Dolor sit amet adipscing elit",
			"excerpt": "Doloribus veniam debitis, perferendis pariatur, eligendi id non modi! Nesciunt suscipit sint dolorum praesentium!"
		}
 	}
 	```

 * Styleguide reference - This is a required field, and must be written in the format `Styleguide [styleguide-section].[styleguide-subsection]`. You may have as many subsections as you like. You'll use this section reference when inserting markup in your prototypes by converting all `.` separators to `-`, creating a URI-like structure. We'll discuss this further in the next section.
 * NOTE: As of now, Huron only supports one KSS documentation block per file, meaning it's heavily geared toward CSS preprocessors like SASS or LESS. This is an issue on our radar, however, and will be implemented at some point.

## Writing prototypes
In Huron, everything is a "prototype" (even a styleguide). Unlike previous versions, you now only have to write the prototype _content_ instead of wrangling all the surrouding HTML document boilerplate as well. This is accomplished via the [HTML webpack plugin](https://github.com/ampedandwired/html-webpack-plugin). Configuration of each prototype is discussed in the [config directory](config/README.md) readme. All you need to know for now is your prototype files should be located in a `prototypes` directory within your SASS/CSS source directory, and should be named in the format `prototype-[prototype name].html`.
 * You may include any valid HTML markup in your prototype.
 * Huron uses its own custom syntax for inserting templates from your KSS. This is accomplished via three data attributes:
 	* `[data-huron-id]` - The KSS styleguide section reference URI containing the template you want. As described above, to get the reference URI you simply convert any `.` to `-` in the section reference you wrote in the KSS. For example, the section `header.navigation` would be inserted using a `huron-id` of `header-navigation`.
 	* `[data-huron-type]` - This attribute roughly corresponds to the KSS field you want to insert. There are several options for this:
 		* `template` - This is the type you'll use most frequently, and will insert anything in your KSS `markup` field.
 		* `description` - Type to insert the KSS description field
 		* `prototype` - This is mostly used by the HTML webpack plugin to insert your prototype content, but you can use it as well if necessary.
 		* `section` - Insert the entire KSS section using the `templates/section.hbs` template. More on this template is located in the [templates readme](templates/README.md).
 	* `[data-huron-modifier]` - Used to specify a particular top-level data field with which to render your markup. Using the example data above, you could use `data-huron-modifier="type-two"` to use the data fields within the `type-two` property to render and insert your KSS markup.
 * You may attach the Huron data attributes to any tag, but generally we use a generic `<div>`
 * A separate HTML document is autmatically built for each of your configured prototypes using the HTML webpack plugin and a custom ejs [template](templates/prototype-template.ejs). More information on this can be found in the [templates readme](templates/README.md).
