const STREET_MARKERS = [
  /\bjl\.?\b/i,
  /\bjalan\b/i,
  /\braya\b/i,
  /\bgang\b/i,
  /\bbr\.?\b/i,
  /\bbanjar\b/i,
  /\bno\.?\s*\w+/i,
];

const PLACE_MARKERS = [
  /\bbali\b/i,
  /\bbadung\b/i,
  /\bdenpasar\b/i,
  /\btabanan\b/i,
  /\bgianyar\b/i,
  /\bklungkung\b/i,
  /\bkarangasem\b/i,
  /\bbangli\b/i,
  /\bbuleleng\b/i,
  /\bjembrana\b/i,
  /\bkuta\b/i,
  /\bubud\b/i,
  /\bcanggu\b/i,
  /\bseminyak\b/i,
  /\bsanur\b/i,
  /\bpecatu\b/i,
];

const GOOGLE_MAPS_URL = /^https?:\/\/(?:www\.)?(?:google\.[a-z.]+\/maps|maps\.app\.goo\.gl)\//i;

export function normalizeCompanyAddress(address) {
  return (address || "").trim().replace(/\s+/g, " ");
}

export function isLikelyCompanyAddress(address) {
  const normalized = normalizeCompanyAddress(address);
  if (!normalized) return false;
  if (GOOGLE_MAPS_URL.test(normalized)) return true;
  if (normalized.length < 10) return false;

  const words = normalized.match(/[A-Za-zÀ-ÿ0-9]+/g) || [];
  if (words.length < 3) return false;

  const hasSeparator = /[,/]/.test(normalized);
  const hasNumber = /\d/.test(normalized);
  const hasStreetMarker = STREET_MARKERS.some((pattern) => pattern.test(normalized));
  const hasPlaceMarker = PLACE_MARKERS.some((pattern) => pattern.test(normalized));

  return (hasStreetMarker && (hasNumber || hasPlaceMarker || hasSeparator))
    || (hasPlaceMarker && hasSeparator && words.length >= 4);
}

export const COMPANY_ADDRESS_VALIDATION_MESSAGE = "Please enter a valid address, for example: Jl. Raya Seminyak No.17, Badung, Bali.";
