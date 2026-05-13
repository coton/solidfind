const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('admin users tab sorts by type or joined date from clickable headers', () => {
  const source = readProjectFile('src/app/admin/users/page.tsx');

  assert.match(
    source,
    /const \[sortMode, setSortMode\] = useState<"joined" \| "type">\("joined"\);/,
    'expected admin users to default to joined-date sorting'
  );

  assert.match(
    source,
    /if \(sortMode === "type"\) \{[\s\S]*a\.accountType\.localeCompare\(b\.accountType\)[\s\S]*return b\.createdAt - a\.createdAt;/,
    'expected admin users to sort by account type, with joined date as fallback'
  );

  assert.match(
    source,
    /setSortMode\("type"\)[\s\S]*Type[\s\S]*setSortMode\("joined"\)[\s\S]*Joined/,
    'expected Type and Joined table headers to control sorting'
  );
});

test('admin users tab uses brand orange for company and grey for individual', () => {
  const source = readProjectFile('src/app/admin/users/page.tsx');

  assert.match(
    source,
    /user\.accountType === "company"[\s\S]*text-\[#f14110\] bg-\[#f14110\]\/10[\s\S]*text-\[#333\]\/50 bg-\[#f0f0f0\]/,
    'expected company account badges to be brand orange and individual badges grey'
  );

  assert.doesNotMatch(
    source,
    /text-blue-600 bg-blue-50/,
    'expected the old blue company badge styling to be removed'
  );
});

test('admin users tab can filter newsletter subscribers while preserving type sorting', () => {
  const source = readProjectFile('src/app/admin/users/page.tsx');

  assert.match(
    source,
    /const newsletterData = useQuery\(api\.waitlist\.getWaitlist, \{\}\);[\s\S]*const \[newsletterOnly, setNewsletterOnly\] = useState\(false\);/,
    'expected admin users to load newsletter signups and keep a newsletter filter state'
  );

  assert.match(
    source,
    /newsletterOnly && !newsletterEmails\.has\(u\.email\.trim\(\)\.toLowerCase\(\)\)/,
    'expected newsletter filtering to combine with the existing user filters'
  );

  assert.match(
    source,
    /setNewsletterOnly\(\(value\) => !value\)[\s\S]*Newsletter/,
    'expected the newsletter filter button to be toggleable'
  );
});

test('admin users tab only displays profile images for company accounts', () => {
  const source = readProjectFile('src/app/admin/users/page.tsx');

  assert.match(
    source,
    /const profileImageUrl = user\.accountType === "company" \? user\.imageUrl : undefined;[\s\S]*\{profileImageUrl \? \(/,
    'expected users without company profile images to keep the initials avatar'
  );
});
