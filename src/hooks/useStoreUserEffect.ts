"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";

export function useStoreUserEffect() {
  const { user, isLoaded } = useUser();
  const createOrGetUser = useMutation(api.users.createOrGetUser);

  useEffect(() => {
    if (!isLoaded || !user) return;

    // publicMetadata is authoritative (set by server API route)
    // unsafeMetadata is fallback (set during signUp.create, available immediately)
    // This avoids race condition where publicMetadata isn't set yet on first load
    const accountType =
      (user.publicMetadata?.accountType as "company" | "individual") ??
      (user.unsafeMetadata?.accountType as "company" | "individual") ??
      "individual";
    const companyName =
      (user.publicMetadata?.companyName as string | undefined) ??
      (user.unsafeMetadata?.companyName as string | undefined);

    void createOrGetUser({
      clerkId: user.id,
      email: user.primaryEmailAddress?.emailAddress ?? "",
      name: user.fullName ?? user.firstName ?? undefined,
      accountType,
      companyName,
      imageUrl: user.imageUrl,
    });
  }, [isLoaded, user, createOrGetUser]);
}
