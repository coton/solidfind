const fs = require('fs');
const path = require('path');
const { fetchQuery, fetchMutation } = require('convex/nextjs');
const { anyApi } = require('convex/server');
const { createClerkClient } = require('@clerk/backend');

const DEFAULT_EMAILS = [
  'julien.moreau@next-ren.com',
  'julien.moreau@perseus-caviar.com',
  'ju.moreau@outlook.com',
  'bumijulien@gmail.com',
  'pakmrhubumi@gmail.com',
  'jlnk.ef@gmail.com',
  'spleen_d@hotmail.fr',
  'mrhu@solidfind.id',
  'lepsy85@yahoo.fr',
];

function normalizeEmails(emails) {
  return [...new Set(emails.map((email) => email.toLowerCase().trim()).filter(Boolean))];
}

function parseArgs(argv) {
  const args = {
    target: 'preview',
    apply: false,
    envFile: null,
    emails: [...DEFAULT_EMAILS],
    verbose: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--apply') {
      args.apply = true;
      continue;
    }
    if (arg === '--verbose') {
      args.verbose = true;
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
    if (arg === '--env-file') {
      args.envFile = argv[i + 1] || null;
      i += 1;
      continue;
    }
    if (arg.startsWith('--env-file=')) {
      args.envFile = arg.split('=')[1] || null;
      continue;
    }
    if (arg === '--emails') {
      const value = argv[i + 1] || '';
      args.emails = value.split(',');
      i += 1;
      continue;
    }
    if (arg.startsWith('--emails=')) {
      args.emails = (arg.split('=')[1] || '').split(',');
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      args.help = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  args.target = String(args.target || 'preview').toLowerCase();
  args.emails = normalizeEmails(args.emails);
  return args;
}

function resolveEnvFile({ target, envFile }) {
  if (envFile) return envFile;
  if (target === 'preview') return '.env.preview.local';
  if (target === 'production') return '.env.production.local';
  throw new Error(`Unsupported target: ${target}. Use preview or production, or pass --env-file.`);
}

function loadEnvFile(envFile) {
  const absolutePath = path.resolve(envFile);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Env file not found: ${envFile}`);
  }

  const env = {};
  const lines = fs.readFileSync(absolutePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value.replace(/\\n/g, '').trim();
  }

  return env;
}

function resolveRuntimeConfig({ convexUrl, clerkSecretKey, envFile, target }) {
  if (convexUrl && clerkSecretKey) {
    return {
      convexUrl: convexUrl.trim(),
      clerkSecretKey: clerkSecretKey.trim(),
      envFile: envFile || null,
      target: target || null,
    };
  }

  const resolvedEnvFile = resolveEnvFile({ target, envFile });
  const env = loadEnvFile(resolvedEnvFile);
  if (!env.NEXT_PUBLIC_CONVEX_URL) throw new Error(`NEXT_PUBLIC_CONVEX_URL missing in ${resolvedEnvFile}`);
  if (!env.CLERK_SECRET_KEY) throw new Error(`CLERK_SECRET_KEY missing in ${resolvedEnvFile}`);

  return {
    convexUrl: env.NEXT_PUBLIC_CONVEX_URL.trim(),
    clerkSecretKey: env.CLERK_SECRET_KEY.trim(),
    envFile: resolvedEnvFile,
    target: target || null,
  };
}

async function collectMatches({ emails, convexUrl, clerkSecretKey }) {
  const convexUsers = await fetchQuery(anyApi.users.listAll, {}, { url: convexUrl });
  const convexMatches = convexUsers.filter((user) => emails.includes((user.email || '').toLowerCase()));

  const clerk = createClerkClient({ secretKey: clerkSecretKey });
  const clerkMatches = [];
  for (const email of emails) {
    const response = await clerk.users.getUserList({ emailAddress: [email], limit: 20 });
    for (const user of response.data) {
      clerkMatches.push({
        queryEmail: email,
        clerkId: user.id,
        primaryEmail:
          user.emailAddresses.find((address) => address.id === user.primaryEmailAddressId)?.emailAddress ||
          user.emailAddresses[0]?.emailAddress ||
          null,
      });
    }
  }

  return { convexMatches, clerkMatches };
}

async function deleteMatches({ convexMatches, clerkMatches, convexUrl, clerkSecretKey }) {
  const deletedConvex = [];
  for (const user of convexMatches) {
    await fetchMutation(anyApi.users.deleteUser, { userId: user._id }, { url: convexUrl });
    deletedConvex.push({
      email: user.email,
      userId: user._id,
      clerkId: user.clerkId,
    });
  }

  const clerk = createClerkClient({ secretKey: clerkSecretKey });
  const deletedClerk = [];
  for (const user of clerkMatches) {
    await clerk.users.deleteUser(user.clerkId);
    deletedClerk.push(user);
  }

  return { deletedConvex, deletedClerk };
}

async function runCleanup(options) {
  const runtime = resolveRuntimeConfig(options);
  const emails = normalizeEmails(options.emails || DEFAULT_EMAILS);
  const before = await collectMatches({
    emails,
    convexUrl: runtime.convexUrl,
    clerkSecretKey: runtime.clerkSecretKey,
  });

  const result = {
    mode: options.apply ? 'apply' : 'dry-run',
    target: runtime.target,
    envFile: runtime.envFile,
    convexUrl: runtime.convexUrl,
    emails,
    before,
    deletedConvex: [],
    deletedClerk: [],
    after: before,
  };

  if (options.apply) {
    const deleted = await deleteMatches({
      convexMatches: before.convexMatches,
      clerkMatches: before.clerkMatches,
      convexUrl: runtime.convexUrl,
      clerkSecretKey: runtime.clerkSecretKey,
    });
    result.deletedConvex = deleted.deletedConvex;
    result.deletedClerk = deleted.deletedClerk;
    result.after = await collectMatches({
      emails,
      convexUrl: runtime.convexUrl,
      clerkSecretKey: runtime.clerkSecretKey,
    });
  }

  return result;
}

module.exports = {
  DEFAULT_EMAILS,
  normalizeEmails,
  parseArgs,
  resolveEnvFile,
  loadEnvFile,
  resolveRuntimeConfig,
  collectMatches,
  deleteMatches,
  runCleanup,
};
