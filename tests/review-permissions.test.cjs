/* eslint-disable @typescript-eslint/no-require-imports */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('review creation is limited to individual users and one review per company', () => {
  const source = readProjectFile('convex/reviews.ts');

  assert.match(
    source,
    /const user = await ctx\.db\.get\(args\.userId\);[\s\S]*if \(!user\) \{[\s\S]*throw new Error\("User not found\."\);/,
    'Expected reviews.create to load and validate the submitting user'
  );

  assert.match(
    source,
    /if \(user\.accountType !== "individual"\) \{[\s\S]*throw new Error\("Only individual accounts can leave testimonials\."\);/,
    'Expected company accounts to be blocked from creating testimonials'
  );

  assert.match(
    source,
    /withIndex\("by_userId", \(q\) => q\.eq\("userId", args\.userId\)\)[\s\S]*existingUserReviews\.some\(\(review\) => review\.companyId === args\.companyId\)/,
    'Expected reviews.create to check whether this user already reviewed the target company'
  );

  assert.match(
    source,
    /throw new Error\("You have already left a testimonial for this company\."\);/,
    'Expected duplicate company testimonials from the same user to be rejected'
  );
});
