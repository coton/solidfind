const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const { ensureClerkUser, parseArgs } = require(path.join(projectRoot, 'scripts/import-company-directory.cjs'));

test('parseArgs accepts an optional media ZIP or media root for folder-based company images', () => {
  assert.deepEqual(
    parseArgs(['--file', 'companies.xlsx', '--media-zip', 'media.zip', '--media-root', 'media']),
    {
      target: 'preview',
      apply: false,
      file: 'companies.xlsx',
      envFile: null,
      companyNames: [],
      mediaRoot: 'media',
      mediaZip: 'media.zip',
      verbose: false,
    }
  );
});

test('ensureClerkUser creates setup-ready Clerk users when the import row has no password', async () => {
  const calls = [];
  const clerk = {
    users: {
      async createUser(payload) {
        calls.push(['createUser', payload]);
        return { id: 'user_123' };
      },
      async updateUserMetadata(userId, metadata) {
        calls.push(['updateUserMetadata', userId, metadata]);
      },
      async verifyPassword() {
        throw new Error('verifyPassword should not be called without a password');
      },
    },
  };

  const result = await ensureClerkUser({
    clerk,
    normalized: {
      name: 'Password Free Builder',
      email: 'builder@example.com',
      password: undefined,
    },
    existingClerkUser: null,
    apply: true,
  });

  assert.equal(result.clerkUser.id, 'user_123');
  assert.equal(result.operation, 'create');
  assert.equal(result.passwordVerified, false);
  assert.deepEqual(calls[0], [
    'createUser',
    {
      emailAddress: ['builder@example.com'],
      firstName: 'Password Free Builder',
      skipLegalChecks: true,
      publicMetadata: {
        accountType: 'company',
        companyName: 'Password Free Builder',
      },
      unsafeMetadata: {
        accountType: 'company',
        companyName: 'Password Free Builder',
      },
    },
  ]);
});
