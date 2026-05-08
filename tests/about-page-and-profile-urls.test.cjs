const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('company profile URL helpers build slug-based public profile paths', async () => {
  const urls = await import(path.join(projectRoot, 'src/lib/company-profile-url.mjs'));

  assert.equal(urls.normalizeCompanySlug('Bali Design & Build'), 'bali-design-build');
  assert.equal(
    urls.buildCompanyProfilePath({ _id: 'abc123', name: 'Bali Design & Build' }),
    '/bali-design-build'
  );
  assert.equal(
    urls.buildCompanyProfilePath({ _id: 'abc123', name: 'Bali Design & Build' }, { from: 'construction' }),
    '/bali-design-build?from=construction'
  );
  assert.equal(
    urls.buildCompanyReviewsPath({ _id: 'abc123', name: 'Bali Design & Build' }),
    '/bali-design-build/reviews'
  );
});

test('about page ties the PRO account card to the platform pro_enabled switch and renames company account copy', () => {
  const aboutSource = readProjectFile('src/app/about/page.tsx');

  assert.match(
    aboutSource,
    /pro_enabled/,
    'expected the public About page to read the platform pro_enabled setting before rendering the PRO company account blurb'
  );

  assert.match(
    aboutSource,
    /COMPANY ACCOUNT/,
    'expected the About page to show COMPANY ACCOUNT instead of FREE COMPANY ACCOUNT'
  );

  assert.doesNotMatch(
    aboutSource,
    /FREE COMPANY ACCOUNT/,
    'expected the public About page heading to stop showing FREE COMPANY ACCOUNT'
  );
});

test('about page uses the shared email icon asset and right-aligns the contact icons under the profile image', () => {
  const aboutSource = readProjectFile('src/app/about/page.tsx');

  assert.match(
    aboutSource,
    /Image src="\/images\/footer-mail\.svg" alt="Email" width=\{25\} height=\{20\}/,
    'expected the About page email icon to reuse the same footer-mail asset as the rest of the website'
  );

  assert.match(
    aboutSource,
    /className="flex w-\[180px\] justify-end gap-4 sm:w-\[200px\]"/,
    'expected the About page contact icon row to align to the right edge of the profile picture'
  );
});

test('admin UI explains bold formatting for the About page description and renames company account field copy', () => {
  const adminUiSource = readProjectFile('src/app/admin/ui/page.tsx');

  assert.match(
    adminUiSource,
    /\*\*bold\*\*/,
    'expected the Back Office About page description field to document **bold** formatting support'
  );

  assert.match(
    adminUiSource,
    /Company Account description/,
    'expected the Back Office UI tab to rename Free Company Account description to Company Account description'
  );
});

test('profile consumers and metadata use slug-based company profile URL helpers', () => {
  const files = [
    'src/app/profile/[id]/page.tsx',
    'src/app/profile/[id]/ProfilePageClient.tsx',
    'src/app/profile/[id]/reviews/page.tsx',
    'src/app/company-dashboard/page.tsx',
    'src/app/company-dashboard/edit/page.tsx',
    'src/app/reviews/page.tsx',
    'src/app/admin/companies/page.tsx',
    'src/components/cards/ListingCard.tsx',
    'src/components/cards/StatsCard.tsx',
    'src/app/sitemap.ts',
  ];

  for (const file of files) {
    const source = readProjectFile(file);
    assert.match(
      source,
      /buildCompany(Profile|Reviews)Path/,
      `${file} should build public profile URLs from company names/slugs instead of raw Convex ids`
    );
  }
});
