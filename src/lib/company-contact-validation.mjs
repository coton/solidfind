const PHONE_PATTERN = /^\+?[0-9][0-9\s().-]{6,22}[0-9]$/;
const WHATSAPP_PATTERN = /^[1-9][0-9]{7,14}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const WEBSITE_PATTERN = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i;
const HANDLE_PATTERN = /^@?[a-z0-9._-]{2,}$/i;

function hasValue(value) {
  return String(value ?? "").trim().length > 0;
}

export function isValidPhone(value) {
  if (!hasValue(value)) return true;
  return PHONE_PATTERN.test(String(value).trim());
}

export function isValidWhatsApp(value) {
  if (!hasValue(value)) return true;
  return WHATSAPP_PATTERN.test(String(value).trim());
}

export function isValidEmail(value) {
  if (!hasValue(value)) return true;
  return EMAIL_PATTERN.test(String(value).trim());
}

export function isValidWebsite(value) {
  if (!hasValue(value)) return true;
  return WEBSITE_PATTERN.test(String(value).trim());
}

export function isValidSocialProfile(value, network) {
  if (!hasValue(value)) return true;
  const trimmed = String(value).trim();
  if (WEBSITE_PATTERN.test(trimmed)) return true;
  if (network === "instagram") return HANDLE_PATTERN.test(trimmed);
  return /^[a-z0-9][a-z0-9._/-]{2,}$/i.test(trimmed);
}

