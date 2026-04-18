const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  DEFAULT_EMAILS,
  normalizeEmails,
  parseArgs,
  resolveEnvFile,
  loadEnvFile,
  resolveRuntimeConfig,
} = require('../src/lib/admin-cleanup-test-users.cjs');

test('normalizeEmails lowercases, trims, deduplicates, and drops empties', () => {
  assert.deepEqual(normalizeEmails([' Foo@Example.com ', 'foo@example.com', '', 'BAR@example.com']), [
    'foo@example.com',
    'bar@example.com',
  ]);
});

test('parseArgs defaults to preview dry-run with default emails', () => {
  const args = parseArgs([]);
  assert.equal(args.target, 'preview');
  assert.equal(args.apply, false);
  assert.deepEqual(args.emails, DEFAULT_EMAILS);
});

test('parseArgs supports apply, env file, and custom emails', () => {
  const args = parseArgs([
    '--apply',
    '--env-file',
    '.env.custom',
    '--emails',
    'A@example.com,b@example.com,A@example.com',
  ]);
  assert.equal(args.apply, true);
  assert.equal(args.envFile, '.env.custom');
  assert.deepEqual(args.emails, ['a@example.com', 'b@example.com']);
});

test('resolveEnvFile maps preview and production defaults', () => {
  assert.equal(resolveEnvFile({ target: 'preview', envFile: null }), '.env.preview.local');
  assert.equal(resolveEnvFile({ target: 'production', envFile: null }), '.env.production.local');
  assert.equal(resolveEnvFile({ target: 'preview', envFile: '.env.any' }), '.env.any');
});

test('loadEnvFile parses quoted values and strips escaped newlines', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'solidfind-cleanup-'));
  const envPath = path.join(tempDir, '.env.test');
  fs.writeFileSync(
    envPath,
    'NEXT_PUBLIC_CONVEX_URL="https://example.convex.cloud\\n"\nCLERK_SECRET_KEY="sk_test_123\\n"\n'
  );

  const env = loadEnvFile(envPath);
  assert.equal(env.NEXT_PUBLIC_CONVEX_URL, 'https://example.convex.cloud');
  assert.equal(env.CLERK_SECRET_KEY, 'sk_test_123');
});

test('resolveRuntimeConfig prefers explicit runtime values over env file lookup', () => {
  const config = resolveRuntimeConfig({
    convexUrl: 'https://runtime.convex.cloud ',
    clerkSecretKey: ' sk_live_runtime ',
    target: 'preview',
  });

  assert.equal(config.convexUrl, 'https://runtime.convex.cloud');
  assert.equal(config.clerkSecretKey, 'sk_live_runtime');
  assert.equal(config.target, 'preview');
  assert.equal(config.envFile, null);
});
