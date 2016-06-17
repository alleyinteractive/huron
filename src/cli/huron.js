// CLI for Huron

// External
const cwd = process.cwd(); // Current working directory
const kss = require('kss'); // node implementation of KSS: a methodology for documenting CSS and generating style guides
const path = require('path');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
import { createStore } from 'redux';

// Local
import { program } from './parseArgs';
import generateConfig from './generateConfig';
import requireTemplates from './requireTemplates';
import huronReducer from './reducers';

// Set vars
const localConfig = require(path.join(cwd, program.config));
const huronScript = requireTemplates(localConfig);
const config = generateConfig(localConfig, huronScript);
const huron = config.huron; // huron config
const store = createStore(reducer);

kss.traverse(huron.kss, {}, (err, styleguide) => {
  if (err) {
    throw err;
  }

  styleguide.data.sections.forEach(section => {
    let action = {
      type: 'ADD_SECTION',
      section: section,
    }
    store.dispatch(action);
  });

  console.log(store.getState());
});

// Build for production
if (program.production) {
  webpack(
    config,
    (err, stats) => {
      if (err) {
        throw err;
      }
    }
  );
} else {
  const compiler = webpack(config);
  const server = new webpackDevServer(compiler, {
    hot: true,
    quiet: false,
    noInfo: false,
    stats: {colors: true},
    contentBase: huron.root,
    publicPath: `http://localhost:${huron.port}/${huron.root}`,
  });
  server.listen(huron.port, 'localhost', function (err, result) {
    if (err) {
      return console.log(err);
    }

    console.log(`Listening at http://localhost:${huron.port}/`);
  });
}
