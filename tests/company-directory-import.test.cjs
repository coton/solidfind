const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const importer = require(path.join(projectRoot, 'src/lib/company-directory-import.cjs'));

test('normalizeCompanyDirectoryRow maps the provided test row into a complete SolidFind company payload', () => {
  const row = {
    'Company Name': 'Balitecture',
    'Phone Number': '+62 361 934 8510',
    Email: 'info@balitecture.com',
    'Password Format': 'Bali851A',
    Website: 'https://www.balitecture.com',
    Description: 'Balitecture is an Australian-owned leading villa developer in Bali.',
    Facebook: 'https://www.facebook.com/balitecture/',
    WhatsApp: '628113909045',
    LinkedIn: 'https://www.linkedin.com/company/balitecture',
    Instagram: 'https://www.instagram.com/balitecture',
    Projects: '',
    'Team Size': '',
    'Since Year': '',
    Address: 'Jl. Raya Seminyak No.17, Seminyak, Kuta, Kabupaten Badung, Bali 80361',
    'Google Maps Link': 'https://maps.google.com/?q=Balitecture+Seminyak+Bali',
    'Company Logo ': 'https://logo.clearbit.com/balitecture.com',
    'Picture 1 URL': 'https://example.com/p1.webp',
    'Picture 2 URL': 'https://example.com/p2.webp',
    'Picture 3 URL': 'https://example.com/p3.jpg',
    'Picture 4 URL': 'https://example.com/p4.webp',
    Provinces: 'BADUNG, Tabanan',
    Categories: 'ANY TYPE',
  };

  const normalized = importer.normalizeCompanyDirectoryRow(row, {
    sourceName: 'Living_id_Construction_Directory_TEST.csv',
  });

  assert.equal(normalized.name, 'Balitecture');
  assert.equal(normalized.email, 'info@balitecture.com');
  assert.equal(normalized.password, 'Bali851A');
  assert.equal(normalized.primaryCategory, 'construction');
  assert.deepEqual(normalized.locationSelections, ['badung', 'tabanan']);
  assert.deepEqual(normalized.projectSizes, ['any']);
  assert.deepEqual(normalized.constructionTypes, ['all']);
  assert.deepEqual(normalized.renovationTypes, []);
  assert.equal(normalized.location, 'badung');
  assert.equal(normalized.imageUrl, 'https://logo.clearbit.com/balitecture.com');
  assert.deepEqual(normalized.projectImageUrls, [
    'https://example.com/p1.webp',
    'https://example.com/p2.webp',
    'https://example.com/p3.jpg',
    'https://example.com/p4.webp',
  ]);
  assert.equal(normalized.googleMapsLink, 'https://maps.google.com/?q=Balitecture+Seminyak+Bali');
});

test('mapCategorySelections keeps filter keyword categories instead of collapsing them into one raw string', () => {
  const normalized = importer.normalizeCompanyDirectoryRow(
    {
      'Company Name': 'Keyword Builder',
      Email: 'keywords@example.com',
      'Password Format': 'Test1234',
      Provinces: 'Badung',
      Categories: 'Residential, Commercial',
    },
    { sourceName: 'Living_id_Construction_Directory_TEST.csv' }
  );

  assert.equal(normalized.primaryCategory, 'construction');
  assert.deepEqual(normalized.constructionTypes, ['residential', 'commercial']);
});

test('loadRowsFromFile preserves empty spreadsheet columns when parsing xlsx uploads', () => {
  const rows = importer.loadRowsFromFile(
    path.join(projectRoot, '..', '..', '3_assets', 'Living_id_Construction_Directory_TEST.xlsx')
  );

  assert.equal(rows.length, 1);
  assert.equal(rows[0]['Company Name'], 'Balitecture');
  assert.equal(rows[0]['Phone Number'], '+62 361 934 8510');
  assert.equal(rows[0].Projects, '');
  assert.equal(rows[0]['Team Size'], '');
  assert.equal(rows[0]['Since Year'], '');
  assert.equal(rows[0].Address, 'Jl. Raya Seminyak No.17, Seminyak, Kuta, Kabupaten Badung, Bali 80361');
  assert.equal(rows[0]['Company Logo '], 'https://logo.clearbit.com/balitecture.com');
  assert.equal(rows[0].Provinces, 'BADUNG, Tabanan');
  assert.equal(rows[0].Categories, 'ANY TYPE');
});

test('parseDelimitedCell normalizes casing, trims whitespace, and drops blanks', () => {
  assert.deepEqual(
    importer.parseDelimitedCell(' BADUNG, Tabanan ,, GIANYAR '),
    ['badung', 'tabanan', 'gianyar']
  );
});

test('inferPrimaryCategory falls back to filename when the row only provides a subcategory label', () => {
  assert.equal(
    importer.inferPrimaryCategory({
      sourceName: 'Living_id_Construction_Directory_TEST.xlsx',
      rowCategoryValue: 'ANY TYPE',
    }),
    'construction'
  );
});

test('buildCompanyMutationPayload keeps every import-relevant profile field, including external image URLs', () => {
  const payload = importer.buildCompanyMutationPayload({
    name: 'Balitecture',
    description: 'Desc',
    primaryCategory: 'construction',
    location: 'badung',
    address: 'Address',
    googleMapsLink: 'https://maps.google.com/?q=Balitecture+Seminyak+Bali',
    isPro: false,
    projects: undefined,
    teamSize: undefined,
    phone: '+62 361 934 8510',
    email: 'info@balitecture.com',
    website: 'https://www.balitecture.com',
    whatsapp: '628113909045',
    facebook: 'https://www.facebook.com/balitecture/',
    linkedin: 'https://www.linkedin.com/company/balitecture',
    instagram: 'https://www.instagram.com/balitecture',
    since: undefined,
    imageUrl: 'https://logo.clearbit.com/balitecture.com',
    projectImageUrls: ['https://example.com/p1.webp'],
    projectSizes: ['any'],
    constructionTypes: ['all'],
    constructionLocations: ['badung', 'tabanan'],
    renovationTypes: [],
    renovationLocations: ['badung', 'tabanan'],
    architectureTypes: [],
    architectureLocations: ['badung', 'tabanan'],
    interiorTypes: [],
    interiorLocations: ['badung', 'tabanan'],
    realEstateTypes: [],
    realEstateLocations: ['badung', 'tabanan'],
  });

  assert.equal(payload.imageUrl, 'https://logo.clearbit.com/balitecture.com');
  assert.equal(payload.googleMapsLink, 'https://maps.google.com/?q=Balitecture+Seminyak+Bali');
  assert.deepEqual(payload.projectImageUrls, ['https://example.com/p1.webp']);
  assert.deepEqual(payload.projectSizes, ['any']);
  assert.deepEqual(payload.constructionTypes, ['all']);
});
