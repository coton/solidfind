const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('homepage defaults to two grid rows and filtered search uses five rows without special cards', () => {
  const source = readProjectFile('src/app/page.tsx');

  assert.match(
    source,
    /const DEFAULT_GRID_CARD_COUNT = 8;/,
    'expected default homepage results to stay capped at two four-column rows'
  );

  assert.match(
    source,
    /const FILTERED_LISTING_CARD_COUNT = 20;/,
    'expected filtered homepage results to allow five four-column rows'
  );

  assert.match(
    source,
    /const specialCardCount = hasFilters \? 0 : 1 \+ \(visibleArticles\?\.length \?\? 1\);/,
    'expected filtered search results to remove the About and featured article cards'
  );
});

test('mobile homepage uses paginated listings instead of silently truncating to ten results', () => {
  const source = readProjectFile('src/app/page.tsx');

  assert.match(
    source,
    /const MOBILE_LISTING_CARD_COUNT = 15;/,
    'expected mobile result pages to show fifteen company cards before pagination'
  );

  assert.match(
    source,
    /const itemsPerPage = isMobileResults \? MOBILE_LISTING_CARD_COUNT : desktopItemsPerPage;/,
    'expected mobile and desktop result page sizes to be calculated separately'
  );

  assert.doesNotMatch(
    source,
    /listings\.slice\(0, 10\)/,
    'expected mobile homepage listings to stop hard-capping visible cards at ten'
  );

  assert.match(
    source,
    /sm:hidden[\s\S]*paginatedListings\.map\(\(listing\) =>/,
    'expected mobile homepage to render the same paginated result set as desktop'
  );
});

test('homepage lets the persistent site chrome own result count and sorting controls', () => {
  const source = readProjectFile('src/app/page.tsx');
  const chromeSource = readProjectFile('src/components/SiteChrome.tsx');
  const headerSource = readProjectFile('src/components/Header.tsx');

  assert.doesNotMatch(
    source,
    /<Header|<Footer/,
    'expected the homepage to stop remounting shared chrome during profile navigation'
  );

  assert.match(
    chromeSource,
    /<Header showResultsBar=\{pathname === "\/"\} \/>[\s\S]*<Footer \/>/,
    'expected the shared site chrome to keep the homepage header and footer mounted around the route content'
  );

  assert.match(
    headerSource,
    /homepageResultCount[\s\S]*<SortDropdown value=\{sortBy\} onChange=\{setSortBy\} reviewsEnabled=\{reviewsEnabled\} \/>/,
    'expected the persistent header to own the homepage result count and sorting UI'
  );

  assert.doesNotMatch(
    source,
    /\{\/\* Results Header \*\/\}/,
    'expected the old in-content results row to be removed so it cannot hide under the fixed header'
  );
});
