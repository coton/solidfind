#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  loadRowsFromFile,
  normalizeCompanyDirectoryRow,
} = require('../src/lib/company-directory-import.cjs');

const projectRoot = path.join(__dirname, '..');
const directoryRoot = path.join(projectRoot, '..', 'Directory_Companies');
const constructionFile = path.join(directoryRoot, 'Living_id_Construction_Directory_50_Companies-Gemini-6-Final.xlsx');
const renovationFile = path.join(directoryRoot, 'Living_id_Renovation_Directory_50_Companies-Gemini-6-Final.xlsx');
const outputDir = path.join(directoryRoot, 'prepared-real-company-update');
const skippedCompanyNames = new Set([
  'elditi projects',
]);

function escapeCsv(value) {
  const text = String(value ?? '').replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeCsv(filePath, headers, rows) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const lines = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(',')),
  ];
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
}

function normalizeName(value) {
  return String(value || '').trim().toLowerCase();
}

function loadSourceRows(label, filePath) {
  const sourceName = path.basename(filePath);
  return loadRowsFromFile(filePath).map((row, index) => {
    const normalized = normalizeCompanyDirectoryRow(row, { sourceName });
    return {
      source: label,
      rowNumber: index + 2,
      raw: row,
      normalized,
    };
  });
}

function countValues(rows, field) {
  const counts = new Map();
  for (const row of rows) {
    for (const value of row.normalized[field] || []) {
      counts.set(value, (counts.get(value) || 0) + 1);
    }
  }
  return Object.fromEntries([...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}

function main() {
  const constructionRows = loadSourceRows('construction', constructionFile);
  const renovationRows = loadSourceRows('renovation', renovationFile);
  const constructionNames = new Set(constructionRows.map((row) => normalizeName(row.normalized.name)));
  const duplicateRenovationRows = renovationRows.filter((row) => constructionNames.has(normalizeName(row.normalized.name)));
  const filteredRenovationRows = renovationRows.filter((row) => !constructionNames.has(normalizeName(row.normalized.name)));
  const skippedRows = [...constructionRows, ...filteredRenovationRows]
    .filter((row) => skippedCompanyNames.has(normalizeName(row.normalized.name)));
  const combinedRows = [...constructionRows, ...filteredRenovationRows]
    .filter((row) => !skippedCompanyNames.has(normalizeName(row.normalized.name)));

  const renovationHeaders = Object.keys(renovationRows[0]?.raw || {});
  const filteredRenovationPath = path.join(outputDir, 'Living_id_Renovation_Directory_50_Companies-Gemini-6-Final-deduped.csv');
  writeCsv(filteredRenovationPath, renovationHeaders, filteredRenovationRows.map((row) => row.raw));

  const magicLinkSourcePath = path.join(outputDir, 'company-magic-link-source-all-companies.csv');
  writeCsv(
    magicLinkSourcePath,
    ['Company Name', 'Source', 'Email'],
    combinedRows.map((row) => ({
      'Company Name': row.normalized.name,
      Source: row.source,
      Email: row.normalized.accountEmail,
    }))
  );

  const rowReportPath = path.join(outputDir, 'company-import-local-dry-run.csv');
  writeCsv(
    rowReportPath,
    [
      'Company Name',
      'Source',
      'Email',
      'Account Email',
      'Primary Category',
      'Construction Types',
      'Renovation Types',
      'Locations',
      'Needs Email',
    ],
    combinedRows.map((row) => ({
      'Company Name': row.normalized.name,
      Source: row.source,
      Email: row.normalized.email || '',
      'Account Email': row.normalized.accountEmail,
      'Primary Category': row.normalized.primaryCategory,
      'Construction Types': (row.normalized.constructionTypes || []).join('; '),
      'Renovation Types': (row.normalized.renovationTypes || []).join('; '),
      Locations: (row.normalized.locationSelections || []).join('; '),
      'Needs Email': row.normalized.email ? '' : 'yes',
    }))
  );

  const summary = {
    constructionFile,
    renovationFile,
    outputDir,
    sourceRows: {
      construction: constructionRows.length,
      renovation: renovationRows.length,
      total: constructionRows.length + renovationRows.length,
    },
    preparedRows: combinedRows.length,
    duplicateRowsExcludedFromRenovation: duplicateRenovationRows.map((row) => row.normalized.name),
    skippedCompanies: skippedRows.map((row) => row.normalized.name),
    missingEmailCompanies: combinedRows
      .filter((row) => !row.normalized.email)
      .map((row) => ({ name: row.normalized.name, source: row.source })),
    categoryCounts: {
      constructionTypes: countValues(combinedRows, 'constructionTypes'),
      renovationTypes: countValues(combinedRows, 'renovationTypes'),
    },
    files: {
      filteredRenovationPath,
      magicLinkSourcePath,
      rowReportPath,
    },
  };

  const summaryPath = path.join(outputDir, 'company-import-local-dry-run-summary.json');
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ ...summary, summaryPath }, null, 2));
}

main();
