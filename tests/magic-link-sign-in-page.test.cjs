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
    /className="flex h-10 w-\[140px\] items-center justify-center rounded-full border border-\[#333\] text-\[11px\] font-medium tracking-\[0\.22px\] text-\[#333\][^"]*"\s*>\s*Email/,
    'expected the email button to use the standard 140px website button treatment'
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
});
