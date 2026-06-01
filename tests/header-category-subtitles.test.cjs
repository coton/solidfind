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
    /<div className="h-\[330px\] sm:h-\[220px\]" aria-hidden="true" \/>[\s\S]*<header className="fixed top-0 left-0 right-0 z-40 p-\[10px\]">[\s\S]*<div className="relative rounded-\[6px\]">/,
    'expected the shared header to reserve page space while the visible header remains fixed in a 10px framed gutter'
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
