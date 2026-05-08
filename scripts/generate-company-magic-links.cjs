#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { fetchQuery } = require('convex/nextjs');
const { anyApi } = require('convex/server');
const { resolveRuntimeConfig } = require('../src/lib/admin-cleanup-test-users.cjs');
const { loadRowsFromFile } = require('../src/lib/company-directory-import.cjs');

function parseArgs(argv) {
  const args = {
    target: 'preview',
    envFile: null,
    file: null,
    companyNames: [],
    outputBase: null,
    days: 14,
    targetPath: '/company-dashboard/edit',
    apply: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--target') {
      args.target = argv[i + 1] || args.target;
      i += 1;
      continue;
    }
    if (arg.startsWith('--target=')) {
      args.target = arg.split('=')[1] || args.target;
      continue;
    }
    if (arg === '--env-file') {
      args.envFile = argv[i + 1] || null;
      i += 1;
      continue;
    }
    if (arg.startsWith('--env-file=')) {
      args.envFile = arg.split('=')[1] || null;
      continue;
    }
    if (arg === '--file') {
      args.file = argv[i + 1] || null;
      i += 1;
      continue;
    }
    if (arg.startsWith('--file=')) {
      args.file = arg.split('=')[1] || null;
      continue;
    }
    if (arg === '--company') {
      args.companyNames.push(argv[i + 1] || '');
      i += 1;
      continue;
    }
    if (arg.startsWith('--company=')) {
      args.companyNames.push(arg.split('=')[1] || '');
      continue;
    }
    if (arg === '--output-base') {
      args.outputBase = argv[i + 1] || null;
      i += 1;
      continue;
    }
    if (arg.startsWith('--output-base=')) {
      args.outputBase = arg.split('=')[1] || null;
      continue;
    }
    if (arg === '--days') {
      args.days = Number(argv[i + 1] || args.days);
      i += 1;
      continue;
    }
    if (arg.startsWith('--days=')) {
      args.days = Number(arg.split('=')[1] || args.days);
      continue;
    }
    if (arg === '--target-path') {
      args.targetPath = argv[i + 1] || args.targetPath;
      i += 1;
      continue;
    }
    if (arg.startsWith('--target-path=')) {
      args.targetPath = arg.split('=')[1] || args.targetPath;
      continue;
    }
    if (arg === '--apply') {
      args.apply = true;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      args.help = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function printHelp() {
  console.log(`Generate short company magic links and export them to CSV/XLSX.

Usage:
  node scripts/generate-company-magic-links.cjs --target preview --company Balitecture --apply
  node scripts/generate-company-magic-links.cjs --target preview --file excel-files/Living_id_Construction_Directory_TEST.xlsx --apply

Options:
  --target <preview|production>
  --env-file <path>
  --company <name>              Repeatable
  --file <path>                 Spreadsheet/CSV containing Company Name rows
  --days <n>                    Default: 14
  --target-path <path>          Default: /company-dashboard/edit
  --output-base <path>          Without extension; default under excel-files/
  --apply                       Required acknowledgement for writing export files
`);
}

function normalizeNames(values) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
}

function companyNamesFromFile(filePath) {
  const rows = loadRowsFromFile(path.resolve(filePath));
  return rows.map((row) => row['Company Name'] || row.companyName || row.name || '').filter(Boolean);
}

function buildAppUrl(target) {
  return target === 'production' ? 'https://solidfind.id' : 'https://beta.solidfind.id';
}

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeCsv(csvPath, rows) {
  const escape = (value) => {
    const stringValue = String(value ?? '');
    if (/[",\n]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };
  const header = ['Company Name', 'Magic Link'];
  const lines = [header.join(',')].concat(rows.map((row) => [row.companyName, row.magicLink].map(escape).join(',')));
  fs.writeFileSync(csvPath, `${lines.join('\n')}\n`, 'utf8');
}

function writeXlsx(xlsxPath, rows) {
  const payload = JSON.stringify(rows);
  const script = `
import json
from openpyxl import Workbook
rows = json.loads(${JSON.stringify(payload)})
wb = Workbook()
ws = wb.active
ws.title = 'Magic Links'
ws.append(['Company Name', 'Magic Link'])
for row in rows:
    ws.append([row.get('companyName', ''), row.get('magicLink', '')])
ws.column_dimensions['A'].width = 32
ws.column_dimensions['B'].width = 84
wb.save(${JSON.stringify(xlsxPath)})
`;
  const result = spawnSync('python3', ['-c', script], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || 'Failed to write XLSX file');
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || (!args.file && args.companyNames.length === 0)) {
    printHelp();
    if (!args.help) process.exitCode = 1;
    return;
  }
  if (!args.apply) {
    throw new Error('Use --apply to acknowledge writing the export files.');
  }

  const runtime = resolveRuntimeConfig(args);
  const { createMagicLinkToken, getPrimaryMagicLinkSigningSecret } = await import('../src/lib/magic-link-login.mjs');
  const signingSecret = getPrimaryMagicLinkSigningSecret({
    magicLinkSigningSecret: runtime.magicLinkSigningSecret,
    clerkSecretKey: runtime.clerkSecretKey,
  });
  if (!signingSecret) {
    throw new Error('Missing magic-link signing secret configuration. Set MAGIC_LINK_SIGNING_SECRET or CLERK_SECRET_KEY.');
  }
  const names = normalizeNames([
    ...args.companyNames,
    ...(args.file ? companyNamesFromFile(args.file) : []),
  ]);

  const companies = await fetchQuery(anyApi.companies.listAll, {}, { url: runtime.convexUrl });
  const users = await fetchQuery(anyApi.users.listAll, {}, { url: runtime.convexUrl });
  const expiresAt = Date.now() + (args.days * 24 * 60 * 60 * 1000);
  const appUrl = buildAppUrl(args.target);

  const exportedRows = [];
  for (const companyName of names) {
    const company = companies.find((item) => String(item.name || '').trim().toLowerCase() === companyName.toLowerCase());
    if (!company) {
      throw new Error(`Company not found in ${args.target}: ${companyName}`);
    }
    const owner = users.find((item) => item._id === company.ownerId);
    if (!owner) {
      throw new Error(`Owner not found for company: ${company.name}`);
    }
    if (!owner.clerkId) {
      throw new Error(`Owner ${owner._id} has no clerkId for company: ${company.name}`);
    }

    const token = createMagicLinkToken({
      secret: signingSecret,
      payload: {
        clerkUserId: owner.clerkId,
        companyName: company.name,
        expiresAt,
        targetPath: args.targetPath,
      },
    });

    exportedRows.push({
      companyName: company.name,
      magicLink: `${appUrl}/m/${token}`,
    });
  }

  const outputBase = path.resolve(args.outputBase || `excel-files/company-magic-links-${args.target}`);
  const csvPath = `${outputBase}.csv`;
  const xlsxPath = `${outputBase}.xlsx`;
  ensureParentDir(csvPath);
  writeCsv(csvPath, exportedRows);
  writeXlsx(xlsxPath, exportedRows);

  console.log(JSON.stringify({
    target: args.target,
    count: exportedRows.length,
    csvPath,
    xlsxPath,
    rows: exportedRows,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
