const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

const constructionOptions = [
  { id: 'all', label: 'ALL TYPES' },
  { id: 'residential', label: 'RESIDENTIAL' },
  { id: 'commercial', label: 'COMMERCIAL' },
  { id: 'hospitality', label: 'HOSPITALITY' },
];

test('category filter helper collapses a full child selection back to the top-level all option', async () => {
  const helpers = await import(path.join(projectRoot, 'src/lib/category-filter.mjs'));

  assert.deepEqual(
    helpers.toggleSubcategorySelection(['residential', 'commercial'], 'hospitality', constructionOptions),
    ['all']
  );
});

test('category filter helper supports toggling individual categories while clearing all-types state', async () => {
  const helpers = await import(path.join(projectRoot, 'src/lib/category-filter.mjs'));

  assert.deepEqual(
    helpers.toggleSubcategorySelection(['all'], 'commercial', constructionOptions),
    ['commercial']
  );

  assert.deepEqual(
    helpers.toggleSubcategorySelection(['commercial'], 'commercial', constructionOptions),
    []
  );
});

test('category filter helper renders the expected button label for all, single, and multi-select states', async () => {
  const helpers = await import(path.join(projectRoot, 'src/lib/category-filter.mjs'));

  assert.equal(helpers.getSubcategoryDisplayText(['all'], constructionOptions), 'ALL TYPES');
  assert.equal(helpers.getSubcategoryDisplayText(['commercial'], constructionOptions), 'COMMERCIAL');
  assert.equal(helpers.getSubcategoryDisplayText(['commercial', 'hospitality'], constructionOptions), 'CATEGORIES');
});

test('home page and header wire category filters through the shared multi-select helper', () => {
  const headerSource = readProjectFile('src/components/Header.tsx');
  const homeSource = readProjectFile('src/app/page.tsx');

  assert.match(
    headerSource,
    /toggleSubcategorySelection|multiSelect=\{true\}/,
    'expected Header category dropdown to support multi-select category behavior'
  );

  assert.match(
    homeSource,
    /subcategoryParam|selectedSubcategories/,
    'expected the homepage listing filter to read the category sub-filter state'
  );
});
