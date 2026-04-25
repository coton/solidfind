"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { AccountTypeSelectionCard } from "@/components/AccountTypeSelectionCard";
import { api } from "../../../convex/_generated/api";
import { getPostAuthRedirectPath, sanitizeNextPath } from "@/lib/magic-link-login.mjs";

type AccountType = "company" | "individual";

export default function AuthCompletePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const createOrGetUser = useMutation(api.users.createOrGetUser);
  const [isSaving, setIsSaving] = useState(false);

  const existingAccountType = user?.publicMetadata?.accountType as AccountType | undefined;
  const requestedNextPath = useMemo(() => sanitizeNextPath(searchParams.get("next")), [searchParams]);
  const pendingAccountType = typeof window !== "undefined"
    ? (sessionStorage.getItem("solidfind_accountType") as AccountType | null)
    : null;
  const pendingCompanyName = typeof window !== "undefined"
    ? sessionStorage.getItem("solidfind_companyName") || undefined
    : undefined;
  const requestedSetupAccount = useMemo(() => {
    if (!requestedNextPath || !requestedNextPath.startsWith("/company-dashboard/edit")) {
      return null;
    }

    if (user?.passwordEnabled) {
      return requestedNextPath;
    }

    const [pathname, existingQuery = ""] = requestedNextPath.split("?");
    const nextParams = new URLSearchParams(existingQuery);
    nextParams.set("setupAccount", "1");
    const serialized = nextParams.toString();
    return serialized ? `${pathname}?${serialized}` : pathname;
  }, [requestedNextPath, user?.passwordEnabled]);

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

    // NEW user (no existingAccountType in publicMetadata):
    // Don't auto-redirect based on sessionStorage — show the AccountTypeSelectionCard
    // so the user can confirm or change their choice.
    // pendingAccountType from sessionStorage is passed as initialAccountType below.
  }, [isLoaded, user, existingAccountType, requestedNextPath, requestedSetupAccount, router]);

  const persistAccountType = async (accountType: AccountType, companyName?: string) => {
    if (!user) return;

    setIsSaving(true);
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
  };

  // Loading state
  if (!isLoaded || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8f8f8", fontFamily: "var(--font-sora), sans-serif", color: "#333", fontSize: "14px" }}>
        Completing sign in...
      </div>
    );
  }

  // Returning user — useEffect will redirect, show brief loading state
  if (existingAccountType) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8f8f8", fontFamily: "var(--font-sora), sans-serif", color: "#333", fontSize: "14px" }}>
        Completing sign in...
      </div>
    );
  }

  // NEW user — show account type selection card
  // Pre-select based on what they chose in the AuthModal, but let them confirm or change
  return (
    <div className="min-h-screen bg-[#ececec] flex items-center justify-center px-4 py-8">
      <AccountTypeSelectionCard
        name={user.fullName || user.firstName || "User"}
        email={user.primaryEmailAddress?.emailAddress || "user@gmail.com"}
        initialAccountType={pendingAccountType || "individual"}
        initialCompanyName={pendingCompanyName}
        onSubmit={persistAccountType}
        isSubmitting={isSaving}
      />
    </div>
  );
}
