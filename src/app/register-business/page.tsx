"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function RegisterBusinessPage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const hasStartedCreatingRef = useRef(false);

  const currentUser = useQuery(
    api.users.getCurrentUser,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const existingCompany = useQuery(
    api.companies.getByOwner,
    currentUser?._id ? { ownerId: currentUser._id } : "skip"
  );

  const createCompany = useMutation(api.companies.create);
  const updateAccountType = useMutation(api.users.updateAccountType);

  useEffect(() => {
    if (!isClerkLoaded || !currentUser) return;

    // Only company accounts can register a business
    if (currentUser.accountType !== "company") {
      router.replace("/dashboard");
      return;
    }

    // If company already exists, go to edit page
    if (existingCompany) {
      router.replace("/company-dashboard/edit");
      return;
    }

    // existingCompany is still loading (undefined) — wait
    if (existingCompany === undefined) return;

    // No company exists — create a blank one and redirect
    if (!hasStartedCreatingRef.current && existingCompany === null) {
      hasStartedCreatingRef.current = true;
      const companyName = clerkUser?.fullName || clerkUser?.firstName || "My Company";

      createCompany({
        ownerId: currentUser._id,
        name: companyName,
        category: "construction",
        description: "",
        isPro: false,
      }).then(() => {
        // Ensure account type is "company"
        if (clerkUser?.id) {
          updateAccountType({
            clerkId: clerkUser.id,
            accountType: "company",
          });
        }
        router.replace("/company-dashboard/edit?firstConnection=1");
      }).catch((err) => {
        console.error("Failed to create company:", err);
        hasStartedCreatingRef.current = false;
      });
    }
  }, [isClerkLoaded, currentUser, existingCompany, clerkUser, createCompany, updateAccountType, router]);

  // Show a minimal loading state while creating/redirecting
  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#f14110] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-[12px] text-[#333]/70 tracking-[0.22px]">Setting up your profile...</p>
      </div>
    </div>
  );
}
