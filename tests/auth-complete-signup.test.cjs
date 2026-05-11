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

test('account type choice is protected after initial setup', () => {
  const usersSource = readProjectFile('convex/users.ts');
  const routeSource = readProjectFile('src/app/api/set-account-type/route.ts');

  assert.match(
    usersSource,
    /if \(existing\) \{[\s\S]*await ctx\.db\.patch\(existing\._id, \{\s*email: args\.email,\s*name: args\.name,\s*companyName: existing\.companyName \?\? args\.companyName,\s*imageUrl: args\.imageUrl,\s*\}\);[\s\S]*return existing\._id;/,
    'expected createOrGetUser to update profile fields without overwriting accountType for existing users'
  );

  assert.match(
    usersSource,
    /if \(user\.accountType !== args\.accountType\) \{[\s\S]*throw new Error\("Account type cannot be changed after setup\."\);/,
    'expected updateAccountType to reject attempts to change an established account type'
  );

  assert.match(
    routeSource,
    /const existingAccountType = user\.publicMetadata\?\.accountType;[\s\S]*existingAccountType !== accountType[\s\S]*status: 409/,
    'expected the set-account-type API to reject changing existing Clerk account type metadata'
  );

  assert.match(
    routeSource,
    /publicMetadata: \{\s*\.\.\.user\.publicMetadata,\s*accountType,/,
    'expected the set-account-type API to preserve existing metadata when saving the initial account type'
  );
});
