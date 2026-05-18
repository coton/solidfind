const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('magic-link sign-in fallback shows bilingual expired-link copy with a hello@solidfind.id email button', () => {
  const source = readProjectFile('src/app/sign-in/[[...sign-in]]/page.tsx');

  assert.match(
    source,
    /This link is invalid or expired\. Please request a fresh link\.[\s\S]*Tautan ini tidak valid atau kedaluwarsa\. Silakan minta tautan baru\./,
    'expected the closed magic-link popup fallback to show the requested bilingual expired-link message'
  );

  assert.match(
    source,
    /href="mailto:hello@solidfind\.id"/,
    'expected the expired-link fallback to include a direct mailto button to hello@solidfind.id'
  );

  assert.match(
    source,
    /className="flex h-10 w-\[140px\] items-center justify-center rounded-full border border-\[#333\] text-\[11px\] font-medium tracking-\[0\.22px\] text-\[#333\][^"]*"\s*>\s*Email us/,
    'expected the email button to use the standard 140px website button treatment with the requested Email us label'
  );

  assert.match(
    source,
    /if \(ticketError\) \{\s*return \(/,
    'expected magic-link ticket failures to return a dedicated fallback page instead of continuing into the normal login popup'
  );

  assert.doesNotMatch(
    source,
    /\{ticketError \? \([\s\S]*<AuthModal/,
    'expected the normal AuthModal login popup to stay out of the expired magic-link fallback state'
  );

  assert.match(
    source,
    /src="\/coming-soon\/bg-photo\.jpg"[\s\S]*<h1 className="text-\[18px\] font-semibold tracking-\[0\.36px\] text-\[#333\]">\s*Sorry/,
    'expected the expired-link fallback to reuse the coming-soon background image and show the requested Sorry title'
  );
});

test('magic-link sign-in bypasses ticket redemption when a Clerk user session already exists', () => {
  const source = readProjectFile('src/app/sign-in/[[...sign-in]]/page.tsx');

  assert.match(
    source,
    /const \{ user, isLoaded: isUserLoaded \} = useUser\(\);/,
    'expected the magic-link sign-in page to wait for Clerk user loading state'
  );

  assert.match(
    source,
    /const companySetupPath = useMemo\(\(\) => \{[\s\S]*nextParams\.set\("setupAccount", "1"\)/,
    'expected company magic-link sign-in to build the setup-account editor path directly on the sign-in page'
  );

  assert.match(
    source,
    /if \(!isUserLoaded\) return;[\s\S]*if \(user\) \{[\s\S]*if \(companySetupPath\) \{[\s\S]*router\.replace\(companySetupPath\);[\s\S]*return;[\s\S]*router\.replace\(`\/auth-complete\$\{nextSuffix\}`\);/,
    'expected existing signed-in company magic-link users to bypass auth-complete and go straight to the setup-account editor'
  );

  assert.match(
    source,
    /if \(result\.status === "complete"\) \{[\s\S]*if \(companySetupPath\) \{[\s\S]*router\.replace\(companySetupPath\);[\s\S]*return;[\s\S]*router\.replace\(`\/auth-complete\$\{nextSuffix\}`\);/,
    'expected ticket redemption to route company magic-link sessions straight into the setup-account editor once Clerk finishes signing them in'
  );

  assert.match(
    source,
    /if \(ticket && !ticketError\) \{\s*return <MagicLinkLoadingPage \/>;/,
    'expected the magic-link ticket processing state to reuse the shared loading page instead of flashing plain text'
  );
});

test('magic-link route resolves short branded codes while keeping long token fallback', () => {
  const source = readProjectFile('src/app/m/[code]/route.ts');
  const generatorSource = readProjectFile('scripts/generate-company-magic-links.cjs');
  const schemaSource = readProjectFile('convex/schema.ts');

  assert.match(
    schemaSource,
    /magicLinks: defineTable\(\{[\s\S]*code: v\.string\(\),[\s\S]*token: v\.string\(\),[\s\S]*\.index\("by_code", \["code"\]\)/,
    'expected short magic links to be stored in Convex by readable code'
  );

  assert.match(
    source,
    /if \(code\.includes\("\."\)\) \{[\s\S]*token: code/,
    'expected existing long signed token links to keep working'
  );

  assert.match(
    source,
    /fetchQuery\(anyApi\.magicLinks\.getByCode, \{ code \}, \{ url: convexUrl \}\)/,
    'expected short codes to resolve their stored signed token before Clerk ticket creation'
  );

  assert.match(
    generatorSource,
    /buildMagicLinkShortCode\(\{[\s\S]*companyName: company\.name,[\s\S]*companyId: company\._id,[\s\S]*clerkUserId: owner\.clerkId,[\s\S]*expiresAt,/,
    'expected generated exports to use company-readable SolidFind short codes'
  );

  assert.match(
    generatorSource,
    /fetchMutation\(anyApi\.magicLinks\.upsert,[\s\S]*code: shortCode,[\s\S]*token,/,
    'expected generated short links to persist the long signed token server-side'
  );
});
