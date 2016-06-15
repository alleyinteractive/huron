import { program, cwd } from './huron.js';

export default function processArgs() {
  program
    .version('0.0.1')
    .option(
      '--source [kss]',
      '[source] of kss documentation to convert'
    )
    .option(
      '--destination [destination]',
      '[destination] of partial output',
      (dest) => [cwd, dest].join('/')
    )
    .option(
      '--custom [custom]',
      'location of user-generated [custom] partials',
      (custom) => [cwd, custom].join('/')
    )
    .option(
      '--bundle',
      'bundle partials into a single file'
    )
    .option(
      '--bundle-name [bundleName]',
      'name of bundle',
      'huron'
    )
    .option(
      '-r, --root [root]',
      '[root] directory for the server, defaults to current working directory',
      cwd
    )
    .option(
      '--port [port]',
      '[port] to listen the server on',
      (port) => parseInt(port),
      8080
    )
    .option('-o, --output', 'Verbose output of options')
    .option('--runOnce', 'Run only once, without watching')
    .parse(process.argv);

  if (!program.source) {
    console.log('No KSS source given');
    return;
  }

  if (!program.destination) {
    console.log('No output destination given');
    return;
  }
}