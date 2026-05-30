const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const IMAGE_EXTENSIONS = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp']);
const IMAGE_CONTENT_TYPES = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};
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

function cleanString(value) {
  if (value === undefined || value === null) return undefined;
  const normalized = String(value).replace(/\r\n/g, '\n').trim();
  return normalized || undefined;
}

function cleanEmail(value) {
  const normalized = cleanString(value);
  return normalized ? normalized.toLowerCase() : undefined;
}

function isLikelyCompanyAddress(address) {
  const normalized = cleanString(address);
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

function cleanAddress(value) {
  const normalized = cleanString(value);
  return normalized && isLikelyCompanyAddress(normalized) ? normalized : undefined;
}

function buildTemporaryCompanyEmail(companyName) {
  const normalized = normalizeLookupName(companyName) || 'company';
  let hash = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    hash = ((hash * 31) + normalized.charCodeAt(i)) >>> 0;
  }
  return `temp+${hash.toString(36).padStart(6, '0').slice(0, 6)}@solidfind.id`;
}

function buildTemporaryCompanyPassword(companyName) {
  const localPart = buildTemporaryCompanyEmail(companyName).split('@')[0].replace(/[^a-z0-9]/gi, '');
  return `Sf-${localPart}-A1!`;
}

function parseDelimitedCell(value) {
  const normalized = cleanString(value);
  if (!normalized) return [];
  return normalized
    .split(/[;,]/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function parseOptionalNumber(value) {
  const normalized = cleanString(value);
  if (!normalized) return undefined;
  const numeric = Number.parseInt(normalized.replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function normalizeLookupName(value) {
  return cleanString(value)
    ?.toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function isFolderPlaceholder(value) {
  const normalized = normalizeLookupName(value);
  return normalized === 'in folder' || normalized === 'folder' || normalized === 'zip' || normalized === 'in zip';
}

function cleanMediaReference(value) {
  const normalized = cleanString(value);
  return normalized && !isFolderPlaceholder(normalized) ? normalized : undefined;
}

function inferPrimaryCategory({ sourceName, rowCategoryValue }) {
  const source = `${sourceName || ''} ${rowCategoryValue || ''}`.toLowerCase();
  if (source.includes('construction')) return 'construction';
  if (source.includes('renovation')) return 'renovation';
  if (source.includes('architecture')) return 'architecture';
  if (source.includes('interior')) return 'interior';
  if (source.includes('real estate') || source.includes('real-estate')) return 'real-estate';
  throw new Error(`Unable to infer primary category from source "${sourceName || ''}" and value "${rowCategoryValue || ''}"`);
}

const CATEGORY_FIELD_BY_PRIMARY = {
  construction: 'constructionTypes',
  renovation: 'renovationTypes',
  architecture: 'architectureTypes',
  interior: 'interiorTypes',
  'real-estate': 'realEstateTypes',
};

const CATEGORY_ALIASES = {
  construction: {
    all: 'all',
    'all types': 'all',
    'any type': 'all',
    'any types': 'all',
    residential: 'residential',
    commercial: 'commercial',
    hospitality: 'hospitality',
  },
  renovation: {
    every: 'every',
    'every renovation': 'every',
    'every renovations': 'every',
    'any renovation': 'every',
    'any renovations': 'every',
    'complete house': 'complete',
    'living room': 'living',
    kitchen: 'kitchen',
    bathroom: 'bathroom',
    bedroom: 'bedroom',
    aircon: 'aircon',
    ac: 'aircon',
    electricity: 'electricity',
    plumbing: 'plumbing',
    roofing: 'roofing',
    waterproofing: 'waterproofing',
    pool: 'pool',
    'mold treatment': 'mold',
    'mold treament': 'mold',
    mold: 'mold',
    tiling: 'tiling',
    painting: 'painting',
    fencing: 'fencing',
  },
  architecture: {
    all: 'all',
    'all types': 'all',
    'any type': 'all',
    'any types': 'all',
    residential: 'residential',
    commercial: 'commercial',
    'renovations and extensions': 'renovations-extensions',
    'renovation and extensions': 'renovations-extensions',
    'renovations extensions': 'renovations-extensions',
    'sustainable eco archi': 'sustainable-eco',
    sustainable: 'sustainable-eco',
    'eco archi': 'sustainable-eco',
  },
  interior: {
    all: 'all',
    'all types': 'all',
    'any type': 'all',
    'any types': 'all',
    residential: 'residential',
    commercial: 'commercial',
    hospitality: 'hospitality',
    furnitures: 'furnitures',
    furniture: 'furnitures',
    lighting: 'lighting',
    'styling decoration': 'styling-decoration',
    styling: 'styling-decoration',
    decoration: 'styling-decoration',
  },
  'real-estate': {
    all: 'all',
    'all types': 'all',
    'any type': 'all',
    'any types': 'all',
    residential: 'residential',
    commercial: 'commercial',
    'land development plots': 'land-development',
    'land development': 'land-development',
    'property management': 'property-management',
    'legal notary services': 'legal-notary',
    'legal notary': 'legal-notary',
  },
};

function normalizeCategoryKeyword(value) {
  return cleanString(value)
    ?.toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function mapCategorySelections(primaryCategory, rowCategoryValue) {
  const raw = cleanString(rowCategoryValue);
  if (!raw || !CATEGORY_FIELD_BY_PRIMARY[primaryCategory]) {
    return {
      constructionTypes: [],
      renovationTypes: [],
      architectureTypes: [],
      interiorTypes: [],
      realEstateTypes: [],
    };
  }

  const tokens = parseDelimitedCell(raw).map((token) => normalizeCategoryKeyword(token)).filter(Boolean);
  const mapSelectionsForCategory = (category, { includeUnknown = false } = {}) => {
    const aliases = CATEGORY_ALIASES[category] || {};
    const otherAliases = Object.entries(CATEGORY_ALIASES)
      .filter(([otherCategory]) => otherCategory !== category)
      .flatMap(([, otherCategoryAliases]) => Object.keys(otherCategoryAliases));
    const selections = [...new Set(tokens
      .map((token) => {
        if (aliases[token]) return aliases[token];
        if (otherAliases.includes(token)) return null;
        return includeUnknown ? token : null;
      })
      .filter(Boolean))];

    if (selections.includes('all')) return ['all'];
    if (selections.includes('every')) return ['every'];
    return selections;
  };

  const result = {
    constructionTypes: [],
    renovationTypes: [],
    architectureTypes: [],
    interiorTypes: [],
    realEstateTypes: [],
  };
  const primaryField = CATEGORY_FIELD_BY_PRIMARY[primaryCategory];
  result[primaryField] = mapSelectionsForCategory(primaryCategory, { includeUnknown: true });

  if (primaryCategory === 'construction') {
    result.renovationTypes = mapSelectionsForCategory('renovation');
  } else if (primaryCategory === 'renovation') {
    result.constructionTypes = mapSelectionsForCategory('construction');
  }

  return result;
}

function collectPictureUrls(row) {
  return Object.keys(row)
    .filter((key) => /^Picture\s+\d+\s+URL$/i.test(key.trim()))
    .sort((a, b) => {
      const aNum = Number.parseInt(a.match(/(\d+)/)?.[1] || '0', 10);
      const bNum = Number.parseInt(b.match(/(\d+)/)?.[1] || '0', 10);
      return aNum - bNum;
    })
    .map((key) => cleanMediaReference(row[key]))
    .filter(Boolean);
}

function normalizeCompanyDirectoryRow(row, { sourceName } = {}) {
  const name = cleanString(row['Company Name']);
  const email = cleanEmail(row.Email);
  const accountEmail = email || buildTemporaryCompanyEmail(name);
  const password = cleanString(row['Password Format']) || buildTemporaryCompanyPassword(name);
  const primaryCategory = inferPrimaryCategory({
    sourceName,
    rowCategoryValue: row.Categories,
  });
  const locationSelections = parseDelimitedCell(row.Provinces);
  const categorySelections = mapCategorySelections(primaryCategory, row.Categories);

  return {
    name,
    email,
    accountEmail,
    usesTemporaryEmail: !email,
    password,
    description: cleanString(row.Description),
    primaryCategory,
    locationSelections,
    location: locationSelections[0] || 'bali',
    address: cleanAddress(row.Address),
    phone: cleanString(row['Phone Number']),
    website: cleanString(row.Website),
    whatsapp: cleanString(row.WhatsApp),
    facebook: cleanString(row.Facebook),
    linkedin: cleanString(row.LinkedIn),
    instagram: cleanString(row.Instagram),
    projects: parseOptionalNumber(row.Projects),
    teamSize: parseOptionalNumber(row['Team Size']),
    since: parseOptionalNumber(row['Since Year']),
    googleMapsLink: cleanString(row['Google Maps Link']),
    imageUrl: cleanMediaReference(row['Company Logo ']) || cleanMediaReference(row['Company Logo']),
    projectImageUrls: collectPictureUrls(row),
    imageFilePath: undefined,
    projectImageFilePaths: [],
    projectSizes: ['any'],
    constructionTypes: categorySelections.constructionTypes,
    constructionLocations: locationSelections,
    renovationTypes: categorySelections.renovationTypes,
    renovationLocations: locationSelections,
    architectureTypes: categorySelections.architectureTypes,
    architectureLocations: locationSelections,
    interiorTypes: categorySelections.interiorTypes,
    interiorLocations: locationSelections,
    realEstateTypes: categorySelections.realEstateTypes,
    realEstateLocations: locationSelections,
    isPro: false,
    isReviewed: false,
  };
}

function buildCompanyMutationPayload(normalized) {
  return {
    name: normalized.name,
    description: normalized.description,
    category: normalized.primaryCategory,
    location: normalized.location,
    address: normalized.address,
    googleMapsLink: normalized.googleMapsLink,
    isPro: Boolean(normalized.isPro),
    projects: normalized.projects,
    teamSize: normalized.teamSize,
    phone: normalized.phone,
    email: normalized.email,
    website: normalized.website,
    whatsapp: normalized.whatsapp,
    facebook: normalized.facebook,
    linkedin: normalized.linkedin,
    instagram: normalized.instagram,
    since: normalized.since,
    imageUrl: normalized.imageUrl,
    projectImageUrls: normalized.projectImageUrls,
    isReviewed: normalized.isReviewed,
    projectSizes: normalized.projectSizes,
    constructionTypes: normalized.constructionTypes,
    constructionLocations: normalized.constructionLocations,
    renovationTypes: normalized.renovationTypes,
    renovationLocations: normalized.renovationLocations,
    architectureTypes: normalized.architectureTypes,
    architectureLocations: normalized.architectureLocations,
    interiorTypes: normalized.interiorTypes,
    interiorLocations: normalized.interiorLocations,
    realEstateTypes: normalized.realEstateTypes,
    realEstateLocations: normalized.realEstateLocations,
  };
}

function normalizeUrlList(values) {
  return (Array.isArray(values) ? values : []).map((value) => cleanString(value)).filter(Boolean);
}

function normalizePathList(values) {
  return (Array.isArray(values) ? values : []).map((value) => cleanString(value)).filter(Boolean);
}

function arraysEqual(left, right) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

async function fetchWithTimeout(fetchImpl, url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(`Timed out fetching media after ${timeoutMs}ms: ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function uploadRemoteAssetToStorage({ sourceUrl, generateUploadUrl, fetchImpl = fetch }) {
  const response = await fetchWithTimeout(fetchImpl, sourceUrl, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; SolidFindBot/1.0; +https://solidfind.id)',
      accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to download remote media (${response.status}): ${sourceUrl}`);
  }

  const uploadUrl = await generateUploadUrl();
  const contentType = response.headers?.get?.('content-type') || 'application/octet-stream';
  const uploadResponse = await fetchWithTimeout(fetchImpl, uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body: Buffer.from(await response.arrayBuffer()),
  }, 30000);

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload remote media into Convex storage: ${sourceUrl}`);
  }

  const payload = await uploadResponse.json();
  if (!payload?.storageId) {
    throw new Error(`Convex storage upload did not return a storageId for: ${sourceUrl}`);
  }

  return payload.storageId;
}

async function tryUploadRemoteAssetToStorage(options) {
  try {
    return {
      ok: true,
      storageId: await uploadRemoteAssetToStorage(options),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function uploadLocalAssetToStorage({ filePath, generateUploadUrl, fetchImpl = fetch }) {
  const uploadUrl = await generateUploadUrl();
  const extension = path.extname(filePath).toLowerCase();
  const contentType = IMAGE_CONTENT_TYPES[extension] || 'application/octet-stream';
  const uploadResponse = await fetchWithTimeout(fetchImpl, uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body: fs.readFileSync(filePath),
  }, 30000);

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload local media into Convex storage: ${filePath}`);
  }

  const payload = await uploadResponse.json();
  if (!payload?.storageId) {
    throw new Error(`Convex storage upload did not return a storageId for: ${filePath}`);
  }

  return payload.storageId;
}

async function tryUploadLocalAssetToStorage(options) {
  try {
    return {
      ok: true,
      storageId: await uploadLocalAssetToStorage(options),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function isImageFile(filePath) {
  return IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function listDirectories(rootDir, maxDepth = 3) {
  const directories = [];
  const walk = (dir, depth) => {
    if (depth > maxDepth) return;
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      const fullPath = path.join(dir, entry.name);
      directories.push(fullPath);
      walk(fullPath, depth + 1);
    }
  };
  walk(rootDir, 1);
  return directories;
}

function discoverCompanyMedia({ mediaRoot, companyName, primaryCategory }) {
  if (!mediaRoot || !companyName || !fs.existsSync(mediaRoot)) {
    return { imageFilePath: undefined, projectImageFilePaths: [] };
  }

  const targetName = normalizeLookupName(companyName);
  const categoryName = normalizeLookupName(primaryCategory);
  const matchingDirs = listDirectories(mediaRoot)
    .filter((dir) => normalizeLookupName(path.basename(dir)) === targetName)
    .sort((left, right) => {
      const leftHasCategory = categoryName && normalizeLookupName(left).includes(categoryName) ? 0 : 1;
      const rightHasCategory = categoryName && normalizeLookupName(right).includes(categoryName) ? 0 : 1;
      return leftHasCategory - rightHasCategory || left.length - right.length;
    });

  const companyDir = matchingDirs[0];
  if (!companyDir) {
    return { imageFilePath: undefined, projectImageFilePaths: [] };
  }

  const files = fs.readdirSync(companyDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(companyDir, entry.name))
    .filter(isImageFile)
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' }));

  const imageFilePath = files.find((filePath) => /^logo(?:\b|[-_\s.])/i.test(path.basename(filePath)));
  const projectImageFilePaths = files.filter((filePath) => filePath !== imageFilePath);

  return { imageFilePath, projectImageFilePaths };
}

async function resolveStoredCompanyMedia({
  normalized,
  existingCompany,
  generateUploadUrl,
  fetchImpl = fetch,
}) {
  const imageUrl = cleanString(normalized?.imageUrl);
  const projectImageUrls = normalizeUrlList(normalized?.projectImageUrls);
  const imageFilePath = cleanString(normalized?.imageFilePath);
  const projectImageFilePaths = normalizePathList(normalized?.projectImageFilePaths);

  const existingImageUrl = cleanString(existingCompany?.imageUrl);
  const existingProjectImageUrls = normalizeUrlList(existingCompany?.projectImageUrls);
  const existingProjectImageIds = Array.isArray(existingCompany?.projectImageIds)
    ? existingCompany.projectImageIds.filter(Boolean)
    : [];

  const media = {
    imageUrl,
    projectImageUrls,
  };

  if (imageUrl) {
    if (imageUrl === existingImageUrl && existingCompany?.logoId) {
      media.logoId = existingCompany.logoId;
    } else {
      const uploadedLogo = await tryUploadRemoteAssetToStorage({ sourceUrl: imageUrl, generateUploadUrl, fetchImpl });
      if (uploadedLogo.ok) {
        media.logoId = uploadedLogo.storageId;
      } else {
        media.logoUploadError = uploadedLogo.error;
      }
    }
  } else if (imageFilePath) {
    const uploadedLogo = await tryUploadLocalAssetToStorage({ filePath: imageFilePath, generateUploadUrl, fetchImpl });
    if (uploadedLogo.ok) {
      media.logoId = uploadedLogo.storageId;
    } else {
      media.logoUploadError = uploadedLogo.error;
    }
  }

  if (!projectImageFilePaths.length && arraysEqual(projectImageUrls, existingProjectImageUrls) && existingProjectImageIds.length === projectImageUrls.length) {
    media.projectImageIds = existingProjectImageIds;
    media.projectImageUrls = [];
  } else {
    const storedIds = [];
    const fallbackUrls = [];
    const uploadErrors = [];

    for (const sourceUrl of projectImageUrls) {
      const uploaded = await tryUploadRemoteAssetToStorage({ sourceUrl, generateUploadUrl, fetchImpl });
      if (uploaded.ok) {
        storedIds.push(uploaded.storageId);
      } else {
        fallbackUrls.push(sourceUrl);
        uploadErrors.push({ sourceUrl, error: uploaded.error });
      }
    }
    for (const filePath of projectImageFilePaths) {
      const uploaded = await tryUploadLocalAssetToStorage({ filePath, generateUploadUrl, fetchImpl });
      if (uploaded.ok) {
        storedIds.push(uploaded.storageId);
      } else {
        uploadErrors.push({ sourceUrl: filePath, error: uploaded.error });
      }
    }

    media.projectImageIds = storedIds;
    media.projectImageUrls = fallbackUrls;
    media.projectImageUploadErrors = uploadErrors;
  }

  return media;
}

function parseCsvText(content) {
  const rows = [];
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  if (!lines.length) return rows;

  const parseLine = (line) => {
    const out = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }
      if (char === ',' && !inQuotes) {
        out.push(current);
        current = '';
        continue;
      }
      current += char;
    }
    out.push(current);
    return out;
  };

  const headers = parseLine(lines[0]);
  for (const line of lines.slice(1)) {
    const values = parseLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    rows.push(row);
  }
  return rows.filter((row) => cleanString(row['Company Name'] || row.companyName || row.name));
}

function loadRowsFromFile(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === '.csv') {
    return parseCsvText(fs.readFileSync(filePath, 'utf8'));
  }
  if (extension === '.xlsx') {
    const script = `import json, re, sys, zipfile, xml.etree.ElementTree as ET\nfrom pathlib import Path\npath = Path(sys.argv[1])\nns = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}\ncol_re = re.compile(r'([A-Z]+)')\ndef col_to_index(ref):\n    match = col_re.match(ref or '')\n    letters = match.group(1) if match else ''\n    value = 0\n    for ch in letters:\n        value = value * 26 + (ord(ch) - 64)\n    return max(value - 1, 0)\nwith zipfile.ZipFile(path) as z:\n    shared = []\n    if 'xl/sharedStrings.xml' in z.namelist():\n        root = ET.fromstring(z.read('xl/sharedStrings.xml'))\n        for si in root.findall('main:si', ns):\n            texts = [t.text or '' for t in si.findall('.//main:t', ns)]\n            shared.append(''.join(texts))\n    sheet = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))\n    rows = []\n    for row in sheet.findall('.//main:sheetData/main:row', ns):\n        values = []\n        for cell in row.findall('main:c', ns):\n            ref = cell.attrib.get('r', '')\n            idx = col_to_index(ref)\n            while len(values) < idx:\n                values.append('')\n            cell_type = cell.attrib.get('t')\n            v = cell.find('main:v', ns)\n            is_node = cell.find('main:is', ns)\n            if is_node is not None:\n                text = ''.join(t.text or '' for t in is_node.findall('.//main:t', ns))\n            else:\n                text = '' if v is None or v.text is None else v.text\n                if cell_type == 's' and text != '':\n                    text = shared[int(text)]\n            values.append(text)\n        rows.append(values)\n    print(json.dumps(rows))`;
    const result = spawnSync('python3', ['-c', script, filePath], { encoding: 'utf8' });
    if (result.status !== 0) {
      throw new Error(result.stderr || result.stdout || `Failed to parse workbook ${filePath}`);
    }
    const parsedRows = JSON.parse(result.stdout);
    const [headers = [], ...dataRows] = parsedRows;
    return dataRows
      .map((values) => {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] ?? '';
        });
        return row;
      })
      .filter((row) => cleanString(row['Company Name'] || row.companyName || row.name));
  }
  throw new Error(`Unsupported file type: ${filePath}`);
}

module.exports = {
  buildCompanyMutationPayload,
  discoverCompanyMedia,
  inferPrimaryCategory,
  loadRowsFromFile,
  normalizeCompanyDirectoryRow,
  parseCsvText,
  parseDelimitedCell,
  resolveStoredCompanyMedia,
  tryUploadLocalAssetToStorage,
  tryUploadRemoteAssetToStorage,
  uploadLocalAssetToStorage,
  uploadRemoteAssetToStorage,
  buildTemporaryCompanyEmail,
  buildTemporaryCompanyPassword,
  isLikelyCompanyAddress,
};
