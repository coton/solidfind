"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import Image from "next/image";
import { AccountTypeSelectionCard } from "@/components/AccountTypeSelectionCard";
import { MagicLinkLoadingPage } from "@/components/MagicLinkLoadingPage";
import { api } from "../../../convex/_generated/api";
import { getPostAuthRedirectPath, sanitizeNextPath } from "@/lib/magic-link-login.mjs";

type AccountType = "company" | "individual";

function AuthCompleteBackground({ children }: { children: ReactNode }) {
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
        {children}
      </div>
    </div>
  );
}

function CompletionMessage({ children }: { children: ReactNode }) {
  return (
    <AuthCompleteBackground>
      <div className="rounded-[6px] border border-white/70 bg-[#f8f8f8]/90 px-6 py-4 text-center text-[14px] text-[#333] shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur-sm">
        {children}
      </div>
    </AuthCompleteBackground>
  );
}

export default function AuthCompletePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const createOrGetUser = useMutation(api.users.createOrGetUser);
  const [isSaving, setIsSaving] = useState(false);
  const [autoPersistAttempted, setAutoPersistAttempted] = useState(false);
  const [saveError, setSaveError] = useState("");

  const existingAccountType = user?.publicMetadata?.accountType as AccountType | undefined;
  const requestedNextPath = useMemo(() => sanitizeNextPath(searchParams.get("next")), [searchParams]);
  const pendingAccountType = typeof window !== "undefined"
    ? (sessionStorage.getItem("solidfind_accountType") as AccountType | null)
    : null;
  const pendingCompanyName = typeof window !== "undefined"
    ? sessionStorage.getItem("solidfind_companyName") || undefined
    : undefined;
  const hasPendingAccountTypeChoice = pendingAccountType === "individual" || pendingAccountType === "company";
  const isCompanyMagicLinkFlow = Boolean(requestedNextPath?.startsWith("/company-dashboard/edit"));
  const requestedSetupAccount = useMemo(() => {
    if (!requestedNextPath || !requestedNextPath.startsWith("/company-dashboard/edit")) {
      return null;
    }

    const [pathname, existingQuery = ""] = requestedNextPath.split("?");
    const nextParams = new URLSearchParams(existingQuery);
    nextParams.set("setupAccount", "1");
    const serialized = nextParams.toString();
    return serialized ? `${pathname}?${serialized}` : pathname;
  }, [requestedNextPath]);

  const persistAccountType = useCallback(async (accountType: AccountType, companyName?: string) => {
    if (!user) return;

    setIsSaving(true);
    setSaveError("");
    try {
      const response = await fetch("/api/set-account-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountType, companyName }),
      });

      if (!response.ok) {
        throw new Error("Failed to persist account type");
      }

      await createOrGetUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? "",
        name: user.fullName ?? user.firstName ?? undefined,
        accountType,
        companyName,
        imageUrl: user.imageUrl,
      });

      sessionStorage.removeItem("solidfind_accountType");
      sessionStorage.removeItem("solidfind_companyName");
      router.replace(
        accountType === "company"
          ? getPostAuthRedirectPath({ accountType: "company", requestedNextPath: requestedNextPath || "/register-business" })
          : getPostAuthRedirectPath({ accountType: "individual", requestedNextPath })
      );
    } finally {
      setIsSaving(false);
    }
  }, [createOrGetUser, requestedNextPath, router, user]);

  useEffect(() => {
    if (!isLoaded || !user) return;

    // Returning user with established accountType — redirect immediately
    if (existingAccountType === "company") {
      sessionStorage.removeItem("solidfind_accountType");
      sessionStorage.removeItem("solidfind_companyName");
      router.replace(getPostAuthRedirectPath({ accountType: "company", requestedNextPath: requestedSetupAccount || requestedNextPath }));
      return;
    }

    if (existingAccountType === "individual") {
      sessionStorage.removeItem("solidfind_accountType");
      sessionStorage.removeItem("solidfind_companyName");
      router.replace(getPostAuthRedirectPath({ accountType: "individual", requestedNextPath }));
      return;
    }
  }, [isLoaded, user, existingAccountType, requestedNextPath, requestedSetupAccount, router]);

  useEffect(() => {
    if (!isLoaded || !user || existingAccountType || isSaving || autoPersistAttempted) return;

    if (!hasPendingAccountTypeChoice) return;

    setAutoPersistAttempted(true);
    void persistAccountType(pendingAccountType, pendingAccountType === "company" ? pendingCompanyName?.trim() : undefined)
      .catch((error) => {
        console.error("Failed to complete OAuth account setup:", error);
        setSaveError("We could not finish saving your account type automatically. Please confirm it below.");
      });
  }, [
    autoPersistAttempted,
    existingAccountType,
    isLoaded,
    isSaving,
    hasPendingAccountTypeChoice,
    pendingAccountType,
    pendingCompanyName,
    persistAccountType,
    user,
  ]);

  // Loading state
  if (!isLoaded || !user) {
    return isCompanyMagicLinkFlow ? <MagicLinkLoadingPage /> : (
      <CompletionMessage>Completing sign in...</CompletionMessage>
    );
  }

  // Returning user — useEffect will redirect, show brief loading state
  if (existingAccountType) {
    return isCompanyMagicLinkFlow ? <MagicLinkLoadingPage /> : (
      <CompletionMessage>Completing sign in...</CompletionMessage>
    );
  }

  if ((isSaving || hasPendingAccountTypeChoice) && !saveError) {
    return (
      <CompletionMessage>
        Completing account setup...
      </CompletionMessage>
    );
  }

  // NEW user — show account type selection card
  // Pre-select based on what they chose in the AuthModal when automatic completion is not possible.
  return (
    <AuthCompleteBackground>
      <div className="w-full max-w-[440px]">
        {saveError ? (
          <p className="mb-3 rounded-[6px] border border-[#F14110]/20 bg-white/90 px-4 py-3 text-center text-[11px] leading-[1.5] text-[#F14110] shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-sm">
            {saveError}
          </p>
        ) : null}
        <AccountTypeSelectionCard
          name={user.fullName || user.firstName || "User"}
          email={user.primaryEmailAddress?.emailAddress || "user@gmail.com"}
          initialAccountType={pendingAccountType || "individual"}
          initialCompanyName={pendingCompanyName}
          onSubmit={persistAccountType}
          isSubmitting={isSaving}
        />
      </div>
    </AuthCompleteBackground>
  );
}
