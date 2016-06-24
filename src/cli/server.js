const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
import { program } from './parse-args';

export default function startWebpack(config) {
  const huron = config.huron;
  const compiler = webpack(config);

  if (program.progress) {
    compiler.apply(new webpack.ProgressPlugin(function(percentage, msg) {
      console.log((percentage * 100) + '%', msg);
    }));
  }

  if (program.production) {
    compiler.run((err, stats) => {
      if (err) {
        console.log(err);
      }
    });
  } else {
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
}