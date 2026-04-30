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
    /const \[setupStage, setSetupStage\] = useState<"method" \| "socialEmail" \| "password" \| "verify">\("method"\);[\s\S]*const \[setupSelectedSocial, setSetupSelectedSocial\] = useState<OAuthStrategy \| null>\(null\);/,
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
    /Continue with Google[\s\S]*Continue with Apple[\s\S]*Continue with Microsoft[\s\S]*Continue with \{clerkUser\?\.primaryEmailAddress\?\.emailAddress \|\| "this email"\}/,
    'expected the initial company setup popup to offer the same social options plus a company-email continue action'
  );

  assert.match(
    source,
    /const setupStageQuery = searchParams\.get\("setupStage"\);[\s\S]*if \(setupStageQuery === "password"\) \{[\s\S]*setSetupStage\("password"\)/,
    'expected company setup onboarding to resume at the password step after a social OAuth callback'
  );

  assert.match(
    source,
    /const handleSetupSocialAuth = async \(strategy: OAuthStrategy\) => \{[\s\S]*setSetupSelectedSocial\(strategy\);[\s\S]*setSetupStage\("socialEmail"\);/,
    'expected choosing a company social setup method to continue into a social-email confirmation step before the password stage'
  );

  assert.match(
    source,
    /Confirm the email linked to your \{getSocialProviderLabel\(setupSelectedSocial\)\} account before continuing\.[\s\S]*handleSetupSocialEmailContinue/,
    'expected the company social setup path to ask for email confirmation before continuing'
  );

  assert.match(
    source,
    /getSocialProviderIcon\(setupSelectedSocial\)/,
    'expected the social-email confirmation step to show the selected provider icon under the provider title'
  );

  assert.match(
    source,
    /Using a different email than \{primaryCompanyEmail\} will set this new email as your login for your company\.[\s\S]*Menggunakan email yang berbeda dari \{primaryCompanyEmail\} akan menetapkan email baru ini sebagai login Anda untuk perusahaan Anda\./,
    'expected the social-email confirmation step to warn in orange when a different email is entered'
  );

  assert.match(
    source,
    /if \(selectedSocial\) \{[\s\S]*await clerkUser\.createExternalAccount\(\{[\s\S]*strategy: selectedSocial,[\s\S]*redirectUrl: `\/sso-callback\?redirect_url=\$\{encodeURIComponent\(redirectTarget\)\}`,[\s\S]*oidcLoginHint: setupSocialEmail \|\| clerkUser\.primaryEmailAddress\?\.emailAddress \|\| undefined/,
    'expected the selected company social account to be linked only after password and email verification complete'
  );

  assert.match(
    source,
    /setupStage === "password"[\s\S]*Password[\s\S]*Confirm Password/,
    'expected the company setup popup to move to a dedicated password step after the initial method choice'
  );

  assert.match(
    source,
    /const finalizeSetup = useReverification\([\s\S]*clerkUser\.updatePassword\(\{ newPassword \}\)[\s\S]*onNeedsReverification:[\s\S]*setSetupStage\("verify"\)/,
    'expected the setup-account flow to use Clerk reverification and move into the custom verify step when sensitive actions need extra checks'
  );

  assert.match(
    source,
    /onNeedsReverification:[\s\S]*setSetupAccountSaving\(false\)/,
    'expected the setup flow to release the initial saving state once Clerk moves into the verify-code step'
  );

  assert.match(
    source,
    /beginEmailVerification[\s\S]*session\.startVerification\(\{ level: "first_factor" \}\)[\s\S]*prepareFirstFactorVerification\([\s\S]*strategy: "email_code"/,
    'expected the setup-account flow to explicitly send an email verification code before retrying the protected action'
  );

  assert.match(
    source,
    /attemptFirstFactorVerification\([\s\S]*strategy: "email_code"[\s\S]*await reverificationState\.complete\(\)/,
    'expected the setup-account flow to verify the emailed code and then ask Clerk to retry the protected action'
  );

  assert.match(
    source,
    /const hasCompleteVerificationCode = setupVerificationCode\.trim\(\)\.length === 6;/,
    'expected the verify step to treat a full 6-digit code as ready to submit'
  );

  assert.match(
    source,
    /disabled=\{setupAccountSaving \|\| setupVerificationSubmitting \|\| !hasCompleteVerificationCode\}/,
    'expected the verify button to become clickable once a full code is entered instead of staying blocked by the send state'
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

test('auth modal continue with email button keeps its original full width', () => {
  const source = readProjectFile('src/components/AuthModal.tsx');

  assert.match(
    source,
    /Continue with email[\s\S]*width: '100%'/,
    'expected the Continue with email button to keep its original full-width layout'
  );
});
