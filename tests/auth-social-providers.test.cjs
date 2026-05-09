const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('public auth modal offers only Google and email sign-in methods', () => {
  const source = readProjectFile('src/components/AuthModal.tsx');

  assert.match(
    source,
    /label="Continue with Google"[\s\S]*onClick=\{\(\) => handleSocialAuth\("oauth_google"\)\}/,
    'expected Google social auth to remain available'
  );

  assert.match(
    source,
    /Continue with email/,
    'expected email auth to remain available'
  );

  assert.doesNotMatch(
    source,
    /Continue with Apple|Continue with Microsoft|oauth_apple|oauth_microsoft|AppleIcon|MicrosoftIcon/,
    'expected Apple and Microsoft social auth to be removed from the public auth modal'
  );
});

test('email verification popup shows the target email 4px larger', () => {
  const source = readProjectFile('src/components/AuthModal.tsx');

  assert.match(
    source,
    /We sent a verification code to<br \/><strong style=\{\{ color: '#333', fontSize: '13px' \}\}>\{email\}<\/strong>/,
    'expected the verification email address to be 13px, four pixels larger than the 9px helper text'
  );
});
