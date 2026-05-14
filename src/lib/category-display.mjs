export const COMPLETE_HOUSE_CHILDREN = [
  "living",
  "kitchen",
  "bathroom",
  "bedroom",
  "electricity",
  "plumbing",
];

export function expandRenovationTypes(types = []) {
  const normalized = types.map((type) => String(type).toLowerCase());
  if (!normalized.includes("complete")) return normalized;
  return Array.from(new Set([...normalized, ...COMPLETE_HOUSE_CHILDREN]));
}

export function buildCategoryOptionLabelMap(pageConfigs = []) {
  const map = new Map();
  for (const page of pageConfigs) {
    const categoryOptions = page.filters?.find((filter) => filter.id === "categories")?.options ?? [];
    for (const option of categoryOptions) {
      map.set(`${page.categoryId}:${option.id}`, option.label);
      map.set(option.id, option.label);
    }
  }
  return map;
}

export function formatCategoryValues(values = [], labelMap = new Map(), categoryId = "") {
  return values
    .map((value) => labelMap.get(`${categoryId}:${value}`) ?? labelMap.get(value) ?? humanizeCategoryValue(value))
    .join(", ");
}

function humanizeCategoryValue(value) {
  return String(value ?? "")
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
