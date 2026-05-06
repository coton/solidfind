/* eslint-disable @typescript-eslint/no-require-imports */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('auth modal portals to the document body so footer account login overlays the whole page', () => {
  const source = readProjectFile('src/components/AuthModal.tsx');

  assert.match(
    source,
    /import \{ createPortal \} from "react-dom";/,
    'expected AuthModal to use a portal instead of rendering inside footer/header stacking contexts'
  );

  assert.match(
    source,
    /createPortal\(shell, portalElement\)/,
    'expected the modal shell to be portaled to document.body'
  );
});

test('individual dashboard pages saved listing sections on desktop', () => {
  const source = readProjectFile('src/app/dashboard/page.tsx');

  assert.match(
    source,
    /const DASHBOARD_CATEGORY_PAGE_SIZE = 4;/,
    'expected dashboard sections to keep four visible desktop cards per page'
  );

  assert.match(
    source,
    /const desktopListings = cat\.listings\.slice\(pageStart, pageStart \+ DASHBOARD_CATEGORY_PAGE_SIZE\);/,
    'expected the desktop grid to show the current saved-listings page instead of always the first four'
  );

  assert.match(
    source,
    /setCategoryPages\(\(prev\) => \(\{ \.\.\.prev, \[cat\.id\]: Math\.min\(totalPages, currentPage \+ 1\) \}\)\)/,
    'expected the Next button to advance to the remaining saved listings'
  );
});

test('individual dashboard keeps saved listing metadata under the category title and confines mobile swipes to rows', () => {
  const source = readProjectFile('src/app/dashboard/page.tsx');
  const categorySource = readProjectFile('src/app/dashboard/[category]/page.tsx');

  assert.match(
    source,
    /<h2 className="mb-2 text-\[24px\][\s\S]*\{cat\.label\}[\s\S]*\{cat\.listings\.length\.toString\(\)\.padStart\(2, '0'\)\} Listings Saved[\s\S]*Sort by:/,
    'expected dashboard sections to place saved count and sort controls below the category title'
  );

  assert.match(
    source,
    /sm:hidden overflow-x-auto overscroll-x-contain scrollbar-hide -mx-4 px-4/,
    'expected mobile dashboard rows to scroll horizontally without moving the whole page'
  );

  assert.match(
    categorySource,
    /<h1 className="text-\[24px\][\s\S]*\{categoryLabel\}[\s\S]*\{totalCount\.toString\(\)\.padStart\(2, "0"\)\} Listings Saved[\s\S]*<SortDropdown/,
    'expected category dashboard pages to keep saved count and sort controls below the category title'
  );

  assert.match(
    categorySource,
    /sm:hidden overflow-x-auto overscroll-x-contain scrollbar-hide -mx-4 px-4/,
    'expected category dashboard mobile rows to use contained horizontal scrolling'
  );
});
