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

test('about page uses the profile email icon treatment and right-aligns the contact icons under the profile image', () => {
  const aboutSource = readProjectFile('src/app/about/page.tsx');

  assert.match(
    aboutSource,
    /className="text-\[#333\] hover:text-\[#f14110\] transition-colors flex items-center h-\[20px\]"/,
    'expected the About page email icon to use the same black-to-orange hover treatment as company profiles'
  );

  assert.match(
    aboutSource,
    /<rect x="1" y="1" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="2"/,
    'expected the About page email icon to use a currentColor inline SVG'
  );

  assert.match(
    aboutSource,
    /className="flex w-\[180px\] justify-start gap-4 sm:w-\[200px\]"/,
    'expected the About page contact icon row to align to the left edge of the profile picture'
  );
});

test('about page exposes an EN ID language switch and localized platform settings', () => {
  const aboutSource = readProjectFile('src/app/about/page.tsx');

  assert.match(
    aboutSource,
    /type AboutLanguage = "en" \| "id"/,
    'expected the public About page to keep language state for EN and ID'
  );

  assert.match(
    aboutSource,
    /ABOUT_ID_SETTING_SUFFIX[\s\S]*aboutPageTagline\$\{ABOUT_ID_SETTING_SUFFIX\}[\s\S]*aboutPageDescription\$\{ABOUT_ID_SETTING_SUFFIX\}[\s\S]*aboutPageIndividual\$\{ABOUT_ID_SETTING_SUFFIX\}[\s\S]*aboutPageFreeCompany\$\{ABOUT_ID_SETTING_SUFFIX\}[\s\S]*aboutPageProCompany\$\{ABOUT_ID_SETTING_SUFFIX\}[\s\S]*aboutPageContact\$\{ABOUT_ID_SETTING_SUFFIX\}/,
    'expected the public About page to read Indonesian About content settings'
  );

  assert.match(
    aboutSource,
    /option\.toUpperCase\(\)/,
    'expected the public About page language switch to render EN and ID labels'
  );
});

test('about page indents admin-authored bullet lines including real bullet characters', () => {
  const aboutSource = readProjectFile('src/app/about/page.tsx');

  assert.ok(
    aboutSource.includes('[-•▪*]\\s+(.+)'),
    'expected the About page text formatter to recognize typed bullet characters as list lines'
  );

  assert.match(
    aboutSource,
    /className=\{`\$\{className\} pl-8`\}/,
    'expected About page bullet lines to render with a visible four-space-style indent'
  );
});

test('footer About links preserve the current page and query filters for the About back link', () => {
  const footerSource = readProjectFile('src/components/Footer.tsx');
  const aboutSource = readProjectFile('src/app/about/page.tsx');

  assert.match(
    footerSource,
    /usePathname/,
    'expected Footer to read the current path before building the About link'
  );

  assert.match(
    footerSource,
    /setAboutHref\(window\.location\.pathname === "\/about" \? currentPath : `\/about\?from=\$\{encodeURIComponent\(currentPath\)\}`\)/,
    'expected Footer About link to carry the current route and filters in a from parameter'
  );

  assert.match(
    aboutSource,
    /new URLSearchParams\(window\.location\.search\)\.get\("from"\)/,
    'expected About back button to return to the preserved source page when provided'
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
    /Company Account description \(\$\{aboutPageLanguage\.toUpperCase\(\)\}\)/,
    'expected the Back Office UI tab to edit Company Account description per language'
  );

  assert.match(
    adminUiSource,
    /aboutPageTaglineId[\s\S]*aboutPageDescriptionId[\s\S]*aboutPageIndividualId[\s\S]*aboutPageFreeCompanyId[\s\S]*aboutPageProCompanyId[\s\S]*aboutPageContactId/,
    'expected the Back Office UI tab to save Indonesian About page content'
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
