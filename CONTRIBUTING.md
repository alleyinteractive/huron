# Contributing

At this point contribution guidelines are limited. This document contains information on setting up and developing locally; otherwise the primary concern for contributors is whether or not you are a member of the Alley Interactive organization (Huron's sponsor).

## Development
There are two primary comonents to Huron: the CLI and the web (browser) script. Since each of these is used for different purposes, there is a different build pipeline for each.

Generally speaking, there are three NPM scripts you'll need to compile the Huron source:
* `dev-cli`: This script will start Webpack for the CLI (`/src/cli`) only using Webpack's watcher. Hot Module Reloading is also enabled with this script.
* `dev-web`: This script will run babel-cli with watcher to transpile the browser-facing Huron source.
* `build`: Run a single webpack build followed by a single run of babel-cli, for the Huron CLI and web source respectively.

### CLI
In order to allow users to reference the `.bin` version of the Huron cli via NPM, we need to bundle the CLI into a single `.js` file. To do this we utilize an internal Webpack install, for which the configuration is located in `/config/webpack-node.config.js`. As detailed above, you should use the `dev-cli` command during development, as this will allow you to hot reload your changes. Currently there is no HMR handling for the CLI scripts, so this functionality may be buggy.

### Web
Huron's browser-facing scripts will run through the user's own (or Huron's default) Webpack configuration and, as such, cannot be pre-compiled by Webpack. Therefore, we simply transpile the source for the web scripts using babel-cli to ensure some measure of browser compatibility. Note: At some point, it may be worth exploring further the possibility of dynamically inserting the babel-loader specifically for the huron web scripts when the user run's the CLI.

## Submitting your changes
When working on changes for Huron, please either assign yourself an issue in the existing issue queue or submit a new issue. Generally speaking, every merge of a Pull Request should be associated with a version bump. When you're ready to start, here's the workflow:

### Members of Alley Interactive:
Create a feature branch from `master` and, when ready, push it to github and open a Pull Request. All code should be reviewed and approved by at least one member of the Alley Interactive organization before being merged into `master`. Before merging, be sure you've bumped the version in package.json. We use Semantic Versioning for Huron.

Once merged, either you or a lead developer at alley should:
* Be sure you've bumped the package.json version
* Run `npm publish`
* Navigate to the `releases` tab in github and draft a new release using the same version you updated in the package.json.

### Non-members
Create a fork of Huron, create a feature branch from `master` and, when ready, submit a Pull Request from your fork. At least one member of the Alley Interactive organization must review your code and approve it before it can be merged into `master`. Once merged, a member of Alley will take the necessary steps to publish the new version to NPM and draft a new release

## Future developments
This document will be updated once we incorporate unit tests into Huron.
