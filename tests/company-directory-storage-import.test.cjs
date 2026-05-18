const test = require('node:test');
const assert = require('node:assert/strict');
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
