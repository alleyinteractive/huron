# Huron CLI

Huron's CLI is extremely simple and only requires two flags.
* Config: a flag to point Huron to your webpack config, which also contains a configuration for huron itself
* Production: a flag to tell huron whether or not you're building for production. By default (without this flag set), Huron will build and server your assets via HMR and [webpack-dev-server](https://webpack.github.io/docs/webpack-dev-server.html).

Example build command: `node huron/dist/cli/huron-cli.js --config 'client/config/webpack.config.js' --production`. The source code for this CLI is documented via jsdoc. Currently the docuemtation is not hosted anywhere, so please check out the Huron source code form github, `npm install` inside the Huron directory, and run `npm run doc`. Documentation index page will be located at `source-docs/index.html`.