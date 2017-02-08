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
Note for all new package versions: the github release should _always_ match the corresponding release to NPM. In addition, publishes from the `beta` branch must always include a `-beta.0` after the version number to indicate a beta pre-release. In addition, generally speaking, every merge of a Pull Request should be associated with a version bump. If you are writing changes for documentation only, a version bump is not necessary. When working on changes for Huron, please follow these guildelines:
* Either assign yourself an issue in the existing issue queue or submit a new issue.
* Open up a featured branch based on `master` for your feature/fix. I sometimes include the issue number in the branch name.
* Once you've reached a point in your work where you'd like to test, open a PR to the `beta` branch. Be sure to indicate which issue you are addressing in the pull request description. Someone in the Alley Interactive organization will review your work.
* Once approved, an Alley member (or yourself if you're a part of Alley) will merge your PR and publish the tip of the beta branch to `huron@beta` via `npm publish --tag beta`, then create a corresponding release in github. Be sure you've bumped the version in the `package.json` before merging and publishing.
* Install and test your beta version to verify it's working. If your code constitutes a MAJOR or MINOR version change, you must have an Alley member install and test your work as well.
* Make any changes required and open subsequent PRs to `beta` as necessary.
* Once tested, you may open a PR to the `master` branch. This PR should not require an in-depth review, as all code should be reviewed when merging into the `beta` branch. Once again, don't forget to switch the version in your `package.json` to one _without_ `-beta` for its release on the `latest` tag in NPM.

### For clarity's sake, here is the release workflow:
* Before merge to `beta` branch, bump version in `package.json` to `target-version-beta.0`. For example, if you're releasing a MINOR version and we're currently on `2.0.0`, you'll be releasing `2.1.0-beta.0` to the `beta` branch.
* Once merged, run `npm publish --tag beta` from the `beta` branch.
* Draft a release in github with the same tag as the version you just released to npm. In this example, draft a release with tag `2.1.0-beta.0` and mark as a prerelease.
* Install and test the beta version.
* Before a merge to `master`, bump version in `package.json` to `target-version`, without `-beta`. To continue our example, you'd change the version to `2.1.0` at this point.
* Once merged, run `npm publish` to publish on the `latest` tag to NPM.
* Draft another new release using the same version, this time do not mark it as a prerelease.

### Note for non-alley developers
In order to follow the steps for submitting changes, you'll likely need to create a fork of Huron to create a feature branch. When ready, submit a Pull Request from your fork. At least one member of the Alley Interactive organization must review your code and approve it before it can be merged. Once merged, a member of Alley will take the necessary steps to publish the new version to NPM and draft a new release

## Future developments
This document will be updated once we incorporate unit tests into Huron.
