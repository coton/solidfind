const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

test('company since year validator accepts only 4 digits from 1980 to present', async () => {
  const validation = await import(path.join(projectRoot, 'src/lib/company-since-year-validation.mjs'));
  const currentYear = new Date().getFullYear();

  assert.equal(validation.normalizeCompanySinceYearInput('20ab251'), '2025');
  assert.equal(validation.isValidCompanySinceYear('1980', currentYear), true);
  assert.equal(validation.isValidCompanySinceYear(String(currentYear), currentYear), true);
  assert.equal(validation.isValidCompanySinceYear('1979', currentYear), false);
  assert.equal(validation.isValidCompanySinceYear(String(currentYear + 1), currentYear), false);
  assert.equal(validation.isValidCompanySinceYear('999', currentYear), false);
  assert.equal(validation.isValidCompanySinceYear('abcd', currentYear), false);
});

test('company mutations enforce founded year validation', () => {
  const source = fs.readFileSync(path.join(projectRoot, 'convex/companies.ts'), 'utf8');

  assert.match(
    source,
    /import \{ MIN_COMPANY_SINCE_YEAR, getMaxCompanySinceYear, isValidCompanySinceYear \} from "\.\.\/src\/lib\/company-since-year-validation\.mjs";/,
    'Expected companies mutations to import the shared founded-year validator'
  );

  assert.match(
    source,
    /function ensureValidSinceYear\(since: number \| undefined\)[\s\S]*!isValidCompanySinceYear\(String\(since\), getMaxCompanySinceYear\(\)\)[\s\S]*Founded year must be 4 digits/,
    'Expected companies mutations to reject invalid founded years'
  );

  assert.match(
    source,
    /ensureValidSinceYear\(args\.since\);[\s\S]*ensureValidSinceYear\(updates\.since\);/,
    'Expected company create and update mutations to validate founded year values'
  );
});
