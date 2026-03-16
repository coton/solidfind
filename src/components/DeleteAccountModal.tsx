"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  displayName: string;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  displayName,
}: DeleteAccountModalProps) {
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const requestDeletion = useMutation(api.accountDeletion.requestDeletion);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await requestDeletion({
        clerkId: user.id,
        reason: reason || "No reason provided",
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to request deletion:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: "32px 28px",
          maxWidth: 420,
          width: "90%",
          position: "relative",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "none",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            color: "#999",
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#333",
                marginBottom: 12,
              }}
            >
              Deletion request submitted
            </h2>
            <p style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>
              Your account will be permanently deleted in 30 days. You can
              cancel this at any time from your dashboard.
            </p>
            <button
              onClick={handleClose}
              style={{
                marginTop: 20,
                padding: "10px 24px",
                borderRadius: 6,
                border: "none",
                backgroundColor: "#333",
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Sad face */}
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 48 }}>😢</div>
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#333",
                textAlign: "center",
                marginBottom: 4,
              }}
            >
              Delete account
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "#666",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              {displayName}
            </p>

            {/* Sad message */}
            <p
              style={{
                fontSize: 14,
                color: "#333",
                textAlign: "center",
                marginBottom: 20,
                fontWeight: 500,
              }}
            >
              We are sad to see you leave
            </p>

            {/* Bilingual textarea label */}
            <p
              style={{
                fontSize: 12,
                color: "#666",
                marginBottom: 8,
                lineHeight: 1.5,
              }}
            >
              If you do not mind, would you please let us know why you left?
              <br />
              <span style={{ fontStyle: "italic", color: "#999" }}>
                Jika Anda tidak keberatan, bisakah Anda memberi tahu kami
                mengapa Anda pergi?
              </span>
            </p>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Your feedback helps us improve..."
              style={{
                width: "100%",
                minHeight: 100,
                padding: 12,
                borderRadius: 6,
                border: "1px solid #e4e4e4",
                fontSize: 13,
                color: "#333",
                resize: "vertical",
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                marginTop: 16,
                width: "100%",
                padding: "12px 24px",
                borderRadius: 6,
                border: "2px solid #f14110",
                backgroundColor: "transparent",
                color: "#f14110",
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                transition: "all 0.2s",
              }}
            >
              {loading ? "Processing..." : "Delete my account"}
            </button>

            {/* Footer encouragement */}
            <p
              style={{
                fontSize: 11,
                color: "#999",
                textAlign: "center",
                marginTop: 16,
                lineHeight: 1.5,
              }}
            >
              Your account will be scheduled for deletion in 30 days. You can
              cancel anytime before then and keep all your data.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
