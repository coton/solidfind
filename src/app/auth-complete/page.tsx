"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function AuthCompletePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const accountType = sessionStorage.getItem("solidfind_accountType") || "individual";
    const companyName = sessionStorage.getItem("solidfind_companyName") || undefined;
    sessionStorage.removeItem("solidfind_accountType");
    sessionStorage.removeItem("solidfind_companyName");

    fetch("/api/set-account-type", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountType, companyName }),
    }).then(() => {
      router.push(accountType === "company" ? "/company-dashboard" : "/dashboard");
    });
  }, [isLoaded, user, router]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f8f8f8",
      fontFamily: "var(--font-sora), sans-serif",
      color: "#333",
      fontSize: "14px",
    }}>
      Completing sign in...
    </div>
  );
}
