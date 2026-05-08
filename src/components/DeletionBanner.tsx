"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export function DeletionBanner() {
  const { user } = useUser();
  const [cancelling, setCancelling] = useState(false);

  const deletionStatus = useQuery(
    api.accountDeletion.getDeletionStatus,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const cancelDeletion = useMutation(api.accountDeletion.cancelDeletion);

  if (!deletionStatus) return null;

  const handleCancel = async () => {
    if (!user?.id) return;
    setCancelling(true);
    try {
      await cancelDeletion({ clerkId: user.id });
    } catch (error) {
      console.error("Failed to cancel deletion:", error);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#FEF3C7",
        borderBottom: "1px solid #F59E0B",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        fontSize: 13,
        fontFamily: "var(--font-sora), sans-serif",
        zIndex: 1000,
      }}
    >
      <span style={{ color: "#92400E" }}>
        ⚠️ Your account will be deleted in{" "}
        <strong>{deletionStatus.daysRemaining} day{deletionStatus.daysRemaining !== 1 ? "s" : ""}</strong>
      </span>
      <button
        onClick={handleCancel}
        disabled={cancelling}
        style={{
          padding: "4px 12px",
          borderRadius: 4,
          border: "1px solid #92400E",
          backgroundColor: "transparent",
          color: "#92400E",
          fontSize: 12,
          fontWeight: 600,
          cursor: cancelling ? "not-allowed" : "pointer",
          opacity: cancelling ? 0.6 : 1,
        }}
      >
        {cancelling ? "Cancelling..." : "Cancel deletion"}
      </button>
    </div>
  );
}
