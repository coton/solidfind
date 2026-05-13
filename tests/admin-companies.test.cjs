const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('admin companies tab can mark listings reviewed or not reviewed before delete', () => {
  const source = readProjectFile('src/app/admin/companies/page.tsx');

  assert.match(
    source,
    /const handleToggleReviewed = async \(id: string, currentReviewed: boolean \| undefined\) => \{[\s\S]*isReviewed: !\(currentReviewed \?\? true\)/,
    'expected admin companies tab to toggle reviewed status with undefined treated as reviewed'
  );

  assert.match(
    source,
    /onClick=\{\(\) => handleToggleReviewed\(company\._id, company\.isReviewed\)\}[\s\S]*\{company\.isReviewed === false \? "Not reviewed" : "Reviewed"\}[\s\S]*\{confirmDelete === company\._id \?/,
    'expected Reviewed / Not reviewed action to appear before Delete controls'
  );
});

test('admin companies tab highlights recently created profiles', () => {
  const source = readProjectFile('src/app/admin/companies/page.tsx');

  assert.match(
    source,
    /const NEW_COMPANY_WINDOW_MS = 7 \* 24 \* 60 \* 60 \* 1000;/,
    'expected admin companies tab to define a recent profile window'
  );

  assert.match(
    source,
    /const isNewCompany = Date\.now\(\) - company\.createdAt <= NEW_COMPANY_WINDOW_MS && !company\.adminViewedAt;[\s\S]*bg-\[#f14110\]\/5[\s\S]*New profile/,
    'expected recently created unseen companies to have a visible orange marker'
  );

  assert.match(
    source,
    /const handleOpenCompany = async \(id: string\) => \{[\s\S]*adminViewedAt: Date\.now\(\)[\s\S]*onClick=\{\(\) => \{ void handleOpenCompany\(company\._id\); \}\}/,
    'expected clicking the company name to mark the recent-profile differentiator as seen'
  );
});

test('admin companies tab displays all active company categories', () => {
  const source = readProjectFile('src/app/admin/companies/page.tsx');

  assert.match(
    source,
    /function getCompanyCategories[\s\S]*constructionTypes[\s\S]*renovationTypes[\s\S]*architectureTypes[\s\S]*interiorTypes[\s\S]*realEstateTypes/,
    'expected admin companies tab to derive categories from every active category array'
  );

  assert.match(
    source,
    /const categoryLabels = getCompanyCategories\(company\);[\s\S]*\{categoryLabels\.join\(", "\)\}/,
    'expected admin companies table to display multiple categories for one company'
  );
});

test('company reviewed status is stored on company records and accepted by mutations', () => {
  const schemaSource = readProjectFile('convex/schema.ts');
  const mutationSource = readProjectFile('convex/companies.ts');

  assert.match(
    schemaSource,
    /isReviewed: v\.optional\(v\.boolean\(\)\)[\s\S]*adminViewedAt: v\.optional\(v\.number\(\)\)/,
    'expected company schema to store reviewed status and admin seen state'
  );

  assert.match(
    mutationSource,
    /isReviewed: v\.optional\(v\.boolean\(\)\)/,
    'expected company create and update mutations to accept reviewed status'
  );
});
