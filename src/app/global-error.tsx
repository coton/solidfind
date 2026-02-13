"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Error - SolidFind</title>
      </head>
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f8f8f8",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#333", marginBottom: "16px" }}>
              Something went wrong!
            </h2>
            <button
              onClick={() => reset()}
              style={{
                padding: "8px 16px",
                backgroundColor: "#f14110",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
