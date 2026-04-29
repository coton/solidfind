const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('horizontal ad banner renders uploaded videos with autoplay looping playback', () => {
  const source = readProjectFile('src/components/AdBanner.tsx');

  assert.match(
    source,
    /const displayType = propImageSrc && !horizontalAdState\.media\.url \? "image" : horizontalAdState\.media\.type;/,
    'expected the banner to preserve the uploaded horizontal ad media type while keeping prop images as image fallbacks'
  );

  assert.match(
    source,
    /displayType === "video"[\s\S]*<video[\s\S]*autoPlay[\s\S]*loop[\s\S]*muted[\s\S]*playsInline/,
    'expected horizontal ad videos to autoplay, loop, stay muted, and play inline on mobile'
  );

  assert.match(
    source,
    /<source src=\{displayUrl\} type="video\/mp4" \/>/,
    'expected the horizontal ad video renderer to emit an mp4 source element'
  );

  assert.match(
    source,
    /className="h-full w-full object-cover"/,
    'expected horizontal ad videos to fill the same banner frame as images'
  );
});
