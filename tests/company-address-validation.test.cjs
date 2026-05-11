const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

test('company address validator accepts normal addresses and rejects placeholder text', async () => {
  const validation = await import(path.join(projectRoot, 'src/lib/company-address-validation.mjs'));

  assert.equal(
    validation.isLikelyCompanyAddress('Jl. Raya Seminyak No.17, Seminyak, Kuta, Kabupaten Badung, Bali 80361'),
    true,
    'Expected detailed Bali street addresses to be valid'
  );

  assert.equal(
    validation.isLikelyCompanyAddress('Banjar Tanggayuda, Kedewatan, Ubud, Bali'),
    true,
    'Expected local banjar-style addresses with a place separator to be valid'
  );

  assert.equal(
    validation.isLikelyCompanyAddress('https://www.google.com/maps/place/Test+Company/@-8.65,115.21,17z'),
    true,
    'Expected Google Maps URLs to remain valid for imported company records'
  );

  assert.equal(
    validation.isLikelyCompanyAddress('sss'),
    false,
    'Expected short placeholder text to be invalid'
  );

  assert.equal(
    validation.isLikelyCompanyAddress('this is just random text'),
    false,
    'Expected generic text without street or place structure to be invalid'
  );
});

test('company mutations enforce shared address validation', () => {
  const fs = require('fs');
  const source = fs.readFileSync(path.join(projectRoot, 'convex/companies.ts'), 'utf8');

  assert.match(
    source,
    /import \{ COMPANY_ADDRESS_VALIDATION_MESSAGE, isLikelyCompanyAddress, normalizeCompanyAddress \} from "\.\.\/src\/lib\/company-address-validation\.mjs";/,
    'Expected companies mutations to import the shared address validator'
  );

  assert.match(
    source,
    /if \(normalizedAddress !== undefined && !isLikelyCompanyAddress\(normalizedAddress\)\) \{[\s\S]*throw new Error\(COMPANY_ADDRESS_VALIDATION_MESSAGE\);/,
    'Expected company creation to reject invalid addresses'
  );

  assert.match(
    source,
    /if \(updates\.address !== undefined\) \{[\s\S]*if \(!isLikelyCompanyAddress\(normalizedAddress\)\) \{[\s\S]*throw new Error\(COMPANY_ADDRESS_VALIDATION_MESSAGE\);/,
    'Expected company updates to reject invalid addresses'
  );
});
