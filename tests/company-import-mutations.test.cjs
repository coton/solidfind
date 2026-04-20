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
    /projectImageUrls: v\.optional\(v\.array\(v\.string\(\)\)\)/,
    'expected companies mutations to accept external project image URLs from the directory file'
  );
});
