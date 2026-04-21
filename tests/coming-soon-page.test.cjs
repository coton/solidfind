const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('www coming-soon page uses the branded background-photo layout and notify CTA', () => {
  const comingSoonSource = readProjectFile('src/components/ComingSoonPage.tsx');

  assert.match(
    comingSoonSource,
    /src=\"\/coming-soon\/bg-photo\.jpg\"/,
    'expected the www coming-soon page to use the branded background photo asset'
  );

  assert.match(
    comingSoonSource,
    /Notify me/,
    'expected the www coming-soon page CTA to match the previous notify-me design'
  );

  assert.match(
    comingSoonSource,
    /SOLIDFIND\.id/,
    'expected the previous SOLIDFIND.id branding to be present on the coming-soon page'
  );
});

test('coming-soon background photo asset exists in public assets', () => {
  const backgroundPhotoPath = path.join(projectRoot, 'public/coming-soon/bg-photo.jpg');
  assert.equal(fs.existsSync(backgroundPhotoPath), true, 'expected public/coming-soon/bg-photo.jpg to exist');
});
