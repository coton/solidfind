"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { AccountTypeSelectionCard } from "@/components/AccountTypeSelectionCard";

type AccountType = "company" | "individual";

export default function AuthCompletePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const existingAccountType = user?.publicMetadata?.accountType as AccountType | undefined;
  const pendingAccountType = typeof window !== "undefined"
    ? (sessionStorage.getItem("solidfind_accountType") as AccountType | null)
    : null;
  const pendingCompanyName = typeof window !== "undefined"
    ? sessionStorage.getItem("solidfind_companyName") || undefined
    : undefined;

  useEffect(() => {
    if (!isLoaded || !user) return;

    if (existingAccountType === "company") {
      sessionStorage.removeItem("solidfind_accountType");
      sessionStorage.removeItem("solidfind_companyName");
      router.replace("/company-dashboard");
      return;
    }

    if (existingAccountType === "individual") {
      sessionStorage.removeItem("solidfind_accountType");
      sessionStorage.removeItem("solidfind_companyName");
      router.replace("/dashboard");
      return;
    }

    if (pendingAccountType === "company" || pendingAccountType === "individual") {
      void persistAccountType(pendingAccountType, pendingCompanyName);
    }
  }, [isLoaded, user, existingAccountType, pendingAccountType, pendingCompanyName, router]);

  const persistAccountType = async (accountType: AccountType, companyName?: string) => {
    setIsSaving(true);
    try {
      await fetch("/api/set-account-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountType, companyName }),
      });
      sessionStorage.removeItem("solidfind_accountType");
      sessionStorage.removeItem("solidfind_companyName");
      router.push(accountType === "company" ? "/company-dashboard" : "/dashboard");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8f8f8", fontFamily: "var(--font-sora), sans-serif", color: "#333", fontSize: "14px" }}>
        Completing sign in...
      </div>
    );
  }

  if (existingAccountType || pendingAccountType) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8f8f8", fontFamily: "var(--font-sora), sans-serif", color: "#333", fontSize: "14px" }}>
        Completing sign in...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ececec] flex items-center justify-center px-4 py-8">
      <AccountTypeSelectionCard
        name={user.fullName || user.firstName || "User"}
        email={user.primaryEmailAddress?.emailAddress || "user@gmail.com"}
        onSubmit={persistAccountType}
        isSubmitting={isSaving}
      />
    </div>
  );
}
