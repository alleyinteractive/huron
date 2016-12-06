import program from './parse-args';

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

export default function startWebpack(config) {
  const huron = config.huron;
  const compiler = webpack(config);

  if (program.progress) {
    compiler.apply(
      new webpack.ProgressPlugin(
        (percentage, msg) => {
          console.log(`${(percentage * 100)}% `, msg);
        }
      )
    );
  }

  if (program.production) {
    compiler.run((err) => {
      if (err) {
        console.log(err);
      }
    });
  } else {
    const server = new WebpackDevServer(compiler, {
      hot: true,
      quiet: false,
      noInfo: false,
      stats: {
        colors: true,
        hash: false,
        version: false,
        assets: false,
        chunks: false,
        modules: false,
        reasons: false,
        children: false,
        source: false,
      },
      contentBase: huron.root,
      publicPath: `http://localhost:${huron.port}/${huron.root}`,
    });
    server.listen(
      huron.port,
      'localhost',
      (err) => {
        if (err) {
          return console.log(err);
        }

        console.log(`Listening at http://localhost:${huron.port}/`);
        return true;
      }
    );
  }
}
