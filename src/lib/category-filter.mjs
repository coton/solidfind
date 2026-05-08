function normalizeOptionId(value) {
  return String(value ?? '').trim().toLowerCase();
}

function getNormalizedOptionMap(options = []) {
  const map = new Map();
  for (const option of options) {
    const id = normalizeOptionId(option?.id);
    if (id) map.set(id, option);
  }
  return map;
}

export function getChildSubcategoryIds(options = []) {
  return options
    .map((option) => normalizeOptionId(option?.id))
    .filter((id) => id && id !== 'all');
}

export function normalizeSubcategorySelection(selectedValues = [], options = []) {
  const optionMap = getNormalizedOptionMap(options);
  const hasExplicitOptions = optionMap.size > 0;
  const childIds = getChildSubcategoryIds(options);
  const normalized = [];
  const seen = new Set();

  for (const value of selectedValues) {
    const id = normalizeOptionId(value);
    if (!id || seen.has(id)) continue;
    if (!hasExplicitOptions || optionMap.has(id)) {
      seen.add(id);
      normalized.push(id);
    }
  }

  if (normalized.includes('all')) {
    return ['all'];
  }

  if (childIds.length > 0 && childIds.every((id) => normalized.includes(id))) {
    return ['all'];
  }

  return normalized;
}

export function parseSubcategoryParam(value, options = []) {
  if (!value) return [];
  return normalizeSubcategorySelection(String(value).split(','), options);
}

export function encodeSubcategoryParam(selectedValues = [], options = []) {
  const normalized = normalizeSubcategorySelection(selectedValues, options);
  return normalized.length > 0 ? normalized.join(',') : null;
}

export function toggleSubcategorySelection(selectedValues = [], toggledValue, options = []) {
  const toggledId = normalizeOptionId(toggledValue);
  if (!toggledId) return normalizeSubcategorySelection(selectedValues, options);

  if (toggledId === 'all') {
    return ['all'];
  }

  const current = normalizeSubcategorySelection(selectedValues, options).filter((id) => id !== 'all');
  const next = current.includes(toggledId)
    ? current.filter((id) => id !== toggledId)
    : [...current, toggledId];

  return normalizeSubcategorySelection(next, options);
}

export function getSubcategoryDisplayText(selectedValues = [], options = [], fallbackLabel = 'CATEGORIES') {
  const normalized = normalizeSubcategorySelection(selectedValues, options);
  const optionMap = getNormalizedOptionMap(options);

  if (normalized.length === 0) return fallbackLabel;
  if (normalized[0] === 'all') return optionMap.get('all')?.label ?? fallbackLabel;
  if (normalized.length === 1) return optionMap.get(normalized[0])?.label ?? fallbackLabel;
  return fallbackLabel;
}

export function isSubcategoryFilterActive(selectedValues = [], options = []) {
  return normalizeSubcategorySelection(selectedValues, options).length > 0;
}

export function isSubcategoryOptionSelected(selectedValues = [], optionId, options = []) {
  const normalized = normalizeSubcategorySelection(selectedValues, options);
  const normalizedOptionId = normalizeOptionId(optionId);

  if (normalizedOptionId === 'all') {
    return normalized.includes('all');
  }

  return !normalized.includes('all') && normalized.includes(normalizedOptionId);
}

export function getEffectiveSubcategoryFilters(selectedValues = [], options = []) {
  const normalized = normalizeSubcategorySelection(selectedValues, options);
  return normalized.includes('all') ? [] : normalized;
}
