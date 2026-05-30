const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('listing cards hide zero-review scores and use refined score/bookmark styling', () => {
  const source = readProjectFile('src/components/cards/ListingCard.tsx');

  assert.match(
    source,
    /reviewCount = 0/,
    'expected listing cards to default to no reviews instead of showing a fake review score'
  );

  assert.match(
    source,
    /const shouldShowRating = reviewsEnabled && reviewCount > 0;/,
    'expected listing cards to hide the review score when there are zero reviews'
  );

  assert.match(
    source,
    /shouldShowRating && <div[\s\S]*<span className="font-bam text-\[11px\] font-bold leading-\[15px\] tracking-\[-0\.2em\] text-right"/,
    'expected listing card review score text to be mono, bold, 2px smaller, and tightened by 20%'
  );

  assert.match(
    source,
    /<svg width="16" height="15" viewBox="0 0 18 17"[\s\S]*M7\.93511 0\.71955/,
    'expected listing card scores to use the supplied star SVG shape at 16px width'
  );

  assert.match(
    source,
    /className="absolute top-\[10px\] right-\[10px\] origin-top-right scale-90 hover:opacity-70 transition-opacity"[\s\S]*<svg width="16" height="21"/,
    'expected the normal-state bookmark button icon to render at 16px width'
  );

  assert.match(
    source,
    /className="absolute top-\[10px\] right-\[10px\] origin-top-right scale-90 hover:opacity-80 transition-opacity"[\s\S]*<svg width="16" height="21"/,
    'expected the hover-state bookmark button icon to render at 16px width'
  );
});

test('listing card hover state shows service locations instead of address', () => {
  const source = readProjectFile('src/components/cards/ListingCard.tsx');

  assert.match(
    source,
    /const serviceLocations = getServiceLocations/,
    'expected listing cards to derive service locations for the hover state'
  );

  assert.match(
    source,
    /font-bam text-\[11px\] text-\[#d8d8d8\][\s\S]*Projects[\s\S]*font-bam text-\[11px\] text-\[#d8d8d8\][\s\S]*Team[\s\S]*font-bam text-\[11px\] text-\[#d8d8d8\][\s\S]*Services Location:/,
    'expected hover labels to share Basically A Mono, color, and the increased 11px size'
  );

  assert.match(
    source,
    /Services Location:/,
    'expected hover state to label the service location section'
  );

  assert.match(
    source,
    /text-\[16px\] font-semibold text-\[#d8d8d8\] leading-\[22px\][\s\S]*\{serviceLocations\}/,
    'expected service locations to render uppercase in Sora semibold at a smaller 16px size'
  );

  assert.match(
    source,
    /\{projects > 0 && <div[\s\S]*Projects[\s\S]*\{team > 0 && <div[\s\S]*Team/,
    'expected hover metrics to hide projects and team rows when their values are zero'
  );

  assert.doesNotMatch(
    source,
    /font-bam text-\[9px\][\s\S]*\{address\}/,
    'expected the hover state to stop rendering the company address'
  );
});

test('listing card treats weak external text-logo urls as missing and falls back to initials', () => {
  const source = readProjectFile('src/components/cards/ListingCard.tsx');

  assert.match(
    source,
    /function isWeakExternalLogoUrl\(url\?: string\)[\s\S]*lh3\\\.googleusercontent\\\.com\\\/sitesv/,
    'expected listing cards to reject weak imported Google Sites text-logo images'
  );

  assert.match(
    source,
    /const resolvedImageUrl = logoUrl \?\? \(isWeakExternalLogoUrl\(imageUrl\) \? undefined : imageUrl\);/,
    'expected weak external logos to render through the initials fallback'
  );
});
