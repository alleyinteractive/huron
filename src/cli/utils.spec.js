import { Map } from 'immutable';
import * as utils from './utils';

describe('utils', () => {
  describe('normalizeSectionData()', () => {
    const kssSectionMock = {
      data: {
        header: 'Sample partial',
        description: '<p>This is a sample element.</p>\n',
        deprecated: false,
        experimental: false,
        reference: 'site.sample-kss',
        referenceNumber: '1.1',
        referenceURI: '',
        weight: 0,
        markup: 'sample-kss.hbs',
        source: { filename: '', path: '', line: 1 },
        modifiers: [],
        parameters: [],
        data: 'sample-kss.json',
      },
      referenceURI: () => 'site-sample-kss',
    };
    const normalizedSection = utils
      .normalizeSectionData(kssSectionMock);

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
    const kssDirectoryConfig = Map({
      kss: ['test/scss-one', 'test/scss-two'],
    });

    it('return a configured KSS directory for a filepath', () => {
      const testMatchOne = utils.matchKssDir(
        '/User/example-user/www/huron/test/scss-one/testKss.scss',
        kssDirectoryConfig
      );
      const testMatchTwo = utils.matchKssDir(
        '/User/example-user/www/huron/test/scss-two/testKss.scss',
        kssDirectoryConfig
      );
      // Test multiple KSS source directories and one non-existent directory
      expect(testMatchOne).toBe('test/scss-one');
      expect(testMatchTwo).toBe('test/scss-two');
    });

    it('should return false when provided a non-existent directory', () => {
      const failMatch = utils.matchKssDir(
        '/User/example-user/www/huron/test/fail/testKss.scss',
        kssDirectoryConfig
      );
      expect(failMatch).toBe(false);
    });
  });

  describe('getSection()', () => {
    const testKssPath = 'Users/example-user/www/huron/scss-one/testKss.scss';
    const normalizedSection = {
      header: 'Sample partial',
      description: '<p>This is a sample element.</p>\n',
      deprecated: false,
      experimental: false,
      reference: 'site.sample-kss',
      referenceNumber: '1.1',
      referenceURI: 'site-sample-kss',
      weight: 0,
      markup: 'sample-kss.hbs',
      source: { filename: '', path: '', line: 1 },
      modifiers: [],
      parameters: [],
      data: 'sample-kss.json',
    };
    const mockData = Map({
      sections: Map({
        sectionsByPath: Map({
          [testKssPath]: normalizedSection,
        }),
      }),
    });

    describe('fails and returns false/undefined', () => {
      it('should fail if value does not match field', () => {
        const failedSearch = utils
          .getSection('mismatched value', 'data', mockData);
        expect(failedSearch).toBeUndefined();
      });

      it('should fail if field does not exist', () => {
        const failedField = utils
          .getSection('value', 'field', mockData);
        expect(failedField).toBeUndefined();
      });
    });

    describe('succeeds and returns KSS data', () => {
      it('should succeed with an absolute path to a KSS file', () => {
        const sectionPath = utils.getSection(testKssPath, false, mockData);
        expect(sectionPath).toBe(normalizedSection);
      });

      it('should succeed with a valid field/value pair', () => {
        const markup = utils.getSection('sample-kss.hbs', 'markup', mockData);
        const data = utils.getSection('sample-kss.json', 'data', mockData);
        expect(markup).toBe(normalizedSection);
        expect(data).toBe(normalizedSection);
      });
    });
  });
});
