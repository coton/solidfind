const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const profilePagePath = path.join(projectRoot, 'src/app/profile/[id]/ProfilePageClient.tsx');

function readProfilePage() {
  return fs.readFileSync(profilePagePath, 'utf8');
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
