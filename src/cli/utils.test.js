import fs from 'fs';
import path from 'path';
import { utils } from './utils';
import huronConfig from '../../test/config/huronConfig';
import { dataStructure } from './huron-store';

const parse = require('kss').parse;

// Set huron config to our testing config
// Disable for now, as we aren't using it yet
/* eslint-disable */
let mockData = dataStructure.set('huron', huronConfig);
/* eslint-enable */

/**
 * Test for utils.normalizeSectionData()
 */
test('Ensures predictable data structure for KSS section data', () => {
  const testKSS = fs.readFileSync(
    path.join(__dirname, '../../test/scss-one/testKss.scss'),
    'utf8'
  );
  const styleguide = parse(testKSS, huronConfig.get('kssOptions'));
  const normalizedSection = utils
    .normalizeSectionData(styleguide.data.sections[0]);

  // We only require header and section reference
  expect(normalizedSection).toMatchObject({
    header: expect.any(String),
    reference: expect.any(String),
    referenceNumber: expect.any(String),
    referenceURI: expect.stringMatching(/[a-z-]/),
  });
});

/**
 * Test for utils.matchKssDir()
 */
test('Find which configured KSS directory a filepath exists in', () => {
  const testMatchOne = utils.matchKssDir(
    path.join(__dirname, '../../test/scss-one/testKss.scss'),
    huronConfig
  );
  const testMatchTwo = utils.matchKssDir(
    path.join(__dirname, '../../test/scss-two/testKss.scss'),
    huronConfig
  );
  const failMatch = utils.matchKssDir(
    path.join(__dirname, '../../test/fail/testKss.css'),
    huronConfig
  );

  // Test multiple KSS source directories and one non-existent directory
  expect(testMatchOne).toBe('test/scss-one');
  expect(testMatchTwo).toBe('test/scss-two');
  expect(failMatch).toBe(false);
});

/**
 * Test for utils.getSection()
 */
test('Request for section data based on section reference', () => {
  const testKssPath = path.join(__dirname, '../../test/scss-one/testKss.scss');
  const testKSS = fs.readFileSync(testKssPath, 'utf8');
  const styleguide = parse(testKSS, huronConfig.get('kssOptions'));
  const normalizedSection = utils
    .normalizeSectionData(styleguide.data.sections[0]);

  mockData = mockData.setIn(
    ['sections', 'sectionsByPath', testKssPath],
    normalizedSection
  );

  const markup = utils.getSection('sample-kss.hbs', 'markup', mockData);
  const data = utils.getSection('sample-kss.json', 'data', mockData);
  const sectionPath = utils.getSection(testKssPath, false, mockData);
  const failedSearch = utils.getSection('This value should not match the `data` field', 'data', mockData);
  const failedField = utils.getSection('The `fail` field should not exist', 'fail', mockData);

  expect(markup).toBe(normalizedSection);
  expect(data).toBe(normalizedSection);
  expect(sectionPath).toBe(normalizedSection);
  expect(failedSearch).toBeUndefined();
  expect(failedField).toBeUndefined();
});