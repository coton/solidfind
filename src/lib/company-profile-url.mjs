function normalizeSlugPart(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function normalizeCompanySlug(name) {
  return normalizeSlugPart(name) || "company";
}

export function resolveCompanySlug(company) {
  const storedSlug = typeof company?.slug === "string" ? normalizeSlugPart(company.slug) : "";
  if (storedSlug) return storedSlug;

  const fromName = typeof company?.name === "string" ? normalizeCompanySlug(company.name) : "";
  if (fromName) return fromName;

  const fromId = typeof company?._id === "string" ? normalizeSlugPart(company._id) : "";
  return fromId || "company";
}

export function buildCompanyProfilePath(company, options = {}) {
  const slug = resolveCompanySlug(company);
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null && String(value).trim()) {
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  return `/${slug}${query ? `?${query}` : ""}`;
}

export function buildCompanyReviewsPath(company, options = {}) {
  const profilePath = buildCompanyProfilePath(company, options);
  const [pathname, query = ""] = profilePath.split("?");
  return `${pathname}/reviews${query ? `?${query}` : ""}`;
}

export function ensureUniqueCompanySlug(name, existingSlugs = [], currentSlug = "") {
  const reserved = new Set(
    existingSlugs
      .map((slug) => normalizeSlugPart(slug))
      .filter(Boolean)
      .filter((slug) => slug !== normalizeSlugPart(currentSlug))
  );

  const baseSlug = normalizeCompanySlug(name);
  let candidate = baseSlug;
  let counter = 2;

  while (reserved.has(candidate)) {
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return candidate;
}