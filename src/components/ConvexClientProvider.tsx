"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

function UserSync({ children }: { children: ReactNode }) {
  useStoreUserEffect();
  return <>{children}</>;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return <>{children}</>;
  }

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <UserSync>{children}</UserSync>
    </ConvexProviderWithClerk>
  );
}
