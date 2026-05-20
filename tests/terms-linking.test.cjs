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

test('admin Legal tab persists Terms and Pro Terms text to Convex platform settings', () => {
  const adminLegalSource = readProjectFile('src/app/admin/legal/page.tsx');
  const adminLayoutSource = readProjectFile('src/app/admin/layout.tsx');

  assert.match(
    adminLayoutSource,
    /\{ href: "\/admin\/legal", label: "Legal"/,
    'expected the Back Office sidebar to expose a Legal tab'
  );

  assert.match(
    adminLegalSource,
    /title="Terms & Conditions"[\s\S]*settingKey=\{TERMS_TEXT_PLATFORM_SETTING_KEY\}/,
    'expected the Legal tab to save Terms & Conditions text into Convex platform settings'
  );

  assert.match(
    adminLegalSource,
    /title="Pro Terms of Services English"[\s\S]*settingKey=\{PRO_TERMS_EN_PLATFORM_SETTING_KEY\}[\s\S]*title="Pro Terms of Services Indonesian"[\s\S]*settingKey=\{PRO_TERMS_ID_PLATFORM_SETTING_KEY\}/,
    'expected the Legal tab to expose English and Indonesian Pro Terms uploaders'
  );
});

test('shared terms utility exposes the Convex key used by admin and website', async () => {
  const termsUtils = await import(path.join(projectRoot, 'src/lib/terms-content.mjs'));

  assert.equal(termsUtils.TERMS_TEXT_PLATFORM_SETTING_KEY, 'termsText');
  assert.equal(termsUtils.PRO_TERMS_EN_PLATFORM_SETTING_KEY, 'proTermsEnglish');
  assert.equal(termsUtils.PRO_TERMS_ID_PLATFORM_SETTING_KEY, 'proTermsIndonesian');
});

test('Convex platform settings seed includes the shared Terms & Conditions key', async () => {
  const termsUtils = await import(path.join(projectRoot, 'src/lib/terms-content.mjs'));
  const platformSettingsSource = readProjectFile('convex/platformSettings.ts');

  assert.match(
    platformSettingsSource,
    /const defaults: Record<string, string> = \{[\s\S]*?\[TERMS_TEXT_PLATFORM_SETTING_KEY\]: DEFAULT_TERMS_TEXT[\s\S]*?\[PRO_TERMS_EN_PLATFORM_SETTING_KEY\]: DEFAULT_PRO_TERMS_EN_TEXT[\s\S]*?\[PRO_TERMS_ID_PLATFORM_SETTING_KEY\]: DEFAULT_PRO_TERMS_ID_TEXT[\s\S]*?\};/,
    'expected Convex platform settings defaults to seed the shared terms keys with default legal content'
  );

  assert.equal(termsUtils.TERMS_TEXT_PLATFORM_SETTING_KEY, 'termsText');
});

test('terms page links to Pro Terms only when Pro features are enabled', () => {
  const termsPageSource = readProjectFile('src/app/terms/page.tsx');

  assert.match(
    termsPageSource,
    /proEnabledValue = useQuery\(api\.platformSettings\.get,\s*\{\s*key:\s*"pro_enabled"\s*\}\)/,
    'expected the Terms page to check the Pro feature setting'
  );

  assert.match(
    termsPageSource,
    /view === "main" && proTermsVisible[\s\S]*Pro Terms of Services[\s\S]*Ketentuan Penggunaan Pro/,
    'expected the Terms page to show Pro Terms links only from the main Terms view when Pro is enabled'
  );
});

test('legal text views keep manual line breaks tight and indent bullet lists', () => {
  const termsPageSource = readProjectFile('src/app/terms/page.tsx');
  const companyDashboardSource = readProjectFile('src/app/company-dashboard/page.tsx');
  const adminLegalSource = readProjectFile('src/app/admin/legal/page.tsx');

  for (const source of [termsPageSource, companyDashboardSource]) {
    assert.match(
      source,
      /className="space-y-0\.5 pl-8 mb-1"/,
      'expected public legal bullet lists to be indented without adding large vertical gaps'
    );

    assert.match(
      source,
      /className="mb-1"/,
      'expected public legal paragraphs to keep manual line breaks close to regular line spacing'
    );
  }

  assert.ok(
    adminLegalSource.includes('[-•▪*]\\s+(.+)'),
    'expected Legal preview to recognize admin-authored bullet lines, including typed bullet characters'
  );
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

test('shared terms utility parses real bullet characters as list items', async () => {
  const termsUtils = await import(path.join(projectRoot, 'src/lib/terms-content.mjs'));
  const sections = termsUtils.parseTermsContent(`
[TITLE] Beliefs
[COPY] We believe that:
• Visibility should be earned through clarity.
▪ Trust should be built through transparency.
* Access should be available to anyone.
  `);

  assert.deepEqual(sections[0].blocks, [
    { type: 'paragraph', content: 'We believe that:' },
    {
      type: 'list',
      items: [
        'Visibility should be earned through clarity.',
        'Trust should be built through transparency.',
        'Access should be available to anyone.',
      ],
    },
  ]);
});
