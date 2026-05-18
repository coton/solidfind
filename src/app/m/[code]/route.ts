import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClerkClient } from "@clerk/backend";
import { fetchQuery } from "convex/nextjs";
import { anyApi } from "convex/server";
import { buildTicketSignInUrl, parseMagicLinkToken, resolveMagicLinkSigningSecrets } from "@/lib/magic-link-login.mjs";

function safeSecretFingerprint(secret: string) {
  return crypto.createHash("sha256").update(secret).digest("hex").slice(0, 12);
}

function getDecodedPayloadSummary(code: string) {
  const [encodedPayload = "", providedSignature = "", ...rest] = code.split(".");
  const summary: Record<string, unknown> = {
    tokenLength: code.length,
    encodedPayloadLength: encodedPayload.length,
    signatureLength: providedSignature.length,
    tokenHasUnexpectedParts: rest.length > 0,
  };

  if (!encodedPayload) {
    return summary;
  }

  try {
    const parsed = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    summary.decodedPurpose = parsed?.purpose ?? null;
    summary.decodedCompanyName = parsed?.companyName ?? null;
    summary.decodedTargetPath = parsed?.targetPath ?? null;
    summary.decodedExpiresAt = parsed?.expiresAt ?? null;
    summary.decodedClerkUserIdSuffix = typeof parsed?.clerkUserId === "string" ? parsed.clerkUserId.slice(-8) : null;
  } catch (error) {
    summary.payloadDecodeError = error instanceof Error ? error.message : String(error);
  }

  return summary;
}

function logMagicLinkDebug(event: string, details: Record<string, unknown>) {
  console.info(`[magic-link-debug] ${event} ${JSON.stringify(details)}`);
}

function resolvePayloadWithMatchedSecret(secrets: string[], token: string) {
  for (let index = 0; index < secrets.length; index += 1) {
    const payload = parseMagicLinkToken({ secret: secrets[index], token });
    if (payload) {
      return { payload, matchedSecretIndex: index };
    }
  }

  return { payload: null, matchedSecretIndex: -1 };
}

async function resolveMagicLinkToken(code: string) {
  if (code.includes(".")) {
    return {
      token: code,
      shortCode: null,
      shortLinkFound: false,
    };
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return {
      token: code,
      shortCode: code,
      shortLinkFound: false,
    };
  }

  const shortLink = await fetchQuery(anyApi.magicLinks.getByCode, { code }, { url: convexUrl });
  return {
    token: shortLink?.token ?? code,
    shortCode: code,
    shortLinkFound: Boolean(shortLink?.token),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  const resolved = await resolveMagicLinkToken(code);
  const token = resolved.token;
  const decodedPayloadSummary = getDecodedPayloadSummary(token);

  if (!clerkSecretKey) {
    logMagicLinkDebug("missing-clerk-secret", {
      ...decodedPayloadSummary,
      shortCode: resolved.shortCode,
      shortLinkFound: resolved.shortLinkFound,
      hasDedicatedMagicLinkSecret: Boolean(process.env.MAGIC_LINK_SIGNING_SECRET),
      origin: request.nextUrl.origin,
    });
    return NextResponse.json({ error: "Magic link configuration is missing." }, { status: 500 });
  }

  const signingSecrets = resolveMagicLinkSigningSecrets({
    magicLinkSigningSecret: process.env.MAGIC_LINK_SIGNING_SECRET,
    clerkSecretKey,
  }).filter((secret): secret is string => typeof secret === "string" && secret.length > 0);
  const { payload, matchedSecretIndex } = resolvePayloadWithMatchedSecret(signingSecrets, token);
  const secretFingerprints = signingSecrets.map((secret, index) => ({
    index,
    fingerprint: safeSecretFingerprint(secret),
  }));

  logMagicLinkDebug("request-received", {
    ...decodedPayloadSummary,
    shortCode: resolved.shortCode,
    shortLinkFound: resolved.shortLinkFound,
    origin: request.nextUrl.origin,
    hasClerkSecretKey: true,
    hasDedicatedMagicLinkSecret: Boolean(process.env.MAGIC_LINK_SIGNING_SECRET),
    signingSecretCount: signingSecrets.length,
    signingSecretFingerprints: secretFingerprints,
    matchedSecretIndex,
  });

  if (!payload) {
    logMagicLinkDebug("token-parse-failed", {
      ...decodedPayloadSummary,
      shortCode: resolved.shortCode,
      shortLinkFound: resolved.shortLinkFound,
      signingSecretFingerprints: secretFingerprints,
    });
    return NextResponse.json({ error: "Magic link not found." }, { status: 404 });
  }

  if (payload.expiresAt <= Date.now()) {
    logMagicLinkDebug("token-expired", {
      clerkUserIdSuffix: payload.clerkUserId?.slice(-8) ?? null,
      companyName: payload.companyName ?? null,
      targetPath: payload.targetPath ?? null,
      expiresAt: payload.expiresAt,
      matchedSecretIndex,
    });
    return NextResponse.json({ error: "Magic link expired." }, { status: 410 });
  }

  const clerk = createClerkClient({ secretKey: clerkSecretKey });
  const expiresInSeconds = Math.max(60, Math.min(14 * 24 * 60 * 60, Math.floor((payload.expiresAt - Date.now()) / 1000)));

  let signInToken;
  try {
    signInToken = await clerk.signInTokens.createSignInToken({
      userId: payload.clerkUserId,
      expiresInSeconds,
    });
  } catch (error) {
    logMagicLinkDebug("clerk-sign-in-token-failed", {
      clerkUserIdSuffix: payload.clerkUserId?.slice(-8) ?? null,
      companyName: payload.companyName ?? null,
      expiresInSeconds,
      matchedSecretIndex,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  const redirectUrl = buildTicketSignInUrl({
    appUrl: request.nextUrl.origin,
    ticket: signInToken.token,
    nextPath: payload.targetPath,
  });

  logMagicLinkDebug("redirect-created", {
    clerkUserIdSuffix: payload.clerkUserId?.slice(-8) ?? null,
    companyName: payload.companyName ?? null,
    targetPath: payload.targetPath ?? null,
    matchedSecretIndex,
    expiresInSeconds,
    redirectUrl,
  });

  return NextResponse.redirect(redirectUrl, { status: 302 });
}
