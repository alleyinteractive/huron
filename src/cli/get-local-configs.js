// This is real ugly, need to figure out a better way of doing this
/* eslint-disable import/no-dynamic-require, global-require */
export default function getLocalConfigs(cwd, path, program) {
  return {
    webpack: require(path.join(cwd, program.webpackConfig)),
    huron: require(path.join(cwd, program.huronConfig)),
  };
}
/* eslint-enable */
