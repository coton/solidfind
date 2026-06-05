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
      <body style={{ margin: 0, fontFamily: "Sora, system-ui, sans-serif", backgroundColor: "#f8f8f8", color: "#231f20" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "0 24px 64px",
          }}
        >
          <div style={{ width: "100%", maxWidth: "1200px", marginBottom: "48px", borderBottom: "1px solid #e4e4e4", padding: "18px 0" }}>
            <a href="/" aria-label="SolidFind home" style={{ display: "inline-flex", alignItems: "baseline", gap: "3px", textDecoration: "none" }}>
              <span style={{ color: "#231f20", fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em" }}>SolidFind</span>
              <span style={{ color: "#8c8c8c", fontFamily: "monospace", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em" }}>.id</span>
            </a>
          </div>

          <section style={{ width: "100%", maxWidth: "560px", textAlign: "center" }}>
            <div style={{ marginBottom: "-8px", userSelect: "none", color: "#e4e4e4", fontSize: "clamp(96px, 20vw, 168px)", fontWeight: 200, letterSpacing: "-0.05em", lineHeight: 1 }}>
              E<span style={{ color: "#f14110" }}>R</span>R
            </div>
            <p style={{ margin: "0 0 20px", color: "#8c8c8c", fontFamily: "monospace", fontSize: "11px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Runtime error
            </p>
            <h1 style={{ margin: "0 0 16px", color: "#231f20", fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
              Something slipped -<br />but the site is still <strong style={{ color: "#f14110", fontWeight: 700 }}>on solid ground.</strong>
            </h1>
            <p style={{ maxWidth: "400px", margin: "0 auto 24px", color: "#333", fontSize: "14px", lineHeight: 1.65 }}>
              We hit a critical error. Try again, or return home and continue browsing.
            </p>
            {error.digest && (
              <p style={{ maxWidth: "400px", margin: "0 auto 32px", color: "#8c8c8c", fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Error ID: {error.digest}
              </p>
            )}
            
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => reset()}
                style={{
                  padding: "11px 22px",
                  backgroundColor: "#f14110",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  letterSpacing: "0.01em",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#ec3300")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f14110")}
              >
                Try again
              </button>
              <a
                href="/"
                style={{
                  padding: "11px 22px",
                  backgroundColor: "transparent",
                  color: "#231f20",
                  border: "1px solid #d8d8d8",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  letterSpacing: "0.01em",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = "#f14110";
                  e.currentTarget.style.color = "#f14110";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "#d8d8d8";
                  e.currentTarget.style.color = "#231f20";
                }}
              >
                Take me home
              </a>
            </div>
            
            <p style={{ marginTop: "28px", color: "#8c8c8c", fontSize: "13px", lineHeight: 1.5 }}>
              Still seeing this?{" "}
              <a
                href={`mailto:support@solidfind.id?subject=Critical%20Error%20Report&body=Error%20ID:%20${error.digest || 'N/A'}%0A%0AError%20Message:%20${encodeURIComponent(error.message)}`}
                style={{
                  color: "#f14110",
                  textDecoration: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                Report it to us
              </a>.
            </p>
          </section>
        </div>
      </body>
    </html>
  );
}
