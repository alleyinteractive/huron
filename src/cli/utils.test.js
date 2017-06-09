import fs from 'fs';
import path from 'path';
import { utils } from './utils';

const huronConfig = require('../default-config/huron.config');
const parse = require('kss').parse;

test('Ensures predictable data structure for KSS section data', () => {
  const testKSS = fs.readFileSync(path.join(__dirname, './testKss.css'), 'utf8');
  const styleguide = parse(testKSS, huronConfig.kssOptions);
  const normalizedSection = utils.normalizeSectionData(styleguide.data.sections[0]);

  // We only require header and section reference
  expect(normalizedSection).toMatchObject({
    header: expect.any(String),
    reference: expect.any(String),
    referenceNumber: expect.any(String),
    referenceURI: expect.stringMatching(/[a-z\-]/)
  });
});
