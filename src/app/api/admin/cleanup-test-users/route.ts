import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth, clerkClient } from "@clerk/nextjs/server";
import cleanupTools from "@/lib/admin-cleanup-test-users.cjs";

const { DEFAULT_EMAILS, normalizeEmails, runCleanup } = cleanupTools;

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (token === "authenticated") return true;

  try {
    const { userId } = await auth();
    if (userId) {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase().trim();
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase().trim();
      if (userEmail && adminEmail && userEmail === adminEmail) return true;
    }
  } catch {
    // Clerk auth failed
  }

  return false;
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const apply = body?.apply === true;
  const emails = Array.isArray(body?.emails) && body.emails.length > 0
    ? normalizeEmails(body.emails)
    : DEFAULT_EMAILS;

  try {
    const result = await runCleanup({
      apply,
      emails,
      target: process.env.VERCEL_ENV || process.env.NODE_ENV || "runtime",
      convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
      clerkSecretKey: process.env.CLERK_SECRET_KEY,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cleanup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
