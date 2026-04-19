const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('admin UI persists header, footer, and terms content to Convex platform settings', () => {
  const adminUiSource = readProjectFile('src/app/admin/ui/page.tsx');

  assert.match(
    adminUiSource,
    /const saveHeaderMedia = async \(\) => \{[\s\S]*?setPlatformSetting\(\{\s*key:\s*HEADER_MEDIA_PLATFORM_SETTING_KEY,\s*value:\s*JSON\.stringify\(\{\s*url:\s*effectiveHeaderMediaUrl,\s*type:\s*effectiveHeaderMediaType\s*\}\),\s*updatedBy:\s*"admin"\s*\}\)/,
    'expected the Back Office UI tab to save header media into Convex platform settings'
  );

  assert.match(
    adminUiSource,
    /const saveFooterMedia = async \(\) => \{[\s\S]*?setPlatformSetting\(\{\s*key:\s*FOOTER_MEDIA_PLATFORM_SETTING_KEY,\s*value:\s*JSON\.stringify\(\{\s*url:\s*effectiveFooterMediaUrl,\s*type:\s*effectiveFooterMediaType\s*\}\),\s*updatedBy:\s*"admin"\s*\}\)/,
    'expected the Back Office UI tab to save footer media into Convex platform settings'
  );

  assert.match(
    adminUiSource,
    /const saveTermsContent = async \(\) => \{[\s\S]*?setPlatformSetting\(\{\s*key:\s*TERMS_TEXT_PLATFORM_SETTING_KEY,\s*value:\s*effectiveTermsText,\s*updatedBy:\s*"admin"\s*\}\)/,
    'expected the Back Office UI tab to save Terms & Conditions into Convex platform settings'
  );
});

test('admin UI exposes a working Save All flow for website-facing settings and a visible terms save CTA', () => {
  const adminUiSource = readProjectFile('src/app/admin/ui/page.tsx');

  assert.match(
    adminUiSource,
    /const saveAllUiSettings = async \(\) => \{[\s\S]*?await Promise\.all\(\[[\s\S]*?saveLinks\(\)[\s\S]*?saveNewUserImage\(\)[\s\S]*?saveAdSpaces\(\)[\s\S]*?saveHeaderMedia\(\)[\s\S]*?saveFooterMedia\(\)[\s\S]*?saveAboutProfilePicture\(\)[\s\S]*?saveTermsContent\(\)[\s\S]*?\]\)/,
    'expected Save All to persist the website-facing UI sections, including Terms & Conditions'
  );

  assert.match(
    adminUiSource,
    /Save All UI Settings/,
    'expected a visible Save All UI Settings button on the admin UI page'
  );

  assert.match(
    adminUiSource,
    /Upload loads a draft only\. Click Save Terms & Conditions or Save All UI Settings to publish it to the website\./,
    'expected the Terms & Conditions section to explain that upload alone does not publish changes'
  );

  const saveTermsButtonCount = (adminUiSource.match(/Save Terms & Conditions/g) || []).length;
  assert.ok(
    saveTermsButtonCount >= 2,
    `expected the Terms & Conditions save button to be visible near the upload controls as well as below the editor, but found ${saveTermsButtonCount}`
  );
});

test('header, footer, and auth modal consume admin-managed platform settings', () => {
  const headerSource = readProjectFile('src/components/Header.tsx');
  const footerSource = readProjectFile('src/components/Footer.tsx');
  const authModalSource = readProjectFile('src/components/AuthModal.tsx');

  assert.match(
    headerSource,
    /useQuery\(api\.platformSettings\.get,\s*\{\s*key:\s*HEADER_MEDIA_PLATFORM_SETTING_KEY\s*\}\)/,
    'expected Header to read the admin-managed header media from Convex'
  );

  assert.match(
    footerSource,
    /useQuery\(api\.platformSettings\.get,\s*\{\s*key:\s*FOOTER_MEDIA_PLATFORM_SETTING_KEY\s*\}\)/,
    'expected Footer to read the admin-managed footer media from Convex'
  );

  assert.match(
    authModalSource,
    /useQuery\(api\.platformSettings\.get,\s*\{\s*key:\s*AD_VERTICAL_PLATFORM_SETTING_KEY\s*\}\)/,
    'expected AuthModal left ad space to read the admin-managed vertical ad from Convex'
  );
});

test('about page profile picture uses shared media parsing with layout-safe image rendering', () => {
  const aboutPageSource = readProjectFile('src/app/about/page.tsx');

  assert.match(
    aboutPageSource,
    /parseMediaSetting\(aboutProfilePicture,\s*\{\s*url:\s*"",\s*type:\s*"image"\s*\}\)/,
    'expected About page to parse the admin-managed profile picture through the shared media parser'
  );

  assert.match(
    aboutPageSource,
    /className="w-\[180px\].*?relative.*?overflow-hidden"/s,
    'expected the About page profile-picture container to be positioned for next/image fill rendering'
  );

  assert.match(
    aboutPageSource,
    /unoptimized=\{aboutProfileMedia\.url\.startsWith\("data:"\)\}/,
    'expected About page profile-picture rendering to support admin-uploaded data URLs'
  );
});

test('shared platform-settings utility parses admin-managed media payloads and normalizes contact hrefs', async () => {
  const settingsUtils = await import(path.join(projectRoot, 'src/lib/platform-settings.mjs'));

  assert.equal(settingsUtils.HEADER_MEDIA_PLATFORM_SETTING_KEY, 'headerMedia');
  assert.equal(settingsUtils.FOOTER_MEDIA_PLATFORM_SETTING_KEY, 'footerMedia');
  assert.equal(settingsUtils.AD_VERTICAL_PLATFORM_SETTING_KEY, 'adVertical');

  assert.deepEqual(
    settingsUtils.parseMediaSetting('{"url":"https://cdn.example.com/header.jpg","type":"image"}'),
    { url: 'https://cdn.example.com/header.jpg', type: 'image' }
  );

  assert.deepEqual(
    settingsUtils.parseMediaSetting('https://cdn.example.com/footer.jpg', { url: '/fallback.jpg', type: 'image' }),
    { url: 'https://cdn.example.com/footer.jpg', type: 'image' }
  );

  assert.equal(settingsUtils.normalizeContactHref('hello@solidfind.id'), 'mailto:hello@solidfind.id');
  assert.equal(settingsUtils.normalizeContactHref('mailto:hello@solidfind.id'), 'mailto:hello@solidfind.id');
  assert.equal(settingsUtils.normalizeContactHref('https://wa.me/628123456789'), 'https://wa.me/628123456789');
});
