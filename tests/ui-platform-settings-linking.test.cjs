const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

test('platform setting helpers avoid rendering fallback text while Convex values are still loading', async () => {
  const utils = await import(path.join(projectRoot, 'src/lib/platform-settings.mjs'));

  assert.deepEqual(utils.resolveTextSetting(undefined, 'fallback'), {
    isLoading: true,
    value: '',
  });

  assert.deepEqual(utils.resolveTextSetting(null, 'fallback'), {
    isLoading: false,
    value: 'fallback',
  });

  assert.deepEqual(utils.resolveTextSetting('Custom copy', 'fallback'), {
    isLoading: false,
    value: 'Custom copy',
  });
});

test('platform setting helpers avoid rendering fallback media while Convex values are still loading', async () => {
  const utils = await import(path.join(projectRoot, 'src/lib/platform-settings.mjs'));

  assert.deepEqual(utils.resolveMediaSetting(undefined, { url: '/fallback.png', type: 'image' }), {
    isLoading: true,
    media: { url: '', type: 'image' },
  });

  assert.deepEqual(utils.resolveMediaSetting(null, { url: '/fallback.png', type: 'image' }), {
    isLoading: false,
    media: { url: '/fallback.png', type: 'image' },
  });

  assert.deepEqual(
    utils.resolveMediaSetting(JSON.stringify({ url: 'https://cdn.example.com/custom.png', type: 'image' }), {
      url: '/fallback.png',
      type: 'image',
    }),
    {
      isLoading: false,
      media: { url: 'https://cdn.example.com/custom.png', type: 'image' },
    }
  );
});

test('public website consumers use load-aware platform-setting helpers', () => {
  const files = [
    'src/app/about/page.tsx',
    'src/app/terms/page.tsx',
    'src/components/AccountTypeSelectionCard.tsx',
    'src/components/AdBanner.tsx',
    'src/components/AuthModal.tsx',
    'src/components/Footer.tsx',
    'src/components/Header.tsx',
    'src/components/cards/WelcomeCard.tsx',
  ];

  for (const file of files) {
    const source = readProjectFile(file);
    assert.match(
      source,
      /resolve(Text|Media)Setting/,
      `${file} should use load-aware platform-setting helpers so UI-tab content does not flash stale fallback content`
    );
  }
});

test('admin UI exposes a visible draft/upload state for the About page profile picture section', () => {
  const adminUiSource = readProjectFile('src/app/admin/ui/page.tsx');

  assert.match(
    adminUiSource,
    /About profile picture draft loaded|Profile picture draft loaded/,
    'expected the Back Office UI tab to show when a replacement About profile picture has been loaded but not yet published'
  );
});
