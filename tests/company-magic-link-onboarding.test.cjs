const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('auth-complete routes company magic-link users without a password into setup-account mode before the editor', () => {
  const source = readProjectFile('src/app/auth-complete/page.tsx');

  assert.match(
    source,
    /if \(!requestedNextPath \|\| !requestedNextPath\.startsWith\("\/company-dashboard\/edit"\)\)/,
    'expected auth-complete to specifically detect company editor magic-link landings'
  );

  assert.match(
    source,
    /nextParams\.set\("setupAccount", "1"\)/,
    'expected auth-complete to flag password-less company sessions for setup-account onboarding'
  );

  assert.match(
    source,
    /requestedSetupAccount \|\| requestedNextPath/,
    'expected company redirects to prefer the setup-account editor URL when required'
  );
});

test('company dashboard edit blocks password-less magic-link users behind the setup-account popup', () => {
  const source = readProjectFile('src/app/company-dashboard/edit/page.tsx');

  assert.match(
    source,
    /const hasSetupAccountQuery = searchParams\.get\("setupAccount"\) === "1";[\s\S]*const shouldPromptSetupAccount = hasSetupAccountQuery && !!clerkUser;/,
    'expected the company editor to gate setup-account onboarding on the setupAccount query for company magic-link sessions'
  );

  assert.match(
    source,
    /const updatePasswordWithReverification = useReverification\([\s\S]*clerkUser\.updatePassword\(\{ newPassword \}\)/,
    'expected the setup-account flow to wrap password registration in Clerk reverification'
  );

  assert.match(
    source,
    /<h2 className="text-center text-\[18px\] font-semibold tracking-\[0\.36px\] text-\[#333\]">\s*Setup your Account/,
    'expected the company editor overlay to use the requested Setup your Account title'
  );

  assert.match(
    source,
    /Register your password before accessing your company profile\.[\s\S]*Daftarkan kata sandi Anda sebelum mengakses profil perusahaan Anda\./,
    'expected the setup-account popup to show the requested bilingual subtitle'
  );

  assert.match(
    source,
    /primaryEmailAddress\?\.emailAddress[\s\S]*Email Code/,
    'expected the setup-account popup to identify the account email and request an email verification code'
  );

  assert.match(
    source,
    /session\.startVerification\([\s\S]*prepareFirstFactorVerification\([\s\S]*strategy: "email_code"/,
    'expected the setup-account flow to initiate Clerk email-code reverification before changing the password'
  );

  assert.match(
    source,
    /attemptFirstFactorVerification\([\s\S]*strategy: "email_code"[\s\S]*Verify Email/,
    'expected the setup-account flow to verify the emailed code before completing password registration'
  );

  assert.match(
    source,
    /const isResolvingSetupAccount = hasSetupAccountQuery && \(!clerkUser \|\| currentUser === undefined \|\| company === undefined\);[\s\S]*return <MagicLinkLoadingPage \/>;/,
    'expected the company editor to keep a dedicated loading screen visible while setup-account access checks resolve'
  );

  assert.match(
    source,
    /className="flex h-10 w-\[140px\] items-center justify-center rounded-full border border-\[#333\] text-\[11px\] font-medium tracking-\[0\.22px\] text-\[#333\]/,
    'expected the setup-account Register button to use the standard 140px website button sizing'
  );
});

test('auth modal continue with email button keeps its original full width', () => {
  const source = readProjectFile('src/components/AuthModal.tsx');

  assert.match(
    source,
    /Continue with email[\s\S]*width: '100%'/,
    'expected the Continue with email button to keep its original full-width layout'
  );
});
