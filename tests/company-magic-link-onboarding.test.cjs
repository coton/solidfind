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
    /if \(user\?\.passwordEnabled\) \{\s*return requestedNextPath;\s*\}/,
    'expected auth-complete to skip the setup step once the Clerk user already has a password'
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
    /const shouldPromptSetupAccount = searchParams\.get\("setupAccount"\) === "1" && !!clerkUser && !clerkUser\.passwordEnabled;/,
    'expected the company editor to gate setup-account onboarding on the setupAccount query and Clerk password state'
  );

  assert.match(
    source,
    /await clerkUser\.updatePassword\(\{ newPassword: setupPassword \}\);/,
    'expected the setup-account flow to register the password directly on the existing Clerk user'
  );

  assert.match(
    source,
    /<h2 className="text-center text-\[18px\] font-semibold tracking-\[0\.36px\] text-\[#333\]">\s*Setup Account/,
    'expected the company editor overlay to use the requested Setup Account title'
  );

  assert.match(
    source,
    /Just register your password before accessing your company profile\.[\s\S]*Cukup daftarkan kata sandi Anda sebelum mengakses profil perusahaan Anda\./,
    'expected the setup-account popup to show the requested bilingual subtitle'
  );

  assert.match(
    source,
    /className="flex h-10 w-\[140px\] items-center justify-center rounded-full border border-\[#333\] text-\[11px\] font-medium tracking-\[0\.22px\] text-\[#333\]/,
    'expected the setup-account Register button to use the standard 140px website button sizing'
  );
});

test('auth modal continue with email button uses the standard 140px width', () => {
  const source = readProjectFile('src/components/AuthModal.tsx');

  assert.match(
    source,
    /Continue with email[\s\S]*width: '140px'/,
    'expected the Continue with email button to use the standard 140px width'
  );
});
