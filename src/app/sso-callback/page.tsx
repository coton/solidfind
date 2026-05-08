"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { sanitizeNextPath } from "@/lib/magic-link-login.mjs";

export default function SSOCallbackPage() {
  const searchParams = useSearchParams();
  const redirectUrl = sanitizeNextPath(searchParams.get("redirect_url")) || "/auth-complete";

  return (
    <AuthenticateWithRedirectCallback
      signInFallbackRedirectUrl={redirectUrl}
      signUpFallbackRedirectUrl={redirectUrl}
      signInForceRedirectUrl={redirectUrl}
      signUpForceRedirectUrl={redirectUrl}
    />
  );
}
