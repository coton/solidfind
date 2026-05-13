const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('signup newsletter opt-in is saved to the admin waitlist', () => {
  const authSource = readProjectFile('src/components/AuthModal.tsx');
  const adminLayoutSource = readProjectFile('src/app/admin/layout.tsx');
  const waitlistSource = readProjectFile('src/app/admin/waitlist/page.tsx');

  assert.match(
    authSource,
    /if \(subscribeNewsletter\) \{[\s\S]*convex\.mutation\(api\.waitlist\.addToWaitlist,[\s\S]*email: email\.toLowerCase\(\)\.trim\(\)/,
    'expected signup newsletter opt-ins to be saved into the waitlist table'
  );

  assert.match(
    adminLayoutSource,
    /\{ href: "\/admin\/waitlist", label: "Waitlist", icon: Mail \}/,
    'expected newsletter/waitlist entries to be accessible from Back Office > Waitlist'
  );

  assert.match(
    waitlistSource,
    /solidfind-waitlist-[\s\S]*Export CSV/,
    'expected the waitlist admin page to support CSV export'
  );
});
