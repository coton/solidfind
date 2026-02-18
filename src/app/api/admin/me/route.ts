import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  // Check cookie-based auth
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (token === "authenticated") {
    return NextResponse.json({ isAdmin: true });
  }

  // Check Clerk auth + admin email
  try {
    const { userId } = await auth();
    if (userId) {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase().trim();
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase().trim();
      if (userEmail && adminEmail && userEmail === adminEmail) {
        return NextResponse.json({ isAdmin: true });
      }
    }
  } catch {
    // Clerk auth failed, not logged in via Clerk
  }

  return NextResponse.json({ isAdmin: false });
}
