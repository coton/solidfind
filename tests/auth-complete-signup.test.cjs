/* eslint-disable @typescript-eslint/no-require-imports */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('auth-complete automatically persists pending OAuth signup account type choice', () => {
  const source = readProjectFile('src/app/auth-complete/page.tsx');

  assert.match(
    source,
    /pendingAccountType === "individual" \|\| pendingAccountType === "company"/,
    'expected OAuth users with a pending account type to skip the duplicate account-type chooser'
  );

  assert.match(
    source,
    /setAutoPersistAttempted\(true\);[\s\S]*persistAccountType\(pendingAccountType,/,
    'expected auth-complete to persist the pending OAuth account type automatically'
  );

  assert.match(
    source,
    /requestedNextPath \|\| "\/register-business"/,
    'expected company OAuth signups to continue into company profile setup'
  );

  assert.match(
    source,
    /if \(\(isSaving \|\| hasPendingAccountTypeChoice\) && !saveError\)/,
    'expected auth-complete to keep showing the completion state while pending OAuth account type is being saved'
  );
});

test('email signups route companies into company profile setup', () => {
  const source = readProjectFile('src/components/AuthModal.tsx');

  assert.match(
    source,
    /router\.push\(accountType === "company" \? "\/register-business" : "\/dashboard"\)/,
    'expected completed email company signups to continue into company profile setup'
  );
});

test('auth-complete fallback uses the coming-soon background treatment', () => {
  const source = readProjectFile('src/app/auth-complete/page.tsx');

  assert.match(
    source,
    /src="\/coming-soon\/bg-photo\.jpg"/,
    'expected auth-complete to use the coming-soon photo background'
  );

  assert.match(
    source,
    /className="fixed inset-\[10px\] overflow-hidden rounded-\[6px\]"/,
    'expected auth-complete background to keep the same margin and rounded corners as coming soon'
  );
});
