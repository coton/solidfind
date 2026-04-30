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
    'expected auth-complete to flag company magic-link sessions for setup-account onboarding'
  );

  assert.match(
    source,
    /requestedSetupAccount \|\| requestedNextPath/,
    'expected company redirects to prefer the setup-account editor URL when required'
  );
});

test('company dashboard edit blocks company magic-link users behind the setup-account popup', () => {
  const source = readProjectFile('src/app/company-dashboard/edit/page.tsx');

  assert.match(
    source,
    /const hasSetupAccountQuery = searchParams\.get\("setupAccount"\) === "1";[\s\S]*const shouldPromptSetupAccount = hasSetupAccountQuery && !!clerkUser;/,
    'expected the company editor to gate setup-account onboarding on the setupAccount query for every company magic-link session'
  );

  assert.match(
    source,
    /const \[setupStage, setSetupStage\] = useState<"method" \| "emailChoice" \| "verify" \| "password" \| "socialFinish">\("method"\);[\s\S]*const \[setupSelectedSocial, setSetupSelectedSocial\] = useState<OAuthStrategy \| null>\(null\);/,
    'expected the company setup popup to run as its own staged onboarding flow'
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
    /Continue with Google[\s\S]*Continue with Apple[\s\S]*Continue with Microsoft[\s\S]*Continue with Email/,
    'expected the initial company setup popup to offer the same social options plus a generic continue-with-email action'
  );

  assert.match(
    source,
    /const handleSetupSocialAuth = async \(strategy: OAuthStrategy\) => \{[\s\S]*setSetupSelectedSocial\(strategy\);[\s\S]*setSetupLoginEmail\(storedCompanyEmail\);[\s\S]*setSetupStage\("emailChoice"\);/,
    'expected choosing a company social setup method to move into the shared login-email step'
  );

  assert.match(
    source,
    /Choose the login email for your company account before continuing\.[\s\S]*Pilih email login untuk akun perusahaan Anda sebelum melanjutkan\./,
    'expected the rebuilt flow to choose the canonical company login email before verification'
  );

  assert.match(
    source,
    /fetch\("\/api\/company\/prepare-login-email"[\s\S]*await clerkUser\.reload\(\)[\s\S]*prepareVerification\(\{ strategy: "email_code" \}\)/,
    'expected the chosen login email to be prepared server-side first and then verified by email code'
  );

  assert.match(
    source,
    /await syncSetupLoginEmail\(\);[\s\S]*if \(setupSelectedSocial\) \{[\s\S]*setSetupStage\("socialFinish"\);[\s\S]*\} else \{[\s\S]*setSetupStage\("password"\);/,
    'expected email ownership confirmation to branch into social finish or password creation based on the chosen method'
  );

  assert.match(
    source,
    /fetch\("\/api\/company\/setup-login-email"/,
    'expected the rebuilt flow to sync the chosen company login email through the dedicated server route'
  );

  assert.match(
    source,
    /Using a different email than \{storedCompanyEmail\} will set this new email as your login for your company\.[\s\S]*Menggunakan email yang berbeda dari \{storedCompanyEmail\} akan menetapkan email baru ini sebagai login Anda untuk perusahaan Anda\./,
    'expected the login-email step to warn when the chosen company login email differs from the existing company email on file'
  );

  assert.match(
    source,
    /const storedCompanyEmail = company\?\.email \|\| primaryCompanyEmail;[\s\S]*setupDisplayEmail = setupLoginEmail \|\| storedCompanyEmail/,
    'expected later setup stages to display the chosen company login email'
  );

  assert.match(
    source,
    /setupStage === "socialFinish"[\s\S]*Finish with \$\{getSocialProviderLabel\(setupSelectedSocial\)\}/,
    'expected social setup to finish only after the chosen company login email has been verified'
  );

  assert.match(
    source,
    /await syncSetupLoginEmail\(setupPassword\);/,
    'expected email-password setup to finalize against the chosen company login email'
  );

  assert.match(
    source,
    /getSocialProviderIcon\(setupSelectedSocial\)/,
    'expected the rebuilt social flow to keep showing the selected provider icon in the popup'
  );

  assert.match(
    source,
    /A verification code has been sent to your email\.[\s\S]*Verify Email/,
    'expected the verify step to show a sent-code note and keep Verify Email available once the code is entered'
  );

  assert.match(
    source,
    /function SetupBackButton[\s\S]*absolute left-6 top-7[\s\S]*setupStage === "emailChoice"[\s\S]*<SetupBackButton[\s\S]*setupStage === "password"[\s\S]*<SetupBackButton[\s\S]*setupStage === "socialFinish"[\s\S]*<SetupBackButton[\s\S]*setupStage === "verify"[\s\S]*<SetupBackButton/,
    'expected the rebuilt setup flow to keep a consistent top-left Back button across the onboarding steps'
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

test('magic-link loading page uses the updated in-progress title', () => {
  const source = readProjectFile('src/components/MagicLinkLoadingPage.tsx');

  assert.match(
    source,
    /Setting up your Account/,
    'expected the magic-link loading screen to use the requested Setting up your Account title'
  );
});

test('clerk proxy covers the company onboarding api routes used by the magic-link setup flow', () => {
  const source = readProjectFile('src/proxy.ts');

  assert.match(
    source,
    /matcher:\s*\[[\s\S]*"\/api\/company\/\(\.\*\)"/,
    'expected Clerk proxy matcher to include company api routes so auth() works during company onboarding'
  );

  assert.match(
    source,
    /matcher:\s*\[[\s\S]*"\/api\/set-account-type"/,
    'expected Clerk proxy matcher to include the set-account-type api route used in auth flows'
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
