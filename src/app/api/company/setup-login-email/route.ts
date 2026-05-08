import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { anyApi } from "convex/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json({ error: "Convex URL is not configured." }, { status: 500 });
  }

  const body = await req.json();
  const nextEmail = String(body.email || "").trim().toLowerCase();
  const nextPassword = typeof body.password === "string" ? body.password : "";

  if (!nextEmail) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  const conflictingUsers = await client.users.getUserList({ emailAddress: [nextEmail], limit: 10 });
  const conflictingUser = conflictingUsers.data.find((candidate) => candidate.id !== user.id);
  if (conflictingUser) {
    return NextResponse.json({ error: "This email is already used by another account." }, { status: 409 });
  }

  const targetEmailAddress = user.emailAddresses.find(
    (item) => item.emailAddress.trim().toLowerCase() === nextEmail
  );

  if (!targetEmailAddress || targetEmailAddress.verification?.status !== "verified") {
    return NextResponse.json({ error: "Please verify this email before continuing." }, { status: 400 });
  }

  const currentUser = await fetchQuery(anyApi.users.getCurrentUser, { clerkId: user.id }, { url: convexUrl });
  if (!currentUser) {
    return NextResponse.json({ error: "Company owner record not found." }, { status: 404 });
  }

  const company = await fetchQuery(anyApi.companies.getByOwner, { ownerId: currentUser._id }, { url: convexUrl });
  if (!company) {
    return NextResponse.json({ error: "Company record not found." }, { status: 404 });
  }

  const previousPrimaryEmailId = user.primaryEmailAddressId;
  const previousPrimaryEmail = user.primaryEmailAddress?.emailAddress?.trim().toLowerCase() || "";

  let updatedUser = await client.users.updateUser(user.id, {
    primaryEmailAddressID: targetEmailAddress.id,
    notifyPrimaryEmailAddressChanged: false,
  });

  if (nextPassword) {
    updatedUser = await client.users.updateUser(user.id, {
      password: nextPassword,
      primaryEmailAddressID: targetEmailAddress.id,
      notifyPrimaryEmailAddressChanged: false,
      signOutOfOtherSessions: false,
    });
  }

  if (
    previousPrimaryEmailId
    && previousPrimaryEmailId !== targetEmailAddress.id
    && previousPrimaryEmail
    && previousPrimaryEmail !== nextEmail
  ) {
    await client.emailAddresses.deleteEmailAddress(previousPrimaryEmailId);
  }

  await client.users.updateUserMetadata(user.id, {
    publicMetadata: {
      ...(updatedUser.publicMetadata || {}),
      accountType: "company",
      companyName: company.name,
    },
    unsafeMetadata: {
      ...(updatedUser.unsafeMetadata || {}),
      accountType: "company",
      companyName: company.name,
    },
  });

  await fetchMutation(
    anyApi.users.createOrGetUser,
    {
      clerkId: user.id,
      email: nextEmail,
      name: currentUser.name || company.name,
      accountType: "company",
      companyName: company.name,
      imageUrl: currentUser.imageUrl,
    },
    { url: convexUrl }
  );

  await fetchMutation(
    anyApi.companies.update,
    {
      id: company._id,
      ownerId: currentUser._id,
      email: nextEmail,
    },
    { url: convexUrl }
  );

  return NextResponse.json({
    success: true,
    email: nextEmail,
    companyName: company.name,
  });
}
