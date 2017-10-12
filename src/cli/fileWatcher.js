import { Gaze } from 'gaze';
import path from 'path';

import { removeTrailingSlash } from './utils';
import { defaultStore } from './defaultStore';

/**
 * Huron configuration object
 *
 * @global
 */
const huron = defaultStore.get('config');

/**
 * Available file extensions. Extensions should not include the leading '.'
 *
 * @global
 */
export const extensions = [
  huron.get('kssExtension'),
  huron.get('templates').extension,
  'html',
  'json',
].map((extension) => extension.replace('.', ''));

// Generate watch list for Gaze, start gaze
export const watchedFiles = [];

// Watch section template
watchedFiles.push(path.resolve(__dirname, huron.get('sectionTemplate')));

// Watch cssmodules classname files (if they exist)
if (huron.get('classnames')) {
  watchedFiles.push(path.resolve(huron.get('classnames')));
}

// Watch all provided kss directories
huron.get('kss').forEach((dir) => {
  watchedFiles.push(
    `${removeTrailingSlash(dir)}/**/*.+(${extensions.join('|')})`
  );
});

/**
 * Gaze instance for watching all files, including KSS, html, hbs/template, and JSON
 *
 * @global
 */
const gaze = new Gaze(watchedFiles);

export default gaze;
