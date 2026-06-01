const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const importer = require(path.join(projectRoot, 'src/lib/company-directory-import.cjs'));

test('resolveStoredCompanyMedia uploads remote logo and project images into Convex storage and reuses existing stored assets when URLs match', async () => {
  const uploadUrlQueue = ['https://upload/logo', 'https://upload/p1', 'https://upload/p2'];
  const uploaded = [];
  let storageCounter = 0;

  const fetchImpl = async (url, options = {}) => {
    if (!options.method) {
      return {
        ok: true,
        headers: {
          get(name) {
            return name.toLowerCase() === 'content-type' ? 'image/webp' : null;
          },
        },
        async arrayBuffer() {
          return Buffer.from(`downloaded:${url}`);
        },
      };
    }

    assert.equal(options.method, 'POST');
    uploaded.push({
      url,
      contentType: options.headers?.['Content-Type'],
      body: Buffer.from(options.body).toString('utf8'),
    });
    storageCounter += 1;
    const storageId = `storage:${storageCounter}`;

    return {
      ok: true,
      async json() {
        return { storageId };
      },
    };
  };

  const first = await importer.resolveStoredCompanyMedia({
    normalized: {
      imageUrl: 'https://cdn.example.com/logo.webp',
      projectImageUrls: ['https://cdn.example.com/p1.webp', 'https://cdn.example.com/p2.webp'],
    },
    existingCompany: null,
    generateUploadUrl: async () => uploadUrlQueue.shift(),
    fetchImpl,
  });

  assert.equal(first.logoId, 'storage:1');
  assert.deepEqual(first.projectImageIds, ['storage:2', 'storage:3']);
  assert.deepEqual(
    uploaded.map((entry) => entry.url),
    ['https://upload/logo', 'https://upload/p1', 'https://upload/p2']
  );
  assert.deepEqual(
    uploaded.map((entry) => entry.body),
    [
      'downloaded:https://cdn.example.com/logo.webp',
      'downloaded:https://cdn.example.com/p1.webp',
      'downloaded:https://cdn.example.com/p2.webp',
    ]
  );

  const second = await importer.resolveStoredCompanyMedia({
    normalized: {
      imageUrl: 'https://cdn.example.com/logo.webp',
      projectImageUrls: ['https://cdn.example.com/p1.webp', 'https://cdn.example.com/p2.webp'],
    },
    existingCompany: {
      imageUrl: 'https://cdn.example.com/logo.webp',
      logoId: 'existing-logo-id',
      projectImageUrls: ['https://cdn.example.com/p1.webp', 'https://cdn.example.com/p2.webp'],
      projectImageIds: ['existing-p1-id', 'existing-p2-id'],
    },
    generateUploadUrl: async () => {
      throw new Error('should not request a new upload URL when stored media already matches');
    },
    fetchImpl: async () => {
      throw new Error('should not fetch remote media when stored assets already match');
    },
  });

  assert.equal(second.logoId, 'existing-logo-id');
  assert.deepEqual(second.projectImageIds, ['existing-p1-id', 'existing-p2-id']);
});

test('resolveStoredCompanyMedia keeps protected remote images as external fallbacks instead of failing import', async () => {
  const uploadUrlQueue = ['https://upload/logo', 'https://upload/p1'];

  const fetchImpl = async (url, options = {}) => {
    if (!options.method) {
      if (String(url).includes('blocked')) {
        return {
          ok: false,
          status: 403,
          headers: { get: () => 'text/plain' },
          async arrayBuffer() {
            return Buffer.from('');
          },
        };
      }

      return {
        ok: true,
        headers: {
          get(name) {
            return name.toLowerCase() === 'content-type' ? 'image/jpeg' : null;
          },
        },
        async arrayBuffer() {
          return Buffer.from(`downloaded:${url}`);
        },
      };
    }

    return {
      ok: true,
      async json() {
        return { storageId: `stored:${url.split('/').pop()}` };
      },
    };
  };

  const media = await importer.resolveStoredCompanyMedia({
    normalized: {
      imageUrl: 'https://cdn.example.com/logo.jpg',
      projectImageUrls: ['https://cdn.example.com/p1.jpg', 'https://blocked.example.com/p2.jpg'],
    },
    existingCompany: null,
    generateUploadUrl: async () => uploadUrlQueue.shift(),
    fetchImpl,
  });

  assert.equal(media.logoId, 'stored:logo');
  assert.deepEqual(media.projectImageIds, ['stored:p1']);
  assert.deepEqual(media.projectImageUrls, ['https://blocked.example.com/p2.jpg']);
  assert.equal(media.projectImageUploadErrors.length, 1);
});

test('resolveStoredCompanyMedia does not upload HTML pages as project images', async () => {
  const media = await importer.resolveStoredCompanyMedia({
    normalized: {
      projectImageUrls: ['https://example.com/project-page'],
    },
    existingCompany: null,
    generateUploadUrl: async () => {
      throw new Error('should not request an upload URL for non-image responses');
    },
    fetchImpl: async () => ({
      ok: true,
      headers: {
        get(name) {
          return name.toLowerCase() === 'content-type' ? 'text/html; charset=utf-8' : null;
        },
      },
      async arrayBuffer() {
        return Buffer.from('<html></html>');
      },
    }),
  });

  assert.deepEqual(media.projectImageIds, []);
  assert.deepEqual(media.projectImageUrls, ['https://example.com/project-page']);
  assert.match(media.projectImageUploadErrors[0].error, /not an image/);
});

test('discoverCompanyMedia finds logo and project images in Category/Company folders', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'solidfind-media-test-'));
  const companyDir = path.join(root, 'Construction', 'Folder Media Builder');
  fs.mkdirSync(companyDir, { recursive: true });
  fs.writeFileSync(path.join(companyDir, 'Logo.jpg'), 'logo');
  fs.writeFileSync(path.join(companyDir, 'project2.png'), 'project2');
  fs.writeFileSync(path.join(companyDir, 'project1.png'), 'project1');

  const media = importer.discoverCompanyMedia({
    mediaRoot: root,
    companyName: 'Folder Media Builder',
    primaryCategory: 'construction',
  });

  assert.equal(media.imageFilePath, path.join(companyDir, 'Logo.jpg'));
  assert.deepEqual(media.projectImageFilePaths, [
    path.join(companyDir, 'project1.png'),
    path.join(companyDir, 'project2.png'),
  ]);
});

test('resolveStoredCompanyMedia uploads local folder media into storage', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'solidfind-local-upload-test-'));
  const logoPath = path.join(root, 'logo.jpg');
  const projectPath = path.join(root, 'project1.png');
  fs.writeFileSync(logoPath, 'logo-bytes');
  fs.writeFileSync(projectPath, 'project-bytes');

  const uploaded = [];
  const fetchImpl = async (url, options = {}) => {
    assert.equal(options.method, 'POST');
    uploaded.push({
      url,
      contentType: options.headers?.['Content-Type'],
      body: Buffer.from(options.body).toString('utf8'),
    });

    return {
      ok: true,
      async json() {
        return { storageId: `stored:${uploaded.length}` };
      },
    };
  };
  const uploadUrls = ['https://upload/logo', 'https://upload/project'];

  const media = await importer.resolveStoredCompanyMedia({
    normalized: {
      imageFilePath: logoPath,
      projectImageFilePaths: [projectPath],
      projectImageUrls: [],
    },
    existingCompany: null,
    generateUploadUrl: async () => uploadUrls.shift(),
    fetchImpl,
  });

  assert.equal(media.logoId, 'stored:1');
  assert.deepEqual(media.projectImageIds, ['stored:2']);
  assert.deepEqual(uploaded.map((entry) => entry.contentType), ['image/jpeg', 'image/png']);
  assert.deepEqual(uploaded.map((entry) => entry.body), ['logo-bytes', 'project-bytes']);
});
