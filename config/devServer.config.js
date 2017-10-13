export default (huron) => {
  // Get name of first configured prototype to open when devServer starts
  const prototypeName = huron.prototypes[0].title || huron.prototypes[0];

  return {
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
  }
};
