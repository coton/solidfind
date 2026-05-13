const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('new testimonials are hidden until approved', () => {
  const source = readProjectFile('convex/reviews.ts');
  const schema = readProjectFile('convex/schema.ts');

  assert.match(
    schema,
    /approved: v\.optional\(v\.boolean\(\)\)/,
    'expected reviews to store approval state'
  );

  assert.match(
    source,
    /return reviews\.filter\(\(review\) => review\.approved !== false\);/,
    'expected public company reviews to exclude pending testimonials'
  );

  assert.match(
    source,
    /approved: false,[\s\S]*createdAt: Date\.now\(\),/,
    'expected newly-created testimonials to start pending approval'
  );

  assert.doesNotMatch(
    source,
    /await ctx\.db\.patch\(args\.companyId,\s*\{[\s\S]*reviewCount: reviews\.length/,
    'expected pending testimonials not to update public company rating/count immediately'
  );
});

test('admin testimonials tab approves reviews with a denser card layout', () => {
  const source = readProjectFile('src/app/admin/reviews/page.tsx');

  assert.match(
    source,
    /const approveReview = useMutation\(api\.reviews\.approveReview\);/,
    'expected admin testimonials tab to use the approve mutation'
  );

  assert.match(
    source,
    /type Tab = "all" \| "pending" \| "approved";[\s\S]*Pending[\s\S]*Approved/,
    'expected admin testimonials tab to filter pending and approved testimonials'
  );

  assert.match(
    source,
    /grid grid-cols-1 lg:grid-cols-2 gap-3[\s\S]*p-3/,
    'expected testimonials to use a denser two-column card layout'
  );

  assert.match(
    source,
    /review\.approved === false[\s\S]*NEW[\s\S]*Approve/,
    'expected pending testimonials to have a visual differentiator and Approve action'
  );

  assert.doesNotMatch(
    source,
    /Flag Spam|flagReview|unflagReview/,
    'expected spam flag controls to be replaced by approval controls'
  );
});
