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

test('company edit page stays on the editor after saving profile changes', () => {
  const source = read(editPagePath);
  const handleSaveStart = source.indexOf('const handleSave = async () => {');
  const maxImagesStart = source.indexOf('const maxImages = company?.isPro ? 12 : 4;');

  assert.ok(handleSaveStart !== -1, 'Expected the edit page save handler to exist');
  assert.ok(maxImagesStart !== -1, 'Expected the edit page image-slot section to follow the save handler');

  const handleSaveSource = source.slice(handleSaveStart, maxImagesStart);

  assert.match(
    handleSaveSource,
    /setIsDirty\(false\);/,
    'Expected saving to still mark the form as clean'
  );

  assert.doesNotMatch(
    handleSaveSource,
    /router\.push\("\/company-dashboard"\)|router\.replace\("\/company-dashboard"\)/,
    'Expected saving profile edits to stay on the edit page instead of redirecting to the dashboard'
  );
});

test('company edit page keeps legacy location field in sync with selected locations', () => {
  const source = read(editPagePath);

  assert.match(
    source,
    /location: selectedLocations\.join\(","\) \|\| undefined,[\s\S]*constructionLocations: selectedLocations,[\s\S]*renovationLocations: selectedLocations,[\s\S]*architectureLocations: selectedLocations,[\s\S]*interiorLocations: selectedLocations,[\s\S]*realEstateLocations: selectedLocations,/,
    'Expected saving company edits to update both the legacy location field and category location arrays'
  );
});

test('company edit page validates address format before saving', () => {
  const source = read(editPagePath);

  assert.match(
    source,
    /import \{ COMPANY_ADDRESS_VALIDATION_MESSAGE, isLikelyCompanyAddress, normalizeCompanyAddress \} from "@\/lib\/company-address-validation\.mjs";/,
    'Expected company edit page to use the shared address validator'
  );

  assert.match(
    source,
    /const normalizedAddress = normalizeCompanyAddress\(address\);[\s\S]*const invalidAddress = Boolean\(normalizedAddress && !isLikelyCompanyAddress\(normalizedAddress\)\);/,
    'Expected company edit page to detect invalid non-empty addresses'
  );

  assert.match(
    source,
    /const canSave = hasCategory && !missingProjectSize && !missingLocation && !missingDescription && !missingAddress && !invalidAddress && !invalidFoundedYear;/,
    'Expected invalid addresses to block saving'
  );

  assert.match(
    source,
    /address: normalizedAddress \|\| undefined/,
    'Expected saved company addresses to be normalized before mutation'
  );

  assert.match(
    source,
    /aria-invalid=\{invalidAddress\}/,
    'Expected address input to expose invalid state to the UI'
  );
});

test('company edit page only accepts four-digit founded years from 1980 to present', () => {
  const source = read(editPagePath);

  assert.match(
    source,
    /import \{ MIN_COMPANY_SINCE_YEAR, getMaxCompanySinceYear, isValidCompanySinceYear, normalizeCompanySinceYearInput \} from "@\/lib\/company-since-year-validation\.mjs";/,
    'Expected company edit page to use the shared founded-year validator'
  );

  assert.match(
    source,
    /const invalidFoundedYear = Boolean\(foundedYear && !isValidCompanySinceYear\(foundedYear, maxCompanySinceYear\)\);/,
    'Expected company edit page to reject out-of-range or incomplete founded years'
  );

  assert.match(
    source,
    /const canSave = hasCategory && !missingProjectSize && !missingLocation && !missingDescription && !missingAddress && !invalidAddress && !invalidFoundedYear;/,
    'Expected invalid founded years to block saving'
  );

  assert.match(
    source,
    /type="text"[\s\S]*inputMode="numeric"[\s\S]*pattern="\[0-9\]\{4\}"[\s\S]*maxLength=\{4\}/,
    'Expected the founded year field to accept only four numeric characters'
  );

  assert.match(
    source,
    /setFoundedYear\(normalizeCompanySinceYearInput\(e\.target\.value\)\);/,
    'Expected founded year input to strip non-digits and cap at four characters'
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

test("company dashboard testimonial score matches the public profile typography", () => {
  const source = read(dashboardPagePath);

  assert.match(
    source,
    /import \{ starColor \} from "@\/lib\/starColors";/,
    "Expected the company dashboard to use the same testimonial star color helper as the public profile"
  );

  assert.match(
    source,
    /<svg width="16" height="15" viewBox="0 0 18 17"[\s\S]*M7\.93511 0\.71955[\s\S]*fill=\{starColor\(data\.rating\)\}/,
    "Expected the company dashboard testimonial score to use the same custom star shape as the public profile"
  );

  assert.match(
    source,
    /<span className="font-bam text-\[18px\] font-bold tracking-\[-0\.2em\]" style=\{\{ color: starColor\(data\.rating\) \}\}>\{data\.rating\}<\/span>/,
    "Expected the company dashboard score to use the JetBrains-backed font-bam profile typography"
  );

  assert.match(
    source,
    /<span className="text-\[10px\] tracking-\[0\.2px\]" style=\{\{ color: starColor\(data\.rating\) \+ 'B3' \}\}>\(\{data\.reviewCount\}\)<\/span>/,
    "Expected the company dashboard review count to use the same small tracked formatting as the public profile"
  );
});
