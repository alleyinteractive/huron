// CLI for Huron

// External
const cwd = process.cwd(); // Current working directory
const kss = require('kss'); // node implementation of KSS: a methodology for documenting CSS and generating style guides
const path = require('path');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const gaze = require('gaze');
import { createStore } from 'redux';

// Local
// import './updateSection';
import { program } from './parseArgs';
import generateConfig from './generateConfig';
import requireTemplates from './requireTemplates';
import huronReducer from './reducers';

// Set vars
const localConfig = require(path.join(cwd, program.config));
const huronScript = requireTemplates(localConfig);
const config = generateConfig(localConfig, huronScript);
const huron = config.huron; // huron config
const store = createStore(huronReducer);

const unsubscribe = store.subscribe(() => {
  console.log(store.getState());
});

// Generate initial dataset
kss.traverse(huron.kss, {}, (err, styleguide) => {
  if (err) {
    throw err;
  }

  let action = {
    type: 'ADD_SECTION',
    section: styleguide.data.sections[0],
  }
  store.dispatch(action);

  let action2 = {
    type: 'ADD_SECTION',
    section: styleguide.data.sections[1],
  }
  store.dispatch(action2);

  // styleguide.data.sections.forEach(section => {
  //   let action = {
  //     type: 'ADD_SECTION',
  //     section: section,
  //   }
  //   store.dispatch(action);
  // });
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
