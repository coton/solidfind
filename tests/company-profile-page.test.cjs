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
    /<span className="font-bam text-\[18px\] font-bold tracking-\[-0\.2em\]"[\s\S]*\{company\.rating \?\? 0\}/,
    'Expected the company profile testimonial score to use the project mono font, bold weight, 18px size, and 20% tightened tracking'
  );

  assert.match(
    source,
    /<svg width="16" height="15" viewBox="0 0 18 17"[\s\S]*M7\.93511 0\.71955/,
    'Expected the company profile testimonial score to use the supplied star SVG shape at 16px width'
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

test('company profile mobile actions sit directly below the company picture', () => {
  const source = readProfilePage();

  assert.match(
    source,
    /\/\* Mobile only: Save\/Share\/Report directly below the company picture \*\/[\s\S]*className="mt-3 flex lg:hidden items-center gap-2"/,
    'Expected mobile bookmark/share/report actions to render directly below the company picture'
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
    /className="flex flex-col mt-auto -translate-y-3 lg:translate-y-0"/,
    'Expected the address block to move up on mobile only while preserving the desktop position'
  );

  assert.match(
    source,
    /WebkitLineClamp: 3/,
    'Expected the company address display to be clamped to three lines'
  );
});
