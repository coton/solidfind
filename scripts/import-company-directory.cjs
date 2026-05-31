#!/usr/bin/env node

const { fetchQuery, fetchMutation } = require('convex/nextjs');
const { anyApi } = require('convex/server');
const { createClerkClient } = require('@clerk/backend');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const {
  buildCompanyMutationPayload,
  discoverCompanyMedia,
  loadRowsFromFile,
  normalizeCompanyDirectoryRow,
  resolveStoredCompanyMedia,
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
    mediaRoot: null,
    mediaZip: null,
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
    if (arg === '--media-root') {
      args.mediaRoot = argv[i + 1] || null;
      i += 1;
      continue;
    }
    if (arg.startsWith('--media-root=')) {
      args.mediaRoot = arg.split('=')[1] || null;
      continue;
    }
    if (arg === '--media-zip') {
      args.mediaZip = argv[i + 1] || null;
      i += 1;
      continue;
    }
    if (arg.startsWith('--media-zip=')) {
      args.mediaZip = arg.split('=')[1] || null;
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
  --media-root <path>   optional folder containing Category/CompanyName media folders
  --media-zip <path>    optional ZIP with the same media folder structure
  --apply               perform writes (default is dry-run)
  --verbose             include more detail in output
`);
}

function normalizeCompanyFilter(values) {
  return values.map((value) => value.trim().toLowerCase()).filter(Boolean);
}

function extractMediaZip(mediaZip) {
  if (!mediaZip) return null;

  const zipPath = path.resolve(mediaZip);
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'solidfind-company-media-'));
  const script = `import sys, zipfile\nfrom pathlib import Path\nzip_path, output_dir = sys.argv[1:]\nroot = Path(output_dir).resolve()\nwith zipfile.ZipFile(zip_path) as z:\n    for member in z.infolist():\n        target = (root / member.filename).resolve()\n        if root not in target.parents and target != root:\n            raise ValueError(f'Unsafe ZIP path: {member.filename}')\n    z.extractall(root)\n`;
  const result = spawnSync('python3', ['-c', script, zipPath, outputDir], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `Failed to extract media ZIP: ${zipPath}`);
  }

  return outputDir;
}

function resolveMediaRoot(options) {
  if (options.mediaRoot) return path.resolve(options.mediaRoot);
  return extractMediaZip(options.mediaZip);
}

async function ensureClerkUser({ clerk, normalized, existingClerkUser, apply }) {
  const accountEmail = normalized.accountEmail || normalized.email;
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

  const password = typeof normalized.password === 'string' && normalized.password.length > 0
    ? normalized.password
    : null;
  const passwordFields = password
    ? { password, skipPasswordChecks: true }
    : {};

  let clerkUser;
  if (existingClerkUser) {
    clerkUser = await clerk.users.updateUser(existingClerkUser.id, {
      firstName: normalized.name,
      signOutOfOtherSessions: false,
      ...passwordFields,
      ...metadata,
    });
  } else {
    clerkUser = await clerk.users.createUser({
      emailAddress: [accountEmail],
      firstName: normalized.name,
      skipLegalChecks: true,
      ...passwordFields,
      ...metadata,
    });
  }

  await clerk.users.updateUserMetadata(clerkUser.id, metadata);
  const verified = password
    ? await clerk.users.verifyPassword({ userId: clerkUser.id, password })
    : null;

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
  const mediaRoot = resolveMediaRoot(options);
  const clerk = createClerkClient({ secretKey: runtime.clerkSecretKey });
  const existingCompanies = await fetchQuery(anyApi.companies.listAll, {}, { url: runtime.convexUrl });
  const existingUsers = await fetchQuery(anyApi.users.listAll, {}, { url: runtime.convexUrl });

  const normalizedRows = rows
    .map((row) => normalizeCompanyDirectoryRow(row, { sourceName }))
    .filter((row) => !filters.length || filters.includes((row.name || '').toLowerCase()))
    .map((row) => {
      const discoveredMedia = discoverCompanyMedia({
        mediaRoot,
        companyName: row.name,
        primaryCategory: row.primaryCategory,
      });
      return {
        ...row,
        imageFilePath: row.imageFilePath || discoveredMedia.imageFilePath,
        projectImageFilePaths: row.projectImageFilePaths?.length
          ? row.projectImageFilePaths
          : discoveredMedia.projectImageFilePaths,
      };
    });

  const results = [];

  for (const normalized of normalizedRows) {
    const existingCompany = existingCompanies.find((company) => (company.name || '').trim().toLowerCase() === normalized.name.toLowerCase());
    const existingConvexUser = existingUsers.find((user) => (user.email || '').trim().toLowerCase() === normalized.accountEmail);
    const clerkMatches = await clerk.users.getUserList({ emailAddress: [normalized.accountEmail], limit: 10 });
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
        email: normalized.accountEmail,
        name: normalized.name,
        accountType: 'company',
        companyName: normalized.name,
      }, { url: runtime.convexUrl });
    }

    const companyPayload = buildCompanyMutationPayload(normalized);
    let companyOperation = existingCompany ? 'update' : 'create';
    let companyId = existingCompany?._id || null;
    let storedMedia = {
      logoId: existingCompany?.logoId || null,
      projectImageIds: existingCompany?.projectImageIds ?? [],
    };

    if (options.apply) {
      storedMedia = await resolveStoredCompanyMedia({
        normalized,
        existingCompany,
        generateUploadUrl: async () => fetchMutation(anyApi.files.generateUploadUrl, {}, { url: runtime.convexUrl }),
      });

      if (existingCompany) {
        await fetchMutation(anyApi.companies.update, {
          id: existingCompany._id,
          ownerId: convexUserId,
          ...companyPayload,
          imageUrl: storedMedia.imageUrl,
          projectImageUrls: storedMedia.projectImageUrls,
          logoId: storedMedia.logoId,
          projectImageIds: storedMedia.projectImageIds,
        }, { url: runtime.convexUrl });
        companyId = existingCompany._id;
      } else {
        companyId = await fetchMutation(anyApi.companies.create, {
          ownerId: convexUserId,
          ...companyPayload,
          imageUrl: storedMedia.imageUrl,
          projectImageUrls: storedMedia.projectImageUrls,
          logoId: storedMedia.logoId,
          projectImageIds: storedMedia.projectImageIds,
        }, { url: runtime.convexUrl });
      }
    }

    results.push({
      name: normalized.name,
      email: normalized.accountEmail,
      publicEmail: normalized.email || null,
      usesTemporaryEmail: normalized.usesTemporaryEmail,
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
        mediaUploadErrors: [
          storedMedia.logoUploadError ? { sourceUrl: normalized.imageUrl || normalized.imageFilePath, error: storedMedia.logoUploadError } : null,
          ...(storedMedia.projectImageUploadErrors || []),
        ].filter(Boolean),
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
    mediaRoot,
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
