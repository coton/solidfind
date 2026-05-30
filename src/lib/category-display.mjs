export const COMPLETE_HOUSE_CHILDREN = [
  "living",
  "kitchen",
  "bathroom",
  "bedroom",
  "electricity",
  "plumbing",
];

export const COMPLETE_HOUSE_PROFILE_CHILDREN = [
  "living",
  "kitchen",
  "bathroom",
  "bedroom",
];

const PROJECT_SIZE_OPTIONS = ["solo", "family", "shared"];

const CATEGORY_CHILDREN = {
  construction: ["residential", "commercial", "hospitality"],
  renovation: [
    "complete",
    "living",
    "kitchen",
    "bathroom",
    "bedroom",
    "aircon",
    "electricity",
    "plumbing",
    "roofing",
    "waterproofing",
    "pool",
    "mold",
    "tiling",
    "painting",
    "fencing",
  ],
};

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

export function expandProfileCategoryValues(values = [], categoryId = "") {
  const normalized = values.map((value) => String(value ?? "").toLowerCase()).filter(Boolean);
  const expanded = [];
  for (const value of normalized) {
    if ((value === "all" || value === "every") && CATEGORY_CHILDREN[categoryId]) {
      expanded.push(...CATEGORY_CHILDREN[categoryId]);
    } else if (categoryId === "renovation" && value === "complete") {
      expanded.push("complete", ...COMPLETE_HOUSE_PROFILE_CHILDREN);
    } else {
      expanded.push(value);
    }
  }
  return Array.from(new Set(expanded));
}

export function formatProfileCategoryValues(values = [], labelMap = new Map(), categoryId = "") {
  return formatCategoryValues(expandProfileCategoryValues(values, categoryId), labelMap, categoryId);
}

export function expandProfileProjectSizes(values = []) {
  const normalized = values.map((value) => String(value ?? "").toLowerCase()).filter(Boolean);
  if (normalized.includes("any")) return PROJECT_SIZE_OPTIONS;
  return Array.from(new Set(normalized));
}

function humanizeCategoryValue(value) {
  return String(value ?? "")
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
