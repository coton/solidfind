#!/usr/bin/env node

const { fetchQuery, fetchMutation } = require('convex/nextjs');
const { anyApi } = require('convex/server');
const { createClerkClient } = require('@clerk/backend');
const { resolveRuntimeConfig } = require('../src/lib/admin-cleanup-test-users.cjs');

function parseArgs(argv) {
  const args = {
    target: 'preview',
    envFile: null,
    company: '',
    newEmail: '',
    apply: false,
    deleteConflictingUser: false,
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
    if (arg === '--company') {
      args.company = argv[i + 1] || '';
      i += 1;
      continue;
    }
    if (arg.startsWith('--company=')) {
      args.company = arg.split('=')[1] || '';
      continue;
    }
    if (arg === '--new-email') {
      args.newEmail = argv[i + 1] || '';
      i += 1;
      continue;
    }
    if (arg.startsWith('--new-email=')) {
      args.newEmail = arg.split('=')[1] || '';
      continue;
    }
    if (arg === '--delete-conflicting-user') {
      args.deleteConflictingUser = true;
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

  args.company = String(args.company || '').trim();
  args.newEmail = String(args.newEmail || '').trim().toLowerCase();
  return args;
}

function printHelp() {
  console.log(`Update a company's login email in Clerk + Convex.

Usage:
  node scripts/set-company-login-email.cjs --target preview --company Balitecture --new-email spleen_d@hotmail.fr --delete-conflicting-user --apply
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.company || !args.newEmail) {
    printHelp();
    if (!args.help) process.exitCode = 1;
    return;
  }
  if (!args.apply) {
    throw new Error('Use --apply to perform the email swap.');
  }

  const runtime = resolveRuntimeConfig(args);
  const clerk = createClerkClient({ secretKey: runtime.clerkSecretKey });
  const users = await fetchQuery(anyApi.users.listAll, {}, { url: runtime.convexUrl });
  const companies = await fetchQuery(anyApi.companies.listAll, {}, { url: runtime.convexUrl });

  const company = companies.find((item) => String(item.name || '').trim().toLowerCase() === args.company.toLowerCase());
  if (!company) throw new Error(`Company not found: ${args.company}`);

  const owner = users.find((item) => item._id === company.ownerId);
  if (!owner) throw new Error(`Owner not found for company: ${company.name}`);

  const targetClerkUser = await clerk.users.getUser(owner.clerkId);
  const currentEmail = (owner.email || '').toLowerCase();
  const conflictingConvexUser = users.find((item) => item.email.toLowerCase() === args.newEmail && item._id !== owner._id);
  const conflictingClerkUsers = await clerk.users.getUserList({ emailAddress: [args.newEmail], limit: 10 });
  const conflictingClerkUser = conflictingClerkUsers.data.find((item) => item.id !== targetClerkUser.id) || null;

  if ((conflictingConvexUser || conflictingClerkUser) && !args.deleteConflictingUser) {
    throw new Error(`New email ${args.newEmail} already belongs to another account. Re-run with --delete-conflicting-user if this is intentional.`);
  }

  if (conflictingConvexUser) {
    await fetchMutation(anyApi.users.deleteUser, { userId: conflictingConvexUser._id }, { url: runtime.convexUrl });
  }

  if (conflictingClerkUser) {
    await clerk.users.deleteUser(conflictingClerkUser.id);
  }

  const refreshedTargetUser = await clerk.users.getUser(targetClerkUser.id);
  const existingNewEmail = refreshedTargetUser.emailAddresses.find((item) => item.emailAddress.toLowerCase() === args.newEmail);
  const newEmailAddress = existingNewEmail || await clerk.emailAddresses.createEmailAddress({
    userId: refreshedTargetUser.id,
    emailAddress: args.newEmail,
    verified: true,
    primary: true,
  });

  await clerk.users.updateUser(refreshedTargetUser.id, {
    primaryEmailAddressID: newEmailAddress.id,
    notifyPrimaryEmailAddressChanged: false,
  });

  const oldEmailAddress = refreshedTargetUser.emailAddresses.find((item) => item.emailAddress.toLowerCase() === currentEmail);
  if (oldEmailAddress && oldEmailAddress.id !== newEmailAddress.id) {
    await clerk.emailAddresses.deleteEmailAddress(oldEmailAddress.id);
  }

  await clerk.users.updateUserMetadata(refreshedTargetUser.id, {
    publicMetadata: {
      ...(refreshedTargetUser.publicMetadata || {}),
      accountType: 'company',
      companyName: company.name,
    },
    unsafeMetadata: {
      ...(refreshedTargetUser.unsafeMetadata || {}),
      accountType: 'company',
      companyName: company.name,
    },
  });

  await fetchMutation(anyApi.users.createOrGetUser, {
    clerkId: refreshedTargetUser.id,
    email: args.newEmail,
    name: owner.name || company.name,
    accountType: 'company',
    companyName: company.name,
    imageUrl: owner.imageUrl,
  }, { url: runtime.convexUrl });

  await fetchMutation(anyApi.companies.update, {
    id: company._id,
    ownerId: owner._id,
    email: args.newEmail,
  }, { url: runtime.convexUrl });

  console.log(JSON.stringify({
    target: args.target,
    company: company.name,
    previousEmail: currentEmail,
    newEmail: args.newEmail,
    deletedConflictingConvexUserId: conflictingConvexUser?._id || null,
    deletedConflictingClerkUserId: conflictingClerkUser?.id || null,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
