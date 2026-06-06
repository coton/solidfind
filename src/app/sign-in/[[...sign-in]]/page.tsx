"use client";

import { useEffect, useMemo, useState } from "react";
import { useSignIn, useUser } from "@clerk/nextjs";
import { AuthModal } from "@/components/AuthModal";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { MagicLinkLoadingPage } from "@/components/MagicLinkLoadingPage";
import { getAuthStatusMessage } from "@/lib/auth-verification.mjs";
import { sanitizeNextPath } from "@/lib/magic-link-login.mjs";

export default function SignInPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [ticketError, setTicketError] = useState("");
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();

  const ticket = searchParams.get("__clerk_ticket");
  const safeNextPath = useMemo(() => sanitizeNextPath(searchParams.get("next")), [searchParams]);
  const initialAccountType = safeNextPath?.startsWith("/company-dashboard") ? "company" : "individual";
  const handleClose = () => {
    setIsOpen(false);
    router.replace("/?category=construction");
  };
  const companySetupPath = useMemo(() => {
    if (!safeNextPath || !safeNextPath.startsWith("/company-dashboard/edit")) {
      return null;
    }

    const [pathname, existingQuery = ""] = safeNextPath.split("?");
    const nextParams = new URLSearchParams(existingQuery);
    nextParams.set("setupAccount", "1");
    const serialized = nextParams.toString();
    return serialized ? `${pathname}?${serialized}` : pathname;
  }, [safeNextPath]);

  useEffect(() => {
    if (!isUserLoaded) return;
    if (user) {
      if (companySetupPath) {
        router.replace(companySetupPath);
        return;
      }

      const nextSuffix = safeNextPath ? `?next=${encodeURIComponent(safeNextPath)}` : "";
      router.replace(`/auth-complete${nextSuffix}`);
      return;
    }
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
          if (companySetupPath) {
            router.replace(companySetupPath);
            return;
          }

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
  }, [ticket, isSignInLoaded, signIn, setActive, router, safeNextPath, companySetupPath, user, isUserLoaded]);

  useEffect(() => {
    if (ticket) return;
    if (user) {
      if (companySetupPath) {
        router.push(companySetupPath);
        return;
      }
      const nextSuffix = safeNextPath ? `?next=${encodeURIComponent(safeNextPath)}` : "";
      router.push(`/auth-complete${nextSuffix}`);
    }
  }, [ticket, user, router, safeNextPath, companySetupPath]);

  if (ticket && !ticketError) {
    return <MagicLinkLoadingPage />;
  }

  if (ticketError) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-white">
        <div className="fixed inset-[10px] overflow-hidden rounded-[6px]">
          <Image
            src="/coming-soon/bg-photo.jpg"
            alt="Construction blocks background"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
          <div className="w-full max-w-[420px] rounded-[6px] border border-[#f14110]/20 bg-[#fff3ef]/95 px-6 py-6 text-center backdrop-blur-sm">
            <h1 className="text-[18px] font-semibold tracking-[0.36px] text-[#333]">
              Sorry
            </h1>
            <p className="mt-3 whitespace-pre-line text-[12px] leading-[18px] text-[#8a2e14]">
              {ticketError}
            </p>
            <div className="mt-5 flex justify-center">
              <a
                href="mailto:hello@solidfind.id"
                className="flex h-10 w-[140px] items-center justify-center rounded-full border border-[#333] text-[11px] font-medium tracking-[0.22px] text-[#333] transition-colors hover:border-[#f14110] hover:text-[#f14110]"
              >
                Email us
              </a>
            </div>
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
          onClose={handleClose}
          initialMode="login"
          initialAccountType={initialAccountType}
        />
      </div>
    </div>
  );
}
