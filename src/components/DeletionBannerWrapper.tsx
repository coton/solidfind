"use client";

import { SignedIn } from "@clerk/nextjs";
import { DeletionBanner } from "./DeletionBanner";

export function DeletionBannerWrapper() {
  return (
    <SignedIn>
      <DeletionBanner />
    </SignedIn>
  );
}
