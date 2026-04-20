#!/usr/bin/env node

const { fetchQuery, fetchMutation } = require('convex/nextjs');
const { anyApi } = require('convex/server');
const { createClerkClient } = require('@clerk/backend');
const path = require('path');
const {
  buildCompanyMutationPayload,
  loadRowsFromFile,
  normalizeCompanyDirectoryRow,
} = require('../src/lib/company-directory-import.cjs');
const {
  loadEnvFile,
  resolveRuntimeConfig,
} = require('../src/lib/admin-cleanup-test-users.cjs');

function parseArgs(argv) {
  const args = {
    target: 'preview',
    apply: false,
    file: null,
    envFile: null,
    companyNames: [],
    verbose: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--apply') {
      args.apply = true;
      continue;
    }
    if (arg === '--target') {
      args.target = argv[i + 1] || args.target;
      i += 1;
      continue;
    }
    if (arg.startsWith('--target=')) {
      args.target = arg.split('=')[1] || args.target;
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
    if (arg === '--env-file') {
      args.envFile = argv[i + 1] || null;
      i += 1;
      continue;
    }
    if (arg.startsWith('--env-file=')) {
      args.envFile = arg.split('=')[1] || null;
      continue;
    }
    if (arg === '--company') {
      const value = argv[i + 1] || '';
      args.companyNames.push(value);
      i += 1;
      continue;
    }
    if (arg.startsWith('--company=')) {
      args.companyNames.push(arg.split('=')[1] || '');
      continue;
    }
    if (arg === '--verbose') {
      args.verbose = true;
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
  console.log(`Import company directory rows into Clerk + Convex.

Usage:
  /opt/homebrew/bin/node scripts/import-company-directory.cjs --file ../3_assets/Living_id_Construction_Directory_TEST.csv
  /opt/homebrew/bin/node scripts/import-company-directory.cjs --target production --file ../3_assets/Living_id_Construction_Directory_TEST.xlsx --apply

Options:
  --file <path>         CSV or XLSX source file
  --target <name>       preview (default) or production
  --env-file <path>     explicit env file instead of --target
  --company <name>      import only matching company name (repeatable)
  --apply               perform writes (default is dry-run)
  --verbose             include more detail in output
`);
}

function normalizeCompanyFilter(values) {
  return values.map((value) => value.trim().toLowerCase()).filter(Boolean);
}

async function ensureClerkUser({ clerk, normalized, existingClerkUser, apply }) {
  const metadata = {
    publicMetadata: {
      accountType: 'company',
      companyName: normalized.name,
    },
    unsafeMetadata: {
      accountType: 'company',
      companyName: normalized.name,
    },
  };

  if (!apply) {
    return {
      clerkUser: existingClerkUser || null,
      operation: existingClerkUser ? 'update' : 'create',
      passwordVerified: false,
    };
  }

  let clerkUser;
  if (existingClerkUser) {
    clerkUser = await clerk.users.updateUser(existingClerkUser.id, {
      firstName: normalized.name,
      password: normalized.password,
      skipPasswordChecks: true,
      signOutOfOtherSessions: false,
      ...metadata,
    });
  } else {
    clerkUser = await clerk.users.createUser({
      emailAddress: [normalized.email],
      firstName: normalized.name,
      password: normalized.password,
      skipPasswordChecks: true,
      skipLegalChecks: true,
      ...metadata,
    });
  }

  await clerk.users.updateUserMetadata(clerkUser.id, metadata);
  const verified = await clerk.users.verifyPassword({ userId: clerkUser.id, password: normalized.password });

  return {
    clerkUser,
    operation: existingClerkUser ? 'update' : 'create',
    passwordVerified: Boolean(verified && verified.verified),
  };
}

async function upsertCompanyDirectory(options) {
  const runtime = resolveRuntimeConfig(options);
  const filePath = path.resolve(options.file);
  const rows = loadRowsFromFile(filePath);
  const filters = normalizeCompanyFilter(options.companyNames || []);
  const sourceName = path.basename(filePath);
  const clerk = createClerkClient({ secretKey: runtime.clerkSecretKey });
  const existingCompanies = await fetchQuery(anyApi.companies.listAll, {}, { url: runtime.convexUrl });
  const existingUsers = await fetchQuery(anyApi.users.listAll, {}, { url: runtime.convexUrl });

  const normalizedRows = rows
    .map((row) => normalizeCompanyDirectoryRow(row, { sourceName }))
    .filter((row) => !filters.length || filters.includes((row.name || '').toLowerCase()));

  const results = [];

  for (const normalized of normalizedRows) {
    const existingCompany = existingCompanies.find((company) => (company.name || '').trim().toLowerCase() === normalized.name.toLowerCase());
    const existingConvexUser = existingUsers.find((user) => (user.email || '').trim().toLowerCase() === normalized.email);
    const clerkMatches = await clerk.users.getUserList({ emailAddress: [normalized.email], limit: 10 });
    const existingClerkUser = clerkMatches.data[0] || null;

    const clerkResult = await ensureClerkUser({
      clerk,
      normalized,
      existingClerkUser,
      apply: options.apply,
    });

    const clerkId = clerkResult.clerkUser?.id || existingConvexUser?.clerkId || null;
    let convexUserId = existingConvexUser?._id || null;

    if (options.apply) {
      convexUserId = await fetchMutation(anyApi.users.createOrGetUser, {
        clerkId,
        email: normalized.email,
        name: normalized.name,
        accountType: 'company',
        companyName: normalized.name,
      }, { url: runtime.convexUrl });
    }

    const companyPayload = buildCompanyMutationPayload(normalized);
    let companyOperation = existingCompany ? 'update' : 'create';
    let companyId = existingCompany?._id || null;

    if (options.apply) {
      if (existingCompany) {
        await fetchMutation(anyApi.companies.update, {
          id: existingCompany._id,
          ownerId: convexUserId,
          ...companyPayload,
        }, { url: runtime.convexUrl });
        companyId = existingCompany._id;
      } else {
        companyId = await fetchMutation(anyApi.companies.create, {
          ownerId: convexUserId,
          ...companyPayload,
        }, { url: runtime.convexUrl });
      }
    }

    results.push({
      name: normalized.name,
      email: normalized.email,
      primaryCategory: normalized.primaryCategory,
      sourceFile: sourceName,
      clerk: {
        operation: clerkResult.operation,
        userId: clerkResult.clerkUser?.id || existingClerkUser?.id || null,
        passwordVerified: clerkResult.passwordVerified,
      },
      convexUser: {
        existingId: existingConvexUser?._id || null,
        finalId: convexUserId,
      },
      company: {
        operation: companyOperation,
        existingId: existingCompany?._id || null,
        finalId: companyId,
        previousOwnerEmail: existingCompany?.ownerEmail || null,
      },
      normalized,
    });
  }

  return {
    mode: options.apply ? 'apply' : 'dry-run',
    target: runtime.target,
    envFile: runtime.envFile,
    convexUrl: runtime.convexUrl,
    filePath,
    importedCount: results.length,
    results,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.file) {
    printHelp();
    if (!args.file) process.exitCode = 1;
    return;
  }

  const result = await upsertCompanyDirectory(args);
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.stack || error.message || error);
    process.exit(1);
  });
}

module.exports = {
  ensureClerkUser,
  parseArgs,
  upsertCompanyDirectory,
};
