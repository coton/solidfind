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
    /displayType === "video"[\s\S]*<AutoplayBannerVideo src=\{displayUrl\} \/>/,
    'expected horizontal ad videos to autoplay, loop, stay muted, and play inline on mobile'
  );

  assert.match(
    source,
    /video\.muted = true;[\s\S]*video\.defaultMuted = true;[\s\S]*video\.playsInline = true;[\s\S]*video\.play\(\)/,
    'expected horizontal ad videos to explicitly retry muted inline playback for mobile browsers'
  );

  assert.match(
    source,
    /document\.addEventListener\("visibilitychange", handleVisibilityChange\)/,
    'expected horizontal ad videos to retry playback when the mobile browser tab becomes visible again'
  );

  assert.match(
    source,
    /new IntersectionObserver\(\(entries\) => \{[\s\S]*entry\.isIntersecting[\s\S]*playVideo\(\)/,
    'expected horizontal ad videos to retry playback when the banner scrolls into view on mobile'
  );

  assert.match(
    source,
    /<video[\s\S]*autoPlay[\s\S]*loop[\s\S]*muted[\s\S]*playsInline[\s\S]*preload="auto"/,
    'expected the horizontal ad video element to keep mobile autoplay-safe media attributes'
  );

  assert.match(
    source,
    /<source src=\{src\} type="video\/mp4" \/>/,
    'expected the horizontal ad video renderer to emit an mp4 source element'
  );

  assert.match(
    source,
    /className="h-full w-full object-cover"/,
    'expected horizontal ad videos to fill the same banner frame as images'
  );
});
