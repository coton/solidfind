import crypto from 'node:crypto';

const MAGIC_LINK_PURPOSE = 'solidfind-company-magic-link-v1';

export function sanitizeNextPath(value) {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith('/')) return null;
  if (trimmed.startsWith('//')) return null;
  if (trimmed.includes('\\')) return null;
  if (/[\u0000-\u001F\u007F]/.test(trimmed)) return null;
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed)) return null;
  return trimmed;
}

export function buildTicketSignInUrl({ appUrl, ticket, nextPath }) {
  const baseUrl = new URL('/sign-in', appUrl.endsWith('/') ? appUrl : `${appUrl}/`);
  baseUrl.searchParams.set('__clerk_ticket', ticket);

  const safeNextPath = sanitizeNextPath(nextPath);
  if (safeNextPath) {
    baseUrl.searchParams.set('next', safeNextPath);
  }

  return baseUrl.toString();
}

export function getPostAuthRedirectPath({ accountType, requestedNextPath }) {
  const safeNextPath = sanitizeNextPath(requestedNextPath);

  if (accountType === 'company') {
    if (safeNextPath && (safeNextPath.startsWith('/company-dashboard') || safeNextPath.startsWith('/register-business'))) {
      return safeNextPath;
    }
    return '/company-dashboard';
  }

  if (safeNextPath && safeNextPath.startsWith('/dashboard')) {
    return safeNextPath;
  }

  return '/dashboard';
}

function encodeBase64Url(value) {
  return Buffer.from(value).toString('base64url');
}

function decodeBase64Url(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

export function getMagicLinkSigningSecret(baseSecret) {
  return crypto
    .createHmac('sha256', baseSecret)
    .update(MAGIC_LINK_PURPOSE)
    .digest('base64url');
}

export function createMagicLinkToken({ secret, payload }) {
  const encodedPayload = encodeBase64Url(JSON.stringify({
    ...payload,
    purpose: MAGIC_LINK_PURPOSE,
  }));
  const signature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export function parseMagicLinkToken({ secret, token }) {
  if (!token || typeof token !== 'string') return null;
  const [encodedPayload, providedSignature, ...rest] = token.split('.');
  if (!encodedPayload || !providedSignature || rest.length > 0) return null;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');

  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (providedBuffer.length !== expectedBuffer.length) return null;
  if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) return null;

  try {
    const parsed = JSON.parse(decodeBase64Url(encodedPayload));
    if (parsed?.purpose !== MAGIC_LINK_PURPOSE) return null;
    const { purpose, ...payload } = parsed;
    return payload;
  } catch {
    return null;
  }
}
