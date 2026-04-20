import { NextRequest, NextResponse } from "next/server";
import { createClerkClient } from "@clerk/backend";
import { buildTicketSignInUrl, getMagicLinkSigningSecret, parseMagicLinkToken } from "@/lib/magic-link-login.mjs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;

  if (!clerkSecretKey) {
    return NextResponse.json({ error: "Magic link configuration is missing." }, { status: 500 });
  }

  const signingSecret = getMagicLinkSigningSecret(clerkSecretKey);
  const payload = parseMagicLinkToken({ secret: signingSecret, token: code });
  if (!payload) {
    return NextResponse.json({ error: "Magic link not found." }, { status: 404 });
  }

  if (payload.expiresAt <= Date.now()) {
    return NextResponse.json({ error: "Magic link expired." }, { status: 410 });
  }

  const clerk = createClerkClient({ secretKey: clerkSecretKey });
  const expiresInSeconds = Math.max(60, Math.min(14 * 24 * 60 * 60, Math.floor((payload.expiresAt - Date.now()) / 1000)));
  const signInToken = await clerk.signInTokens.createSignInToken({
    userId: payload.clerkUserId,
    expiresInSeconds,
  });

  const redirectUrl = buildTicketSignInUrl({
    appUrl: request.nextUrl.origin,
    ticket: signInToken.token,
    nextPath: payload.targetPath,
  });

  return NextResponse.redirect(redirectUrl, { status: 302 });
}
