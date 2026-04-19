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

test('header dropdown keeps category filter overlays anchored to the trigger and above page content', () => {
  const headerSource = readProjectFile('src/components/Header.tsx');

  assert.doesNotMatch(
    headerSource,
    /className=\{`fixed bg-white rounded-\[6px\] shadow-lg/,
    'expected dropdown menus to stop using fixed viewport positioning so they move with the trigger while scrolling'
  );

  assert.match(
    headerSource,
    /className=\{`absolute top-full mt-\[2px\] z-\[70\] bg-white rounded-\[6px\] shadow-lg/,
    'expected dropdown menus to render as anchored absolute overlays above surrounding content'
  );
});

test('header dropdown keeps category toggle switches close to their labels on mobile', () => {
  const headerSource = readProjectFile('src/components/Header.tsx');

  assert.match(
    headerSource,
    /flex items-center gap-\[5px\]/,
    'expected dropdown options to use a 5px gap between the filter label and its switch'
  );

  assert.match(
    headerSource,
    /<span className="min-w-0 flex-1 inline-flex items-center min-h-3 leading-\[14px\]">\{option\.label\}<\/span>/,
    'expected dropdown option labels to use inline flex centering so the text sits level with the switch track'
  );

  assert.doesNotMatch(
    headerSource,
    /mr-\[40px\]/,
    'expected the old oversized label-to-switch spacing to be removed'
  );
});

test('mobile categories dropdown widens to span the project size and categories buttons together', () => {
  const headerSource = readProjectFile('src/components/Header.tsx');

  assert.match(
    headerSource,
    /menuClassName=\{'min-w-\[calc\(200%\+2px\)\] max-w-none'\}/,
    'expected the mobile categories dropdown menu to widen to the combined project-size-plus-categories button width'
  );

  assert.match(
    headerSource,
    /isMobileCategoryDropdown=\{true\}/,
    'expected the mobile categories dropdown invocation to opt into the wider two-button menu width'
  );
});
