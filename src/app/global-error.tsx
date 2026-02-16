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
      <body style={{ margin: 0, fontFamily: "Sora, system-ui, sans-serif", backgroundColor: "#ececec" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "500px" }}>
            <div style={{ fontSize: "80px", marginBottom: "20px" }}>⚠️</div>
            <h2 style={{ fontSize: "28px", fontWeight: "600", color: "#333", marginBottom: "12px" }}>
              Critical Error
            </h2>
            <p style={{ color: "rgba(51, 51, 51, 0.7)", marginBottom: "8px", fontSize: "15px" }}>
              We encountered a critical error. Please try refreshing the page.
            </p>
            {error.digest && (
              <p style={{ color: "rgba(51, 51, 51, 0.5)", marginBottom: "24px", fontSize: "13px", fontFamily: "monospace" }}>
                Error ID: {error.digest}
              </p>
            )}
            
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => reset()}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#f14110",
                  color: "white",
                  border: "none",
                  borderRadius: "50px",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: "500",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#d83a0e")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f14110")}
              >
                Try Again
              </button>
              <a
                href="/"
                style={{
                  padding: "12px 24px",
                  backgroundColor: "white",
                  color: "#333",
                  border: "1px solid #e4e4e4",
                  borderRadius: "50px",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: "500",
                  textDecoration: "none",
                  display: "inline-block",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "white")}
              >
                Return to Home
              </a>
            </div>
            
            <div style={{ marginTop: "24px" }}>
              <a
                href={`mailto:support@solidfind.id?subject=Critical%20Error%20Report&body=Error%20ID:%20${error.digest || 'N/A'}%0A%0AError%20Message:%20${encodeURIComponent(error.message)}`}
                style={{
                  color: "#f14110",
                  fontSize: "14px",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                Report this issue to our team
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
