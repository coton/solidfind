const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('companies mutations accept import-owned fields for directory onboarding', () => {
  const source = readProjectFile('convex/companies.ts');

  assert.match(
    source,
    /ownerId: v\.optional\(v\.id\("users"\)\)/,
    'expected companies.update to support reassigning a seeded company to the imported owner user'
  );

  assert.match(
    source,
    /imageUrl: v\.optional\(v\.string\(\)\)/,
    'expected companies mutations to accept an external logo URL fallback from the directory file'
  );

  assert.match(
    source,
    /logoId: v\.optional\(v\.id\("_storage"\)\)/,
    'expected companies mutations to accept a stored logo ID when imported remote media is uploaded into Convex storage'
  );

  assert.match(
    source,
    /projectImageIds: v\.optional\(v\.array\(v\.id\("_storage"\)\)\)/,
    'expected companies mutations to accept stored project image IDs when imported remote media is uploaded into Convex storage'
  );

  assert.match(
    source,
    /projectImageUrls: v\.optional\(v\.array\(v\.string\(\)\)\)/,
    'expected companies mutations to accept external project image URLs from the directory file'
  );

  assert.match(
    source,
    /googleMapsLink: v\.optional\(v\.string\(\)\)/,
    'expected companies mutations to accept the imported Google Maps URL used by the public profile address link'
  );

  assert.match(
    source,
    /isReviewed: v\.optional\(v\.boolean\(\)\)/,
    'expected companies mutations to accept reviewed status for imported/manual listings'
  );
});

test('companies mutations cap free profiles at four project images', () => {
  const source = readProjectFile('convex/companies.ts');

  assert.match(
    source,
    /const FREE_PROJECT_IMAGE_LIMIT = 4;/,
    'expected free company profiles to have a backend project image limit'
  );

  assert.match(
    source,
    /function capFreeProjectImages[\s\S]*if \(args\.isPro === true\)[\s\S]*FREE_PROJECT_IMAGE_LIMIT/,
    'expected Pro profiles to be the only profiles allowed past the free image cap'
  );

  assert.match(
    source,
    /filtered\.projectImageIds = cappedProjectImages\.projectImageIds;[\s\S]*filtered\.projectImageUrls = cappedProjectImages\.projectImageUrls;/,
    'expected company updates to enforce the same free image cap as imports'
  );
});
