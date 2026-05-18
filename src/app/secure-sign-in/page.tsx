"use client";

import { SignIn } from "@clerk/nextjs";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { sanitizeNextPath } from "@/lib/magic-link-login.mjs";

export default function SecureSignInPage() {
  const searchParams = useSearchParams();
  const identifier = searchParams.get("identifier")?.trim() || "";
  const nextPath = useMemo(() => sanitizeNextPath(searchParams.get("next")) || "/auth-complete", [searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f8f8] px-4 py-10">
      <div className="w-full max-w-[440px]">
        <div className="mb-5 text-center">
          <h1 className="text-[24px] font-semibold tracking-[0.48px] text-[#333]">
            Secure sign in
          </h1>
          <p className="mt-2 text-[12px] leading-[18px] text-[#777]">
            Complete the extra verification step to access your SolidFind account.
          </p>
        </div>

        <div className="flex justify-center">
          <SignIn
            routing="hash"
            initialValues={identifier ? { emailAddress: identifier } : undefined}
            fallbackRedirectUrl={nextPath}
            forceRedirectUrl={nextPath}
            signUpUrl="/sign-up"
            appearance={{
              variables: {
                colorPrimary: "#F14110",
                colorText: "#333333",
                borderRadius: "6px",
                fontFamily: "var(--font-sora), sans-serif",
              },
              elements: {
                cardBox: "shadow-none",
                card: "border border-[#e4e4e4]",
                formButtonPrimary:
                  "rounded-full bg-[#f14110] text-white hover:bg-[#d8390e]",
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}
