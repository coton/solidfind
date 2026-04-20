const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function cleanString(value) {
  if (value === undefined || value === null) return undefined;
  const normalized = String(value).replace(/\r\n/g, '\n').trim();
  return normalized || undefined;
}

function cleanEmail(value) {
  const normalized = cleanString(value);
  return normalized ? normalized.toLowerCase() : undefined;
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

function inferPrimaryCategory({ sourceName, rowCategoryValue }) {
  const source = `${sourceName || ''} ${rowCategoryValue || ''}`.toLowerCase();
  if (source.includes('construction')) return 'construction';
  if (source.includes('renovation')) return 'renovation';
  if (source.includes('architecture')) return 'architecture';
  if (source.includes('interior')) return 'interior';
  if (source.includes('real estate') || source.includes('real-estate')) return 'real-estate';
  throw new Error(`Unable to infer primary category from source "${sourceName || ''}" and value "${rowCategoryValue || ''}"`);
}

function mapCategorySelections(primaryCategory, rowCategoryValue) {
  const raw = cleanString(rowCategoryValue);
  if (!raw) {
    return {
      constructionTypes: [],
      renovationTypes: [],
      architectureTypes: [],
      interiorTypes: [],
      realEstateTypes: [],
    };
  }

  const normalized = raw.toLowerCase();
  const categoryMap = {
    construction: 'constructionTypes',
    renovation: 'renovationTypes',
    architecture: 'architectureTypes',
    interior: 'interiorTypes',
    'real-estate': 'realEstateTypes',
  };
  const optionByCategory = {
    construction: normalized.includes('any') || normalized.includes('all') ? 'all' : normalized,
    renovation: normalized.includes('any') || normalized.includes('every') ? 'every' : normalized,
    architecture: normalized.includes('any') || normalized.includes('all') ? 'all' : normalized,
    interior: normalized.includes('any') || normalized.includes('all') ? 'all' : normalized,
    'real-estate': normalized.includes('any') || normalized.includes('all') ? 'all' : normalized,
  };

  return {
    constructionTypes: [],
    renovationTypes: [],
    architectureTypes: [],
    interiorTypes: [],
    realEstateTypes: [],
    [categoryMap[primaryCategory]]: [optionByCategory[primaryCategory]],
  };
}

function collectPictureUrls(row) {
  return Object.keys(row)
    .filter((key) => /^Picture\s+\d+\s+URL$/i.test(key.trim()))
    .sort((a, b) => {
      const aNum = Number.parseInt(a.match(/(\d+)/)?.[1] || '0', 10);
      const bNum = Number.parseInt(b.match(/(\d+)/)?.[1] || '0', 10);
      return aNum - bNum;
    })
    .map((key) => cleanString(row[key]))
    .filter(Boolean);
}

function normalizeCompanyDirectoryRow(row, { sourceName } = {}) {
  const name = cleanString(row['Company Name']);
  const email = cleanEmail(row.Email);
  const password = cleanString(row['Password Format']);
  const primaryCategory = inferPrimaryCategory({
    sourceName,
    rowCategoryValue: row.Categories,
  });
  const locationSelections = parseDelimitedCell(row.Provinces);
  const categorySelections = mapCategorySelections(primaryCategory, row.Categories);

  return {
    name,
    email,
    password,
    description: cleanString(row.Description),
    primaryCategory,
    locationSelections,
    location: locationSelections[0] || 'bali',
    address: cleanString(row.Address),
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
    imageUrl: cleanString(row['Company Logo ']) || cleanString(row['Company Logo']),
    projectImageUrls: collectPictureUrls(row),
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
  };
}

function buildCompanyMutationPayload(normalized) {
  return {
    name: normalized.name,
    description: normalized.description,
    category: normalized.primaryCategory,
    location: normalized.location,
    address: normalized.address,
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
  return rows;
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
      .filter((row) => row.some((value) => cleanString(value)))
      .map((values) => {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] ?? '';
        });
        return row;
      });
  }
  throw new Error(`Unsupported file type: ${filePath}`);
}

module.exports = {
  buildCompanyMutationPayload,
  inferPrimaryCategory,
  loadRowsFromFile,
  normalizeCompanyDirectoryRow,
  parseCsvText,
  parseDelimitedCell,
};
