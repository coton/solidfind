const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const editPagePath = path.join(projectRoot, 'src/app/company-dashboard/edit/page.tsx');
const dashboardPagePath = path.join(projectRoot, 'src/app/company-dashboard/page.tsx');

function read(relativePath) {
  return fs.readFileSync(relativePath, 'utf8');
}

test('company edit page keeps imported external media visible and editable', () => {
  const source = read(editPagePath);

  assert.match(
    source,
    /setProjectImageUrls\(company\.projectImageUrls \?\? \[\]\);/,
    'Expected the edit page to hydrate imported external project image URLs from the company record'
  );

  assert.match(
    source,
    /const totalProjectImages = projectImageUrls\.length \+ projectImageIds\.length;/,
    'Expected upload slot calculations to account for both imported external URLs and uploaded storage images'
  );

  assert.match(
    source,
    /updateCompany\(\{ id: company\._id, projectImageIds: newIds, projectImageUrls \}\);/,
    'Expected project image uploads to preserve previously imported external URLs when saving'
  );

  assert.match(
    source,
    /updateCompany\(\{ id: company\._id, projectImageIds, projectImageUrls: nextExternalUrls \}\);/,
    'Expected removing an imported external image to keep storage-backed images untouched'
  );

  assert.match(
    source,
    /updateCompany\(\{ id: company\._id, projectImageIds: nextStorageIds, projectImageUrls: projectImageUrls \}\);/,
    'Expected removing an uploaded storage image to keep imported external URLs untouched'
  );

  assert.match(
    source,
    /const logoPreviewUrl = logoUrl \?\? company\?\.imageUrl;/,
    'Expected the edit page logo preview to fall back to imported external company logos'
  );
});

test("company dashboard mirrors the individual dashboard greeting UI with a Hello label and company name heading", () => {
  const source = read(dashboardPagePath);

  assert.match(
    source,
    /<p className="text-\[11px\] text-\[#333\]\/70 tracking-\[0\.22px\]">Hello<\/p>/,
    "Expected the company dashboard to render the same small Hello label used on the individual dashboard"
  );

  assert.match(
    source,
    /<h1 className="text-\[32px\] font-bold text-\[#333\] tracking-\[0\.64px\] mb-0">\s*\{data\.name\}\s*<\/h1>/,
    "Expected the company dashboard heading to render the company name in its own line"
  );

  assert.doesNotMatch(
    source,
    /Hello \{data\.name\}/,
    "Expected the old combined Hello + company name heading to be removed"
  );
});
