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
            <br />
            Selesaikan langkah verifikasi tambahan untuk mengakses akun SolidFind Anda.
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
                borderRadius: "20px",
                fontFamily: "var(--font-sora), sans-serif",
              },
              elements: {
                rootBox: "w-full",
                cardBox: "shadow-none w-full",
                card: "border-0 shadow-none rounded-[6px]",
                headerTitle: "text-[#333]",
                headerSubtitle: "whitespace-pre-line text-[#777]",
                formFieldInput: "rounded-[6px] shadow-none focus:shadow-none focus:ring-0",
                formButtonPrimary:
                  "rounded-full bg-[#f14110] text-white shadow-none hover:bg-[#d8390e] focus:shadow-none",
                socialButtonsBlockButton:
                  "rounded-full shadow-none border border-[#e4e4e4] focus:shadow-none",
                footerActionLink: "whitespace-pre-line text-[#f14110]",
                footerActionText: "text-[#777]",
                footer: "shadow-none",
                alertText: "whitespace-pre-line",
                footerPages: "hidden",
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}
