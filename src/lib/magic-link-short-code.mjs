import crypto from 'node:crypto';
import { normalizeCompanySlug } from './company-profile-url.mjs';

export function buildMagicLinkShortCode({
  companyName,
  companyId,
  clerkUserId,
  expiresAt,
  salt = '',
}) {
  const companySlug = normalizeCompanySlug(companyName).slice(0, 48);
  const fingerprint = crypto
    .createHash('sha256')
    .update([
      companyName,
      companyId,
      clerkUserId,
      expiresAt,
      salt,
    ].map((value) => String(value ?? '')).join('|'))
    .digest('base64url')
    .replace(/_/g, '')
    .replace(/-/g, '')
    .toLowerCase()
    .slice(0, 7);

  return `solidfind-${companySlug}-${fingerprint}`;
}
