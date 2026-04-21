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

test("company dashboard mirrors the individual dashboard greeting UI while keeping the company name clickable", () => {
  const source = read(dashboardPagePath);

  assert.match(
    source,
    /<p className="text-\[11px\] text-\[#333\]\/70 tracking-\[0\.22px\]">Hello<\/p>/,
    "Expected the company dashboard to render the same small Hello label used on the individual dashboard"
  );

  assert.match(
    source,
    /buildCompanyProfilePath, buildCompanyReviewsPath/,
    "Expected the company dashboard to import the company profile path helper so the heading can stay clickable"
  );

  assert.match(
    source,
    /<Link href=\{buildCompanyProfilePath\(company\)\} className="hover:text-\[#f14110\] transition-colors">\s*\{data\.name\}\s*<\/Link>/,
    "Expected the company name heading to remain clickable and route to the public company profile"
  );

  assert.doesNotMatch(
    source,
    /Hello \{data\.name\}/,
    "Expected the old combined Hello + company name heading to remain removed"
  );
});
