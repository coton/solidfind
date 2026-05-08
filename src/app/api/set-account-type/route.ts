import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { accountType, companyName } = body;

  if (accountType !== "company" && accountType !== "individual") {
    return NextResponse.json({ error: "Invalid accountType" }, { status: 400 });
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      accountType,
      ...(companyName ? { companyName } : {}),
    },
  });

  return NextResponse.json({ success: true });
}
