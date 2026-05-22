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

test('email verification popup uses 10px helper text and a larger target email', () => {
  const source = readProjectFile('src/components/AuthModal.tsx');

  assert.match(
    source,
    /<p style=\{\{ textAlign: 'center', fontSize: '10px'[\s\S]*We sent a verification code to<br \/><strong style=\{\{ color: '#333', fontSize: '13px' \}\}>\{email\}<\/strong>/,
    'expected the verification email address to stay larger while the helper text uses the standard 10px popup size'
  );
});

test('secure sign-in warning shows only the secure continuation action', () => {
  const source = readProjectFile('src/components/AuthModal.tsx');

  assert.match(
    source,
    /\{!needsSecureSignIn && \(/,
    'expected the normal submit button to be gated by the secure sign-in warning state'
  );

  assert.match(
    source,
    /secureSignInHovered \? '#F14110' : '#333'[\s\S]*Continue secure sign in/,
    'expected the secure sign-in continuation button to use grey static styling with an orange hover state'
  );
});

test('secure sign-in page uses the custom SolidFind code UI instead of Clerk prebuilt UI', () => {
  const source = readProjectFile('src/app/secure-sign-in/page.tsx');

  assert.doesNotMatch(
    source,
    /<SignIn|import \{ SignIn \}/,
    'expected secure sign-in to avoid the Clerk prebuilt hosted-looking component'
  );

  assert.match(
    source,
    /prepareSecondFactor[\s\S]*attemptSecondFactor[\s\S]*CHECK YOUR EMAIL[\s\S]*Enter 6-digit code/,
    'expected secure sign-in to run the custom email-code second-factor flow'
  );
});

test('protected dashboards redirect unauthenticated visitors to the local login popup', () => {
  const source = readProjectFile('src/proxy.ts');

  assert.match(
    source,
    /url\.pathname = "\/sign-in";[\s\S]*url\.searchParams\.set\("next", nextPath\);[\s\S]*NextResponse\.redirect\(url\)/,
    'expected protected dashboards to redirect through the SolidFind sign-in route instead of Clerk hosted accounts'
  );
});
