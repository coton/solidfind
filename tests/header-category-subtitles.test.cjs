const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

test('header category descriptions use the larger mobile-safe 11px mono style', () => {
  const source = fs.readFileSync(path.join(projectRoot, 'src/components/Header.tsx'), 'utf8');

  assert.match(
    source,
    /<p className="font-bam text-\[#f8f8f8\] text-\[11px\] mt-4 leading-\[15px\]">[\s\S]*dynamicSubtitles/,
    'Expected category descriptions under the header tabs to render at 11px with matching line-height'
  );
});

test('shared header scrolls with the page inside a side-only workspace gutter', () => {
  const source = fs.readFileSync(path.join(projectRoot, 'src/components/Header.tsx'), 'utf8');

  assert.match(
    source,
    /<header className="relative z-40 bg-\[#ececec\] px-\[10px\]">[\s\S]*<div className="relative z-30 rounded-\[6px\]">/,
    'expected the shared header to sit in normal page flow with side padding only'
  );

  assert.doesNotMatch(
    source,
    /fixed top-0 left-0 right-0|<div[\s\S]{0,160}aria-hidden="true"[\s\S]{0,160}\/>[\s\S]{0,80}<header|bg-gradient-to-b from-\[#ececec\] to-transparent|contentBarVisible/,
    'expected the moving header to avoid fixed positioning, spacer reservation, and the grey bottom fade'
  );
});

test('header gradient matches the footer gradient colors', () => {
  const headerSource = fs.readFileSync(path.join(projectRoot, 'src/components/Header.tsx'), 'utf8');
  const footerSource = fs.readFileSync(path.join(projectRoot, 'src/components/Footer.tsx'), 'utf8');

  assert.match(
    headerSource,
    /linear-gradient\(to right, #E9A28E, #F14110\)/,
    'expected the header gradient to use the footer color pair'
  );

  assert.match(
    footerSource,
    /linear-gradient\(to right, #E9A28E, #F14110\)/,
    'expected the footer gradient to keep the shared color pair'
  );

  assert.doesNotMatch(
    headerSource,
    /linear-gradient\(to right, #E4E4E4, #F14110\)/,
    'expected the header to stop using a separate desktop gradient'
  );
});

test('moving header keeps category tabs stable while scrolling', () => {
  const source = fs.readFileSync(path.join(projectRoot, 'src/components/Header.tsx'), 'utf8');

  assert.doesNotMatch(
    source,
    /mobileHeaderCompact|lastScrollYRef|setMobileHeaderCompact|window\.addEventListener\("scroll", requestUpdate/,
    'expected the moving header to stop auto-collapsing category tabs on scroll'
  );

  assert.match(
    source,
    /<div className=\{`max-w-\[900px\] mx-auto mb-4 sm:mb-4 \$\{useTopBarOnlyHeader \? "hidden" : useMobileCompactHeader \? "hidden sm:block" : ""\}`\}>/,
    'expected category tabs to keep a stable in-flow layout'
  );
});

test('home page can attach result count and sorting below the moving header', () => {
  const source = fs.readFileSync(path.join(projectRoot, 'src/components/Header.tsx'), 'utf8');

  assert.match(
    source,
    /type HeaderProps = \{[\s\S]*resultCount\?: number;[\s\S]*sortControl\?: ReactNode;[\s\S]*showResultsBar\?: boolean;[\s\S]*\}/,
    'expected the header to accept static results metadata from the home page'
  );

  assert.match(
    source,
    /\{showResultsBar && \([\s\S]*\{homepageResultCount\} Solid Finds[\s\S]*<SortDropdown value=\{sortBy\} onChange=\{setSortBy\} reviewsEnabled=\{reviewsEnabled\} \/>/,
    'expected results and sorting to render with the moving header'
  );
});

test('profile back navigation attaches to the moving header', () => {
  const source = fs.readFileSync(path.join(projectRoot, 'src/components/Header.tsx'), 'utf8');
  const profileSource = fs.readFileSync(path.join(projectRoot, 'src/app/profile/[id]/ProfilePageClient.tsx'), 'utf8');

  assert.match(
    source,
    /const showProfileBackBar = isProfilePage && !isDashboardPage && !showResultsBar;[\s\S]*const profileBackHref = searchParams\.get\("returnTo"\) === "dashboard" && user \? "\/dashboard" : "\/";/,
    'expected profile pages to attach a guarded back link to the persistent header'
  );

  assert.match(
    source,
    /\{showProfileBackBar && \([\s\S]*href=\{profileBackHref\}[\s\S]*<span>BACK<\/span>[\s\S]*\)\}/,
    'expected the profile back button to render inside the header area'
  );

  assert.doesNotMatch(
    profileSource,
    /Back Button Row|href=\{backHref\}[\s\S]*<span>BACK<\/span>/,
    'expected the public profile page body to stop rendering a separate back row'
  );
});

test('root and slug profile routes share persistent site chrome', () => {
  const layoutSource = fs.readFileSync(path.join(projectRoot, 'src/app/layout.tsx'), 'utf8');
  const chromeSource = fs.readFileSync(path.join(projectRoot, 'src/components/SiteChrome.tsx'), 'utf8');
  const homeSource = fs.readFileSync(path.join(projectRoot, 'src/app/page.tsx'), 'utf8');
  const profileSource = fs.readFileSync(path.join(projectRoot, 'src/app/profile/[id]/ProfilePageClient.tsx'), 'utf8');

  assert.match(
    layoutSource,
    /<SiteChrome>\{children\}<\/SiteChrome>/,
    'expected root layout to keep selected site chrome outside page transitions'
  );

  assert.doesNotMatch(
    layoutSource,
    /ViewTransitions|next-view-transitions/,
    'expected route view transitions to stay disabled so the persistent orange header does not flash as a transition bar'
  );

  assert.match(
    chromeSource,
    /if \(pathname === "\/"\) return true;[\s\S]*segments\.length === 1 && !rootNonProfilePages\.has\(segments\[0\]\)/,
    'expected homepage and root-level company profile slugs to use the same persistent chrome'
  );

  assert.doesNotMatch(homeSource, /<Header|<Footer/, 'expected homepage to avoid page-level header/footer remounts');
  assert.doesNotMatch(profileSource, /<Header|<Footer/, 'expected company profile to avoid page-level header/footer remounts');
});

test('shared footer keeps a 10px framed workspace gutter on all sides', () => {
  const source = fs.readFileSync(path.join(projectRoot, 'src/components/Footer.tsx'), 'utf8');

  assert.match(
    source,
    /<div className="p-\[10px\]">[\s\S]*<footer className="relative h-\[150px\] sm:h-\[190px\] rounded-\[6px\] overflow-hidden z-0">/,
    'expected the footer to sit inside a matching 10px frame with rounded corners'
  );
});

test('mobile profile and dashboard headers show only the top bar while desktop keeps navigation and filters', () => {
  const source = fs.readFileSync(path.join(projectRoot, 'src/components/Header.tsx'), 'utf8');

  assert.match(
    source,
    /const useMobileCompactHeader = isProfilePage \|\| isDashboardPage;/,
    'expected profile and dashboard pages to opt into the compact mobile header'
  );

  assert.doesNotMatch(
    source,
    /h-\[145px\] sm:h-\[285px\]|h-\[330px\] sm:h-\[260px\]|<div[\s\S]{0,160}aria-hidden="true"[\s\S]{0,160}\/>[\s\S]{0,80}<header/,
    'expected compact mobile pages to rely on the moving header height instead of reserved spacer blocks'
  );

  assert.match(
    source,
    /useTopBarOnlyHeader \? "flex h-\[90px\] flex-col justify-center" : useMobileCompactHeader \? "flex h-\[90px\] flex-col justify-center sm:block sm:h-auto sm:pt-6 sm:pb-4" : "pt-4 sm:pt-6 pb-\[8px\] sm:pb-4"/,
    'expected compact mobile pages to center the top-bar inside the 110px framed header'
  );

  assert.match(
    source,
    /useTopBarOnlyHeader \? "w-full justify-between gap-4 mb-0"[\s\S]*useMobileCompactHeader \? "w-full justify-between gap-4 mb-0" : "justify-between mb-8"/,
    'expected compact mobile pages to keep the same horizontal top-bar alignment as the main header'
  );

  assert.doesNotMatch(
    source,
    /max-w-\[160px\]/,
    'expected compact mobile pages to use the same logo sizing as the main header'
  );

  assert.match(
    source,
    /useTopBarOnlyHeader \? "hidden" : useMobileCompactHeader \? "hidden sm:block" : ""/,
    'expected compact mobile pages to hide category navigation on mobile while preserving it on desktop'
  );

  assert.match(
    source,
    /<div className=\{`max-w-\[900px\] mx-auto \$\{useTopBarOnlyHeader \? "hidden" : ""\}`\}>[\s\S]*className=\{`\$\{useMobileCompactHeader \? "hidden" : "flex"\} sm:hidden flex-col gap-\[2px\]`\}/,
    'expected compact mobile pages to hide mobile filters while keeping the desktop filter row available'
  );
});

test('company dashboard uses a top-bar-only header on every viewport', () => {
  const source = fs.readFileSync(path.join(projectRoot, 'src/components/Header.tsx'), 'utf8');

  assert.match(
    source,
    /const isCompanyDashboardPage = pathname\.startsWith\("\/company-dashboard"\);[\s\S]*const useTopBarOnlyHeader = isCompanyDashboardPage;/,
    'expected only company dashboard routes to opt into the top-bar-only header'
  );

  assert.doesNotMatch(
    source,
    /useTopBarOnlyHeader[\s\S]*\? "h-\[110px\]"/,
    'expected company dashboard routes to avoid a reserved fixed-header spacer'
  );

  assert.match(
    source,
    /useTopBarOnlyHeader \? "hidden" : useMobileCompactHeader \? "hidden sm:block" : ""/,
    'expected company dashboard routes to hide category tabs on desktop and mobile'
  );

  assert.match(
    source,
    /<div className=\{`max-w-\[900px\] mx-auto \$\{useTopBarOnlyHeader \? "hidden" : ""\}`\}>/,
    'expected company dashboard routes to hide all search and filter controls'
  );
});
