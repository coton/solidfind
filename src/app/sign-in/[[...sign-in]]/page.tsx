"use client";

import { useEffect, useMemo, useState } from "react";
import { useSignIn, useUser } from "@clerk/nextjs";
import { AuthModal } from "@/components/AuthModal";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuthStatusMessage } from "@/lib/auth-verification.mjs";
import { sanitizeNextPath } from "@/lib/magic-link-login.mjs";

export default function SignInPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [ticketError, setTicketError] = useState("");
  const { user } = useUser();
  const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();

  const ticket = searchParams.get("__clerk_ticket");
  const safeNextPath = useMemo(() => sanitizeNextPath(searchParams.get("next")), [searchParams]);

  useEffect(() => {
    if (!ticket) return;
    if (!isSignInLoaded || !signIn || !setActive) return;

    let cancelled = false;

    const completeTicketSignIn = async () => {
      setTicketError("");
      try {
        const result = await signIn.create({
          strategy: "ticket",
          ticket,
        });

        if (cancelled) return;

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          const nextSuffix = safeNextPath ? `?next=${encodeURIComponent(safeNextPath)}` : "";
          router.replace(`/auth-complete${nextSuffix}`);
          return;
        }

        setTicketError(
          getAuthStatusMessage(result.status, {
            fallbackMessage: "This magic link needs extra verification before it can finish signing in.",
            needsSecondFactorMessage:
              "This magic link points to an account that requires two-factor authentication, so it cannot finish inside this flow.",
          })
        );
      } catch {
        if (!cancelled) {
          setTicketError("This link is invalid or expired. Please request a fresh link.\nTautan ini tidak valid atau kedaluwarsa. Silakan minta tautan baru.");
        }
      }
    };

    void completeTicketSignIn();

    return () => {
      cancelled = true;
    };
  }, [ticket, isSignInLoaded, signIn, setActive, router, safeNextPath]);

  useEffect(() => {
    if (ticket) return;
    if (user) {
      const nextSuffix = safeNextPath ? `?next=${encodeURIComponent(safeNextPath)}` : "";
      router.push(`/auth-complete${nextSuffix}`);
    }
  }, [ticket, user, router, safeNextPath]);

  if (ticket && !ticketError) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center text-[#333] text-sm">
        Completing sign in...
      </div>
    );
  }

  if (ticketError) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center px-4">
        <div className="w-full max-w-[420px] rounded-[6px] border border-[#f14110]/20 bg-[#fff3ef] px-4 py-4 text-center">
          <p className="whitespace-pre-line text-[12px] leading-[18px] text-[#8a2e14]">
            {ticketError}
          </p>
          <div className="mt-4 flex justify-center">
            <a
              href="mailto:hello@solidfind.id"
              className="flex h-10 w-[140px] items-center justify-center rounded-full border border-[#333] text-[11px] font-medium tracking-[0.22px] text-[#333] transition-colors hover:border-[#f14110] hover:text-[#f14110]"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
      <div className="w-full">
        <AuthModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          initialMode="login"
          initialAccountType="individual"
        />
      </div>
    </div>
  );
}
