const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function readSource(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('app error page buttons match site CTA sizing', () => {
  const source = readSource('src/app/error.tsx');

  assert.match(
    source,
    /h-10 w-\[140px\][^"]*text-\[11px\][^"]*tracking-\[0\.22px\]/,
    'Expected Try Again to use the standard 140px, 11px button treatment'
  );

  assert.match(
    source,
    /h-10 w-\[140px\][^"]*text-\[11px\][^"]*tracking-\[0\.22px\][\s\S]*Return to Home/,
    'Expected Return to Home to use the standard 140px, 11px button treatment'
  );
});

test('global error page buttons match site CTA sizing', () => {
  const source = readSource('src/app/global-error.tsx');

  assert.equal((source.match(/width: "140px"/g) ?? []).length, 2);
  assert.equal((source.match(/height: "40px"/g) ?? []).length, 2);
  assert.equal((source.match(/fontSize: "11px"/g) ?? []).length, 2);
  assert.equal((source.match(/letterSpacing: "0.22px"/g) ?? []).length, 2);
});
