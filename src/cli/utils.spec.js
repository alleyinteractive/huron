import fs from 'fs';
import path from 'path';
import { utils } from './utils';
import huronConfig from '../../test/config/huronConfig';
import { dataStructure } from './huron-store';

const parse = require('kss').parse;

// Set huron config to our testing config
// Disable for now, as we aren't using it yet
let mockData = dataStructure.set('huron', huronConfig);

describe('utils', () => {
  describe('normalizeSectionData()', () => {
    const testKSS = fs.readFileSync(
      path.join(__dirname, '../../test/scss-one/testKss.scss'),
      'utf8'
    );
    const styleguide = parse(testKSS, huronConfig.get('kssOptions'));
    const normalizedSection = utils
      .normalizeSectionData(styleguide.data.sections[0]);

    it('should ensure predictable data structure for KSS section data', () => {
      // We only require header and section reference
      expect(normalizedSection).toMatchObject({
        header: expect.any(String),
        reference: expect.any(String),
        referenceNumber: expect.any(String),
        referenceURI: expect.stringMatching(/[a-z-]/),
      });
    });
  });

  describe('matchKssDir()', () => {
    it(
      'should find which configured KSS directory a filepath exists in',
      () => {
        const testMatchOne = utils.matchKssDir(
          path.join(__dirname, '../../test/scss-one/testKss.scss'),
          huronConfig
        );
        const testMatchTwo = utils.matchKssDir(
          path.join(__dirname, '../../test/scss-two/testKss.scss'),
          huronConfig
        );
        // Test multiple KSS source directories and one non-existent directory
        expect(testMatchOne).toBe('test/scss-one');
        expect(testMatchTwo).toBe('test/scss-two');
      });

    it('should return false when provided a non-existent directory', () => {
      const failMatch = utils.matchKssDir(
        path.join(__dirname, '../../test/fail/testKss.css'),
        huronConfig
      );
      expect(failMatch).toBe(false);
    });
  });

  describe('getSection()', () => {
    const testKssPath = path.join(
      __dirname,
      '../../test/scss-one/testKss.scss'
    );
    const testKSS = fs.readFileSync(testKssPath, 'utf8');
    const styleguide = parse(testKSS, huronConfig.get('kssOptions'));
    const normalizedSection = utils
      .normalizeSectionData(styleguide.data.sections[0]);

    mockData = mockData.setIn(
      ['sections', 'sectionsByPath', testKssPath],
      normalizedSection
    );

    /* eslint-disable max-len */
    it('should return a KSS section object if provided an absolute path to that KSS file', () => {
    /* esling-enable */
      const sectionPath = utils.getSection(testKssPath, false, mockData);
      expect(sectionPath).toBe(normalizedSection);
    });

    /* eslint-disable max-len */
    it('should return a specific KSS section object if provided a data field/value pair that section contains', () => {
    /* eslint-enable */
      const markup = utils.getSection('sample-kss.hbs', 'markup', mockData);
      const data = utils.getSection('sample-kss.json', 'data', mockData);
      expect(markup).toBe(normalizedSection);
      expect(data).toBe(normalizedSection);
    });

    /* eslint-disable max-len */
    it('should return false/undefined if provided a mismatched field/value pair or a non-existent field', () => {
    /* eslint-enable */
      const failedSearch = utils.getSection(
        'This value should not match the `data` field',
        'data',
        mockData
      );
      const failedField = utils
        .getSection('The `fail` field should not exist', 'fail', mockData);
      expect(failedSearch).toBeUndefined();
      expect(failedField).toBeUndefined();
    });
  });
});
