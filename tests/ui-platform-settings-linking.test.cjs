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

test('admin/public UI linkage files do not contain unresolved merge markers', () => {
  const files = [
    'src/app/admin/ui/page.tsx',
    'src/app/about/page.tsx',
    'src/app/terms/page.tsx',
    'src/components/AccountTypeSelectionCard.tsx',
    'src/components/AuthModal.tsx',
    'src/components/Footer.tsx',
    'src/components/Header.tsx',
    'src/components/cards/WelcomeCard.tsx',
    'src/lib/platform-settings.mjs',
    'src/lib/terms-content.mjs',
    'tests/terms-linking.test.cjs',
    'tests/ui-platform-settings-linking.test.cjs',
  ];

  for (const file of files) {
    const source = readProjectFile(file);
    assert.doesNotMatch(
      source,
      /^(<<<<<<<|=======|>>>>>>>)/m,
      `${file} should not contain unresolved merge conflict markers`
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

test('admin UI can delete the existing About page profile picture entry before re-uploading', () => {
  const adminUiSource = readProjectFile('src/app/admin/ui/page.tsx');
  const platformSettingsSource = readProjectFile('convex/platformSettings.ts');

  assert.match(
    adminUiSource,
    /Delete Existing Entry/,
    'expected the Back Office UI tab to expose a delete action for the About page profile picture setting'
  );

  assert.match(
    adminUiSource,
    /deletePlatformSettingByKey\(\{ key: "aboutProfilePictureUrl" \}\)/,
    'expected the Back Office About profile picture delete action to target the website-facing aboutProfilePictureUrl setting'
  );

  assert.match(
    platformSettingsSource,
    /export const deleteByKey = mutation\(/,
    'expected Convex platform settings to expose a reusable deleteByKey mutation for admin-managed UI media'
  );
});

test('admin UI uploads About page profile picture assets through Convex storage before saving the website setting', () => {
  const adminUiSource = readProjectFile('src/app/admin/ui/page.tsx');

  assert.match(
    adminUiSource,
    /useConvex/,
    'expected the Back Office UI tab to use Convex client queries so uploaded About profile picture files resolve to a public URL before save'
  );

  assert.match(
    adminUiSource,
    /useMutation\(api\.files\.generateUploadUrl\)/,
    'expected the About profile picture upload flow to request a Convex upload URL instead of only storing a local data URL preview'
  );

  assert.match(
    adminUiSource,
    /uploadFileToStorage\(/,
    'expected the About profile picture upload flow to post the selected file to Convex storage'
  );

  assert.match(
    adminUiSource,
    /convex\.query\(api\.files\.getUrl/,
    'expected the About profile picture upload flow to resolve the uploaded storage file to a website-usable URL'
  );
});

test('admin UI uploads ad space media through Convex storage before saving website settings', () => {
  const adminUiSource = readProjectFile('src/app/admin/ui/page.tsx');

  assert.match(
    adminUiSource,
    /handleAdMediaFile[\s\S]*uploadAdminMediaAsset\(file\)/,
    'expected uploaded ad files to be sent to Convex storage instead of saving local data URL previews'
  );

  assert.match(
    adminUiSource,
    /onFile=\{\(\{ file, type \}\) => handleAdMediaFile\("vertical", file, type\)\}/,
    'expected the vertical ad upload control to publish its selected file to Convex storage'
  );

  assert.match(
    adminUiSource,
    /onFile=\{\(\{ file, type \}\) => handleAdMediaFile\("horizontal", file, type\)\}/,
    'expected the horizontal ad upload control to publish its selected file to Convex storage'
  );

  assert.match(
    adminUiSource,
    /if \(adVerticalUploading \|\| adHorizontalUploading\) return;/,
    'expected save actions to wait until ad uploads finish before saving platform settings'
  );

  assert.match(
    adminUiSource,
    /disabled=\{adVerticalUploading \|\| adHorizontalUploading\}/,
    'expected Save Ad Spaces and Save All UI Settings buttons to be disabled while ad uploads are still running'
  );
});

test('admin UI hydrates ad settings once without overwriting local ad drafts', () => {
  const adminUiSource = readProjectFile('src/app/admin/ui/page.tsx');

  assert.match(
    adminUiSource,
    /const adSpacesLoaded = useRef\(false\);/,
    'expected ad settings hydration to be guarded by a loaded ref'
  );

  assert.match(
    adminUiSource,
    /if \(adSpacesLoaded\.current\) return;[\s\S]*adSpacesLoaded\.current = true;/,
    'expected ad settings to hydrate once so late Convex responses do not overwrite selected ad drafts'
  );

  assert.match(
    adminUiSource,
    /parseMediaSetting\(adVerticalValue[\s\S]*parseMediaSetting\(adHorizontalValue/,
    'expected ad settings hydration to support both JSON media values and legacy URL strings'
  );
});

test('Save All UI Settings only re-saves media sections that still have unsaved local draft state', () => {
  const adminUiSource = readProjectFile('src/app/admin/ui/page.tsx');

  assert.match(
    adminUiSource,
    /if \(newUserImageHasDraft\) \{\s*pendingSaves\.push\(saveNewUserImage\(\)\);\s*\}/,
    'expected Save All to avoid overwriting the New User image after an individual save clears its draft state'
  );

  assert.match(
    adminUiSource,
    /if \(aboutProfilePictureHasDraft\) \{\s*pendingSaves\.push\(saveAboutProfilePicture\(\)\);\s*\}/,
    'expected Save All to avoid overwriting the About profile picture after an individual save clears its draft state'
  );

  assert.match(
    adminUiSource,
    /if \(s\.headerMediaUrl \|\| s\.headerMediaType\) \{\s*pendingSaves\.push\(saveHeaderMedia\(\)\);\s*\}/,
    'expected Save All to only persist header media when there is unsaved local media draft state'
  );

  assert.match(
    adminUiSource,
    /if \(s\.footerMediaUrl \|\| s\.footerMediaType\) \{\s*pendingSaves\.push\(saveFooterMedia\(\)\);\s*\}/,
    'expected Save All to only persist footer media when there is unsaved local media draft state'
  );
});
