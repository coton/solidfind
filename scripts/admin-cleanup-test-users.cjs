#!/usr/bin/env node

const {
  DEFAULT_EMAILS,
  parseArgs,
  runCleanup,
} = require('../src/lib/admin-cleanup-test-users.cjs');

function printHelp() {
  console.log(`Admin cleanup script for known SolidFind test users

Usage:
  node scripts/admin-cleanup-test-users.cjs [--target preview|production] [--apply]
  node scripts/admin-cleanup-test-users.cjs --env-file .env.preview.local --emails a@example.com,b@example.com [--apply]

Defaults:
  --target preview
  dry-run unless --apply is passed

Examples:
  node scripts/admin-cleanup-test-users.cjs
  node scripts/admin-cleanup-test-users.cjs --target production
  node scripts/admin-cleanup-test-users.cjs --target preview --apply

Default emails:
  ${DEFAULT_EMAILS.join('\n  ')}
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }
  const result = await runCleanup(args);
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
}
