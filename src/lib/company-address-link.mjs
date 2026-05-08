export function isTrustedGoogleMapsUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return false;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;

    const host = url.hostname.toLowerCase();
    if (host === 'maps.google.com') return true;
    if ((host === 'www.google.com' || host === 'google.com') && url.pathname.startsWith('/maps')) return true;

    return false;
  } catch {
    return false;
  }
}

export function buildCompanyAddressHref(company) {
  const fallback = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company?.address || '')}`;
  const candidate = typeof company?.googleMapsLink === 'string' ? company.googleMapsLink.trim() : '';
  return isTrustedGoogleMapsUrl(candidate) ? candidate : fallback;
}