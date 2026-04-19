const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('terms page reads Terms & Conditions content from Convex platform settings', () => {
  const termsPageSource = readProjectFile('src/app/terms/page.tsx');

  assert.match(
    termsPageSource,
    /useQuery\(api\.platformSettings\.get,\s*\{\s*key:\s*TERMS_TEXT_PLATFORM_SETTING_KEY\s*\}\)/,
    'expected the public /terms page to query the admin-managed terms content from Convex'
  );
});

test('admin UI persists Terms & Conditions text to Convex platform settings', () => {
  const adminUiSource = readProjectFile('src/app/admin/ui/page.tsx');

  assert.match(
    adminUiSource,
    /setPlatformSetting\(\{\s*key:\s*TERMS_TEXT_PLATFORM_SETTING_KEY,\s*value:\s*(?:s\.termsText|effectiveTermsText)(?:,\s*updatedBy:\s*"admin")?\s*\}\)/,
    'expected the Back Office UI tab to save Terms & Conditions text into Convex platform settings'
  );
});

test('shared terms utility exposes the Convex key used by admin and website', async () => {
  const termsUtils = await import(path.join(projectRoot, 'src/lib/terms-content.mjs'));

  assert.equal(termsUtils.TERMS_TEXT_PLATFORM_SETTING_KEY, 'termsText');
});

test('Convex platform settings seed includes the shared Terms & Conditions key', async () => {
  const termsUtils = await import(path.join(projectRoot, 'src/lib/terms-content.mjs'));
  const platformSettingsSource = readProjectFile('convex/platformSettings.ts');

  assert.match(
    platformSettingsSource,
    /const defaults: Record<string, string> = \{[\s\S]*?\[TERMS_TEXT_PLATFORM_SETTING_KEY\]: DEFAULT_TERMS_TEXT[\s\S]*?\};/,
    'expected Convex platform settings defaults to seed the shared termsText key with default terms content'
  );

  assert.equal(termsUtils.TERMS_TEXT_PLATFORM_SETTING_KEY, 'termsText');
});

test('shared terms utility parses admin-authored sections, paragraphs, and lists', async () => {
  const termsUtils = await import(path.join(projectRoot, 'src/lib/terms-content.mjs'));
  const sections = termsUtils.parseTermsContent(`
[TITLE] Example Section
[COPY] First paragraph.
- First bullet
- Second bullet
[COPY] Closing paragraph.
  `);

  assert.deepEqual(sections, [
    {
      title: 'Example Section',
      blocks: [
        { type: 'paragraph', content: 'First paragraph.' },
        { type: 'list', items: ['First bullet', 'Second bullet'] },
        { type: 'paragraph', content: 'Closing paragraph.' },
      ],
    },
  ]);
});
