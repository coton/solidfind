const test = require('node:test');
const assert = require('node:assert/strict');

async function loadModule() {
  return import('../src/lib/magic-link-login.mjs');
}

test('sanitizeNextPath keeps safe internal company edit paths', async () => {
  const { sanitizeNextPath } = await loadModule();

  assert.equal(
    sanitizeNextPath('/company-dashboard/edit?firstConnection=1'),
    '/company-dashboard/edit?firstConnection=1'
  );
});

test('sanitizeNextPath rejects absolute and protocol-relative urls', async () => {
  const { sanitizeNextPath } = await loadModule();

  assert.equal(sanitizeNextPath('https://evil.example/steal'), null);
  assert.equal(sanitizeNextPath('//evil.example/steal'), null);
  assert.equal(sanitizeNextPath('/\\\\evil.example/steal'), null);
  assert.equal(sanitizeNextPath('javascript:alert(1)'), null);
});

test('buildTicketSignInUrl appends ticket and safe next path', async () => {
  const { buildTicketSignInUrl } = await loadModule();

  assert.equal(
    buildTicketSignInUrl({
      appUrl: 'https://beta.solidfind.id/',
      ticket: 'ticket-123',
      nextPath: '/company-dashboard/edit',
    }),
    'https://beta.solidfind.id/sign-in?__clerk_ticket=ticket-123&next=%2Fcompany-dashboard%2Fedit'
  );
});

test('buildTicketSignInUrl omits unsafe next path', async () => {
  const { buildTicketSignInUrl } = await loadModule();

  assert.equal(
    buildTicketSignInUrl({
      appUrl: 'https://beta.solidfind.id',
      ticket: 'ticket-123',
      nextPath: 'https://evil.example/steal',
    }),
    'https://beta.solidfind.id/sign-in?__clerk_ticket=ticket-123'
  );
});

test('getPostAuthRedirectPath keeps company users inside company routes', async () => {
  const { getPostAuthRedirectPath } = await loadModule();

  assert.equal(
    getPostAuthRedirectPath({ accountType: 'company', requestedNextPath: '/company-dashboard/edit' }),
    '/company-dashboard/edit'
  );
  assert.equal(
    getPostAuthRedirectPath({ accountType: 'company', requestedNextPath: '/dashboard' }),
    '/company-dashboard'
  );
});

test('getPostAuthRedirectPath keeps individual users inside individual routes', async () => {
  const { getPostAuthRedirectPath } = await loadModule();

  assert.equal(
    getPostAuthRedirectPath({ accountType: 'individual', requestedNextPath: '/dashboard?tab=saved' }),
    '/dashboard?tab=saved'
  );
  assert.equal(
    getPostAuthRedirectPath({ accountType: 'individual', requestedNextPath: '/company-dashboard/edit' }),
    '/dashboard'
  );
});

test('createMagicLinkToken round-trips a signed token payload', async () => {
  const { createMagicLinkToken, parseMagicLinkToken } = await loadModule();

  const token = createMagicLinkToken({
    secret: 'super-secret',
    payload: {
      clerkUserId: 'user_123',
      companyName: 'Balitecture',
      expiresAt: 1777888800000,
      targetPath: '/company-dashboard/edit',
    },
  });

  assert.deepEqual(
    parseMagicLinkToken({ secret: 'super-secret', token }),
    {
      clerkUserId: 'user_123',
      companyName: 'Balitecture',
      expiresAt: 1777888800000,
      targetPath: '/company-dashboard/edit',
    }
  );
});

test('parseMagicLinkToken rejects tampered tokens', async () => {
  const { createMagicLinkToken, parseMagicLinkToken } = await loadModule();

  const token = createMagicLinkToken({
    secret: 'super-secret',
    payload: {
      clerkUserId: 'user_123',
      companyName: 'Balitecture',
      expiresAt: 1777888800000,
      targetPath: '/company-dashboard/edit',
    },
  });

  const tamperedToken = `${token.slice(0, -1)}x`;
  assert.equal(parseMagicLinkToken({ secret: 'super-secret', token: tamperedToken }), null);
});
