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

    void createOrGetUser({
      clerkId: user.id,
      email: user.primaryEmailAddress?.emailAddress ?? "",
      name: user.fullName ?? user.firstName ?? undefined,
      accountType:
        (user.publicMetadata?.accountType as "company" | "individual") ??
        "individual",
      companyName: user.publicMetadata?.companyName as string | undefined,
      imageUrl: user.imageUrl,
    });
  }, [isLoaded, user, createOrGetUser]);
}
