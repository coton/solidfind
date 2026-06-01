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

test('shared header stays fixed inside a framed workspace gutter', () => {
  const source = fs.readFileSync(path.join(projectRoot, 'src/components/Header.tsx'), 'utf8');

  assert.match(
    source,
    /className=\{useMobileCompactHeader \? "h-\[110px\] sm:h-\[220px\]" : "h-\[330px\] sm:h-\[220px\]"\} aria-hidden="true" \/>[\s\S]*<header className="fixed top-0 left-0 right-0 z-40 bg-\[#ececec\] p-\[10px\]">[\s\S]*<div className="relative rounded-\[6px\]">/,
    'expected the shared header to reserve page space while the visible header remains fixed in an opaque 10px framed gutter'
  );
});

test('mobile fixed header collapses category tabs and description while scrolling down', () => {
  const source = fs.readFileSync(path.join(projectRoot, 'src/components/Header.tsx'), 'utf8');

  assert.match(
    source,
    /const \[mobileHeaderCompact, setMobileHeaderCompact\] = useState\(false\);/,
    'expected the header to track a mobile compact state'
  );

  assert.match(
    source,
    /scrollDelta > 4[\s\S]*setMobileHeaderCompact\(true\)[\s\S]*scrollDelta < -4[\s\S]*setMobileHeaderCompact\(false\)[\s\S]*window\.addEventListener\("scroll", requestUpdate, \{ passive: true \}\);/,
    'expected mobile header compact mode to follow scroll direction'
  );

  assert.match(
    source,
    /mobileHeaderCompact[\s\S]*"max-h-0 mb-0 -translate-y-2 overflow-hidden opacity-0 pointer-events-none"[\s\S]*"max-h-\[140px\] mb-4 translate-y-0 opacity-100"/,
    'expected compact mode to hide the category tabs and category description on mobile'
  );
});

test('shared footer uses the same 10px framed workspace gutter', () => {
  const source = fs.readFileSync(path.join(projectRoot, 'src/components/Footer.tsx'), 'utf8');

  assert.match(
    source,
    /<div className="px-\[10px\] pb-\[10px\]">[\s\S]*<footer className="relative h-\[150px\] sm:h-\[190px\] rounded-\[6px\] overflow-hidden z-0">/,
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

  assert.match(
    source,
    /className=\{useMobileCompactHeader \? "h-\[110px\] sm:h-\[220px\]" : "h-\[330px\] sm:h-\[220px\]"\}/,
    'expected compact mobile pages to reserve the requested 110px header height'
  );

  assert.match(
    source,
    /useMobileCompactHeader \? "flex h-\[90px\] flex-col justify-center sm:block sm:h-auto sm:pt-6 sm:pb-4" : "pt-4 sm:pt-6 pb-\[8px\] sm:pb-4"/,
    'expected compact mobile pages to center the top-bar inside the 110px framed header'
  );

  assert.match(
    source,
    /useMobileCompactHeader \? "w-full justify-center gap-4 mb-0" : "justify-between mb-8"/,
    'expected compact mobile pages to center the mobile logo and button group horizontally'
  );

  assert.match(
    source,
    /useMobileCompactHeader \? "max-w-\[160px\] sm:max-w-none" : ""/,
    'expected compact mobile pages to cap the mobile logo width so it cannot overlap the button'
  );

  assert.match(
    source,
    /useMobileCompactHeader \? "hidden sm:block" : ""/,
    'expected compact mobile pages to hide category navigation on mobile while preserving it on desktop'
  );

  assert.match(
    source,
    /className=\{`\$\{useMobileCompactHeader \? "hidden" : "flex"\} sm:hidden flex-col gap-\[2px\]`\}/,
    'expected compact mobile pages to hide mobile filters while keeping the desktop filter row available'
  );
});
