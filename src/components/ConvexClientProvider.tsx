"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";
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
    <ConvexProvider client={convex}>
      <UserSync>{children}</UserSync>
    </ConvexProvider>
  );
}
