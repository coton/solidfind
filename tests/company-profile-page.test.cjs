const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const profilePagePath = path.join(projectRoot, 'src/app/profile/[id]/ProfilePageClient.tsx');
const profileReviewsPagePath = path.join(projectRoot, 'src/app/profile/[id]/reviews/page.tsx');
const companyDashboardPagePath = path.join(projectRoot, 'src/app/company-dashboard/page.tsx');

function readProfilePage() {
  return fs.readFileSync(profilePagePath, 'utf8');
}

function readProfileReviewsPage() {
  return fs.readFileSync(profileReviewsPagePath, 'utf8');
}

function readCompanyDashboardPage() {
  return fs.readFileSync(companyDashboardPagePath, 'utf8');
}

test('company profile page avoids invalid nested Convex hooks so profile content can render', () => {
  const source = readProfilePage();

  assert.doesNotMatch(
    source,
    /const getImageUrl = \(storageId: Id<"_storage">\) => \{[\s\S]*?useQuery\(/,
    'ProfilePageClient should not call useQuery inside a nested helper function'
  );

  assert.doesNotMatch(
    source,
    /for \(const id of company\?\.projectImageIds \?\? \[]\) \{[\s\S]*?useQuery\(/,
    'ProfilePageClient should not call useQuery inside a loop when building project images'
  );
});

test('company profile testimonial actions keep the 140px website button width', () => {
  const source = readProfilePage();

  const ctaMatches = source.match(/className="[^"]*Write a Testimonial[\s\S]*?style=\{\{ width: '140px', height: '40px' \}\}|className="[^"]*text-\[11px\][^"]*"[\s\S]{0,120}style=\{\{ width: '140px', height: '40px' \}\}[\s\S]{0,80}Write a Testimonial/g) ?? [];
  assert.equal(
    ctaMatches.length,
    2,
    'Expected both desktop and mobile Write a Testimonial buttons to use the standard 140px width'
  );

  assert.match(
    source,
    /Write a Testimonial[\s\S]{0,220}text-\[11px\]|text-\[11px\][\s\S]{0,220}Write a Testimonial/,
    'Expected the testimonial CTA button typography to stay aligned with the rest of the website'
  );
});

test('company profile testimonial score uses the project mono font at 18px', () => {
  const source = readProfilePage();

  assert.match(
    source,
    /\{\(company\.reviewCount \?\? 0\) > 0 && \([\s\S]*<span className="font-bam text-\[18px\] font-bold tracking-\[-0\.2em\]"[\s\S]*\{company\.rating \?\? 0\}/,
    'Expected the company profile testimonial score to use the project mono font, bold weight, 18px size, and 20% tightened tracking'
  );

  assert.match(
    source,
    /<svg width="16" height="15" viewBox="0 0 18 17"[\s\S]*M7\.93511 0\.71955/,
    'Expected the company profile testimonial score to use the supplied star SVG shape at 16px width'
  );
});

test('company profile hides testimonial score and count when there are no reviews', () => {
  const source = readProfilePage();

  assert.match(
    source,
    /\{\(company\.reviewCount \?\? 0\) > 0 && \(\s*<div className="flex items-center gap-1">[\s\S]*\{company\.rating \?\? 0\}[\s\S]*\(\{company\.reviewCount \?\? 0\}\)[\s\S]*<\/div>\s*\)\}/,
    'Expected the public profile to only show the testimonial score/count after at least one review exists'
  );

  assert.doesNotMatch(
    source,
    /<span className="font-bam text-\[18px\] font-bold tracking-\[-0\.2em\]"[\s\S]*\{company\.rating \?\? 0\}[\s\S]*<\/span>\s*<span className="text-\[10px\] tracking-\[0\.2px\]"[\s\S]*>\(\{company\.reviewCount \?\? 0\}\)<\/span>\s*<\/div>\s*<\/div>/,
    'Expected the testimonial score/count cluster to no longer render unconditionally'
  );
});

test('company profile only lets individual accounts write one testimonial per company', () => {
  const source = readProfilePage();

  assert.match(
    source,
    /const hasReviewedThisCompany = Boolean\(\s*currentUser && reviews\?\.some\(\(review\) => review\.userId === currentUser\._id\)\s*\);/,
    'Expected the profile page to detect whether the current user already reviewed this company'
  );

  assert.match(
    source,
    /const canWriteReview = reviews !== undefined && currentUser\?\.accountType === "individual" && !hasReviewedThisCompany;/,
    'Expected the Write a Testimonial CTA to be limited to individual accounts without an existing company review'
  );

  assert.doesNotMatch(
    source,
    /\{clerkUser && currentUser && \([\s\S]*Write a Testimonial/,
    'Expected company accounts and already-reviewed users to stop seeing the testimonial CTA'
  );

  assert.match(
    source,
    /\{reviewsEnabled && validId && currentUser && canWriteReview && \([\s\S]*<WriteReviewModal/,
    'Expected the testimonial modal itself to be gated behind the same individual-only review rule'
  );
});

test('company profile displays project images even when reviews are enabled', () => {
  const source = readProfilePage();

  assert.match(
    source,
    /<div className="grid grid-cols-1 gap-6 lg:grid-cols-\[440px_1fr_70px\] lg:gap-5 mb-8">[\s\S]*\{projectImages\.length > 0 && \([\s\S]*<ProjectImagesGrid[\s\S]*\/\* Mobile only: Save\/Share\/Report directly below the project thumbnails \*\//,
    'Expected project images to render in the left profile block whenever images exist'
  );

  assert.doesNotMatch(
    source,
    /\{!reviewsEnabled && \([\s\S]*<ProjectImagesGrid/,
    'Expected the project image grid to no longer be hidden by the reviews feature flag'
  );
});

test('company profile project thumbnails use the compact four-column treatment', () => {
  const source = readProfilePage();

  assert.match(
    source,
    /function ProjectImagesGrid[\s\S]*className="grid grid-cols-4 gap-2 sm:gap-3"/,
    'Expected project thumbnails to render as four compact columns'
  );

  assert.match(
    source,
    /sizes="\(max-width: 640px\) 23vw, 105px"/,
    'Expected project thumbnail image sizing to be roughly half the previous desktop thumbnail size'
  );

  assert.doesNotMatch(
    source,
    /<div className="mb-8 space-y-8">[\s\S]*<ProjectImagesGrid/,
    'Expected the old full-width thumbnail row below the description to be removed'
  );
});

test('company profile services use body-width rows with four desktop columns', () => {
  const source = readProfilePage();

  assert.match(
    source,
    /function uniqueValues\(values: string\[\]\): string\[\][\s\S]*new Set\(values\.filter\(Boolean\)\)/,
    'Expected profile service values to de-duplicate repeated category locations'
  );

  assert.match(
    source,
    /const profileLocations = uniqueValues\(\[[\s\S]*company\.constructionLocations[\s\S]*company\.renovationLocations[\s\S]*company\.architectureLocations[\s\S]*company\.interiorLocations[\s\S]*company\.realEstateLocations[\s\S]*\]\);/,
    'Expected profile location display to use the saved category location arrays from company edit'
  );

  assert.match(
    source,
    /const profileLocationValue = profileLocations\.length > 0[\s\S]*capitalizeJoin\(profileLocations\)[\s\S]*capitalizeJoin\(\[company\.location \?\? "bali"\]\)/,
    'Expected profile location display to fall back to the legacy single location only when category locations are missing'
  );

  assert.match(
    source,
    /const profileMetaServices = \[[\s\S]*PROJECT SIZE[\s\S]*LOCATION", value: profileLocationValue[\s\S]*\]\.filter\(Boolean\)/,
    'Expected project size and location to be grouped into the first services row'
  );

  assert.match(
    source,
    /const workCategoryServices = \[[\s\S]*CONSTRUCTION[\s\S]*RENOVATION[\s\S]*ARCHITECTURE[\s\S]*INTERIOR[\s\S]*REAL ESTATE[\s\S]*\]\.filter\(Boolean\)/,
    'Expected active work categories to render in order so the fifth category wraps below the first column'
  );

  assert.match(
    source,
    /className="grid grid-cols-2 gap-x-5 gap-y-5 lg:grid-cols-4"[\s\S]*profileMetaServices\.map\(\(service\) => \(/,
    'Expected project size and location to use the same four-column desktop grid width'
  );

  assert.match(
    source,
    /workCategoryServices\.map\(\(service\) => \([\s\S]*className="grid grid-cols-2 gap-x-5 gap-y-6 lg:grid-cols-4"|className="grid grid-cols-2 gap-x-5 gap-y-6 lg:grid-cols-4"[\s\S]*workCategoryServices\.map\(\(service\) => \(/,
    'Expected work categories to use a four-column desktop grid'
  );

  assert.doesNotMatch(
    source,
    /hidden lg:block space-y-4/,
    'Expected the old vertical desktop services list to be removed'
  );

  assert.doesNotMatch(
    source,
    /Services provided:/,
    'Expected the profile page to remove the Services provided label'
  );
});

test('company profile top detail rows and testimonials use the same divider treatment', () => {
  const source = readProfilePage();

  assert.match(
    source,
    /Tel\. \{company\.phone \|\| "-"\}[\s\S]{0,180}border-b border-\[#333\]\/10|border-b border-\[#333\]\/10[\s\S]{0,180}Tel\. \{company\.phone \|\| "-"\}/,
    'Expected the telephone row to use the shared subtle divider color'
  );

  assert.match(
    source,
    /<div className="h-\[32px\] flex items-center border-b border-\[#333\]\/10 mb-4">[\s\S]*WEBSITE/,
    'Expected the website row to use the shared subtle divider color'
  );

  for (const label of ['Projects', 'Team', 'Since']) {
    assert.match(
      source,
      new RegExp(`border-b border-\\[#333\\]\\/10[\\s\\S]{0,180}>${label}<`),
      `Expected the ${label} row to use the shared subtle divider color`
    );
  }

  assert.match(
    source,
    /\{reviewsEnabled && <div className="mb-8 border-t border-\[#333\]\/10 pt-4">/,
    'Expected latest testimonials to start with the same subtle divider treatment'
  );
});

test('all reviews page uses divider rows instead of white review cards', () => {
  const source = readProfileReviewsPage();

  assert.match(
    source,
    /<div key=\{review\._id\} className="border-b border-\[#333\]\/10 py-5">/,
    'Expected all reviews to render as divider rows'
  );

  assert.doesNotMatch(
    source,
    /bg-white rounded-\[6px\] p-5/,
    'Expected all reviews page to remove the white card background behind each review'
  );

  assert.match(
    source,
    /font-bam text-\[18px\] font-bold tracking-\[-0\.2em\] text-\[#f14110\]/,
    'Expected all reviews page score to use the same tightened mono score style'
  );
});

test('all reviews page aligns the score with the company name row', () => {
  const source = readProfileReviewsPage();

  assert.match(
    source,
    /<div className="mb-8">\s*<div className="flex items-center justify-between gap-4">\s*<h1 className="text-\[26px\] font-semibold text-\[#333\] leading-\[30px\]">[\s\S]*?\{company\?\.name \?\? "Loading\.\.\."\}[\s\S]*?\{company && \(\s*<div className="flex shrink-0 items-center gap-1">[\s\S]*?font-bam text-\[18px\] font-bold tracking-\[-0\.2em\] text-\[#f14110\][\s\S]*?<\/div>\s*\)\}\s*<\/div>\s*<p className="text-\[11px\] text-\[#333\]\/70 tracking-\[0\.22px\]">/,
    'Expected the all reviews score to sit on the right side of the same row as the company name, with the subtitle below'
  );
});

test('testimonial see all links only show when reviews exist', () => {
  const profileSource = readProfilePage();
  const dashboardSource = readCompanyDashboardPage();

  assert.match(
    profileSource,
    /\{\(company\.reviewCount \?\? 0\) > 0 && \([\s\S]*See all[\s\S]*<\/Link>[\s\S]*\)\}/,
    'Expected the public company profile to hide the See all testimonial link when there are zero reviews'
  );

  assert.match(
    dashboardSource,
    /\{company\?\._id && data\.reviewCount > 0 && \([\s\S]*See all[\s\S]*<\/Link>[\s\S]*\)\}/,
    'Expected the company dashboard to hide the See all testimonial link when there are zero reviews'
  );
});

test('company profile image viewer supports previous/next controls and mobile swipe navigation', () => {
  const source = readProfilePage();

  assert.match(
    source,
    /handleViewerTouchStart[\s\S]*handleViewerTouchEnd/,
    'Expected the image viewer to register touch handlers for mobile swipe navigation'
  );

  assert.match(
    source,
    /<span>Previous<\/span>[\s\S]*<span>Next<\/span>/,
    'Expected the image viewer to render previous and next navigation controls'
  );

  assert.match(
    source,
    /<span className="font-bam text-\[9px\][\s\S]*aria-label="Close image viewer"[\s\S]*<\/div>\s*<div\s*className="relative flex max-h-\[72vh\]/,
    'Expected the image viewer close button to sit top-right above the image frame'
  );

  assert.doesNotMatch(
    source,
    /className="relative flex max-h-\[72vh\][\s\S]*aria-label="Close image viewer"/,
    'Expected the image viewer close button to stay outside the image frame'
  );

  assert.doesNotMatch(
    source,
    /rounded-full border border-white[\s\S]*<span>Previous<\/span>|rounded-full border border-white[\s\S]*<span>Next<\/span>/,
    'Expected previous and next controls to render as text links without outlined pills'
  );

  assert.match(
    source,
    /inline-flex items-center gap-1\.5 text-\[11px\] font-semibold tracking-\[0\.22px\] text-white/,
    'Expected previous and next text links to use the website 11px arrow-link typography'
  );

  assert.match(
    source,
    /<path d="M1 5H15M1 5L5 1M1 5L5 9"[\s\S]*<span>Previous<\/span>[\s\S]*<span>Next<\/span>[\s\S]*<path d="M15 5H1M15 5L11 1M15 5L11 9"/,
    'Expected previous and next controls to include the website arrow icons'
  );

  assert.match(
    source,
    /hover:text-\[#f14110\][^"]*disabled:text-white\/25/,
    'Expected image viewer controls to turn orange on hover and dim when disabled'
  );

  assert.match(
    source,
    /aria-label="Close image viewer"[\s\S]*<svg width="16" height="16"/,
    'Expected the close affordance to use the reduced 16px icon size'
  );
});

test('company profile mobile actions sit directly below the project thumbnails', () => {
  const source = readProfilePage();

  assert.match(
    source,
    /\/\* Mobile only: Save\/Share\/Report directly below the project thumbnails \*\/[\s\S]*className="mt-3 flex lg:hidden items-center gap-2"/,
    'Expected mobile bookmark/share/report actions to render directly below the project thumbnails'
  );

  assert.doesNotMatch(
    source,
    /\/\* Mobile only: Save\/Share\/Report below description/,
    'Expected mobile bookmark/share/report actions to no longer render below the description'
  );
});

test('company profile image viewer hooks are registered before loading returns', () => {
  const source = readProfilePage();
  const viewerEffectIndex = source.indexOf('const handleKeyDown = (event: KeyboardEvent)');
  const loadingReturnIndex = source.indexOf('if (company === undefined)');

  assert.ok(viewerEffectIndex !== -1, 'Expected image viewer keyboard effect to exist');
  assert.ok(loadingReturnIndex !== -1, 'Expected company loading return to exist');
  assert.ok(
    viewerEffectIndex < loadingReturnIndex,
    'Expected image viewer hooks to run before loading returns so hook order stays stable after Convex data loads'
  );
});

test('company profile address stacks the pin above a three-line clamped address', () => {
  const source = readProfilePage();

  assert.match(
    source,
    /formatProfileAddress[\s\S]*PROFILE_ADDRESS_MAX_CHARS[\s\S]*\[\.\.\.\]/,
    'Expected long company addresses to be formatted with a [...] suffix'
  );

  assert.match(
    source,
    /className="group flex w-full cursor-pointer flex-col items-start gap-1\.5"/,
    'Expected the address link to stack the pin icon above the full-width address text'
  );

  assert.match(
    source,
    /className="w-full flex flex-col h-\[160px\] lg:h-\[210px\] lg:self-start"/,
    'Expected the mobile contact column to stop adding the extra vertical address padding from the desktop height'
  );

  assert.match(
    source,
    /className="flex items-center gap-5 mb-2 lg:mb-6"/,
    'Expected the mobile address to sit after one short gap below the social icons'
  );

  assert.match(
    source,
    /className="flex flex-col lg:mt-auto"/,
    'Expected the address block to move higher on mobile while preserving the desktop bottom alignment'
  );

  assert.match(
    source,
    /WebkitLineClamp: 3/,
    'Expected the company address display to be clamped to three lines'
  );
});
