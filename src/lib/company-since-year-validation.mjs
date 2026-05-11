export const MIN_COMPANY_SINCE_YEAR = 1980;

export function getMaxCompanySinceYear() {
  return new Date().getFullYear();
}

export function normalizeCompanySinceYearInput(value) {
  return (value || "").replace(/\D/g, "").slice(0, 4);
}

export function isValidCompanySinceYear(value, maxYear = getMaxCompanySinceYear()) {
  const normalized = String(value || "").trim();
  if (!/^\d{4}$/.test(normalized)) return false;

  const year = Number(normalized);
  return year >= MIN_COMPANY_SINCE_YEAR && year <= maxYear;
}
