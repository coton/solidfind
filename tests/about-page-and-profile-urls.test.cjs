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

test('about page removes the thumbnail mail icon while keeping Instagram aligned under the profile image', () => {
  const aboutSource = readProjectFile('src/app/about/page.tsx');

  assert.doesNotMatch(
    aboutSource,
    /aria-label="Email"[\s\S]*<rect x="1" y="1" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="2"/,
    'expected the About page to stop rendering the black mail icon under the thumbnail'
  );

  assert.match(
    aboutSource,
    /<Image src="\/images\/icon-ig\.svg" alt="Instagram" width=\{20\} height=\{20\}/,
    'expected the About page Instagram icon to remain under the thumbnail'
  );

  assert.match(
    aboutSource,
    /className="flex w-\[180px\] justify-start gap-4 sm:w-\[200px\]"/,
    'expected the About page contact icon row to align to the left edge of the profile picture'
  );
});

test('about page only shows the Share label on hover', () => {
  const aboutSource = readProjectFile('src/app/about/page.tsx');

  assert.match(
    aboutSource,
    /<span className="font-bam text-\[9px\] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">Share<\/span>/,
    'expected the About page share text to be hidden until the share control is hovered or focused'
  );
});

test('about page keeps the back button aligned directly below the shared header', () => {
  const aboutSource = readProjectFile('src/app/about/page.tsx');

  assert.match(
    aboutSource,
    /<main className="max-w-\[900px\] mx-auto px-4 sm:px-0 pb-6 sm:pb-8 flex-grow w-full">/,
    'expected the About page main container to keep bottom padding without adding top padding above the back row'
  );

  assert.doesNotMatch(
    aboutSource,
    /px-4 sm:px-0 py-6 sm:py-8/,
    'expected the About page to avoid extra top padding above the back button'
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
