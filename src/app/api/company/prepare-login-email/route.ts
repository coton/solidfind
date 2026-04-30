import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const nextEmail = String(body.email || "").trim().toLowerCase();

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

  const existingEmailAddress = user.emailAddresses.find(
    (item) => item.emailAddress.trim().toLowerCase() === nextEmail
  );

  if (!existingEmailAddress) {
    await client.emailAddresses.createEmailAddress({
      userId: user.id,
      emailAddress: nextEmail,
      verified: false,
      primary: false,
    });
  }

  return NextResponse.json({
    success: true,
    email: nextEmail,
  });
}
