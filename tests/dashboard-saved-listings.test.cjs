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

test('individual dashboard shows the most recent four bookmarks on desktop and uses see-all for overflow', () => {
  const source = readProjectFile('src/app/dashboard/page.tsx');

  assert.match(
    source,
    /const DASHBOARD_CATEGORY_PAGE_SIZE = 4;/,
    'expected dashboard sections to keep four visible desktop cards per page'
  );

  assert.match(
    source,
    /return b\.savedAt - a\.savedAt;/,
    'expected the default recent sort to use bookmark chronology'
  );

  assert.match(
    source,
    /const desktopListings = sortedListings\.slice\(0, DASHBOARD_CATEGORY_PAGE_SIZE\);/,
    'expected the desktop overview grid to show only the first four sorted saved listings'
  );

  assert.doesNotMatch(
    source,
    /NEXT →|← PREVIOUS|setCategoryPages/,
    'expected the overview dashboard to remove next/previous paging controls'
  );

  assert.match(
    source,
    /<div className="hidden sm:flex items-center justify-end mt-4">[\s\S]*See all/,
    'expected the see-all button to remain desktop-only when a category has more than four bookmarks'
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

test('individual dashboard saved-listing sorts are A to Z and Recent only', () => {
  const source = readProjectFile('src/app/dashboard/page.tsx');
  const categorySource = readProjectFile('src/app/dashboard/[category]/page.tsx');
  const dropdownSource = readProjectFile('src/components/SortDropdown.tsx');

  assert.match(
    source,
    /Sort by: A > Z[\s\S]*Sort by: Recent/,
    'expected the overview dashboard to offer the requested saved-listing sort options'
  );

  assert.match(
    categorySource,
    /Sort by: A > Z[\s\S]*Sort by: Recent/,
    'expected the category dashboard to offer the requested saved-listing sort options'
  );

  assert.match(
    dropdownSource,
    /options = allSortOptions/,
    'expected SortDropdown to support dashboard-specific options without changing homepage defaults'
  );

  assert.doesNotMatch(
    source,
    /Favorite|Sort by: Latest/,
    'expected the overview dashboard saved-listing sort UI to remove Favorite and Latest'
  );

  assert.doesNotMatch(
    categorySource,
    /Favorite|Sort by: Latest/,
    'expected the category dashboard saved-listing sort UI to remove Favorite and Latest'
  );
});

test('individual dashboard intro copy spans the mobile content width', () => {
  const source = readProjectFile('src/app/dashboard/page.tsx');

  assert.match(
    source,
    /<div className="flex items-start justify-between gap-4">[\s\S]*\{user\.email\}[\s\S]*<\/div>\s*<p className="font-bam text-\[10px\][^"]*w-full sm:max-w-\[440px\]"/,
    'expected intro copy to live below the name/email row and use full mobile width'
  );
});
