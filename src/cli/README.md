# Huron CLI

Huron's CLI is extremely simple and only requires two flags.
* `--config` a flag to point Huron to your webpack config, which also contains a configuration for Huron itself
* `--production` a flag to tell Huron whether or not you're building for production. By default (without this flag set), Huron will build and server your assets via HMR and [webpack-dev-server][webpack_dev_server].
* You may also run `huron help` to see documentation on each CLI flag

Example build command: `node huron/dist/cli/huron-cli.js --config 'client/config/webpack.config.js' --production`. 

The source code for this CLI is documented via jsdoc. Run `npm install` inside the Huron directory and then run `npm run doc`. Documentation index page will be located at `source-docs/index.html`.

<!-- External links -->
[webpack_dev_server]: https://webpack.js.org/guides/development/#using-webpack-dev-server
