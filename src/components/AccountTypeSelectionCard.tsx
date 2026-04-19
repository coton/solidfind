"use client";

import Image from "next/image";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { resolveMediaSetting } from "@/lib/platform-settings.mjs";

type AccountType = "company" | "individual";

interface AccountTypeSelectionCardProps {
  name: string;
  email: string;
  initialAccountType?: AccountType;
  initialCompanyName?: string;
  onSubmit: (accountType: AccountType, companyName?: string) => Promise<void> | void;
  isSubmitting?: boolean;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        width: "24px",
        height: "12px",
        borderRadius: "6px",
        background: checked ? "linear-gradient(to left, #F14110, #E9A28E)" : "rgba(51,51,51,0.25)",
        position: "relative",
        border: "none",
        cursor: "pointer",
        transition: "background 0.2s ease",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: "white",
          position: "absolute",
          top: "2px",
          left: checked ? "14px" : "2px",
          transition: "left 0.2s ease",
        }}
      />
    </button>
  );
}

export function AccountTypeSelectionCard({
  name,
  email,
  initialAccountType = "individual",
  initialCompanyName,
  onSubmit,
  isSubmitting = false,
}: AccountTypeSelectionCardProps) {
  const [accountType, setAccountType] = useState<AccountType>(initialAccountType);
  const [companyName, setCompanyName] = useState(initialCompanyName || "");
  const [submitHovered, setSubmitHovered] = useState(false);

  const newUserImageValue = useQuery(api.platformSettings.get, { key: "newUserImage" });
  const newUserImageState = resolveMediaSetting(newUserImageValue, { url: "/images/bg-individual-page.png", type: "image" });
  const bannerImageSrc = newUserImageState.media.url;

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-[#ececec]/55 backdrop-blur-[3px] rounded-[6px]" />

      <div className="relative bg-[#f8f8f8] border border-white/70 rounded-[6px] px-7 py-6 shadow-[0_20px_60px_rgba(0,0,0,0.12)] max-w-[440px] w-full ml-auto mr-auto">
        <p className="text-[11px] text-[#333]/70 tracking-[0.22px]">Hello</p>
        <h2 className="text-[32px] font-bold text-[#333] tracking-[0.64px] leading-none mt-1">{name}</h2>
        <p className="text-[11px] text-[#333] tracking-[0.22px] mt-3">{email}</p>

        <div className="mt-5 mb-5 rounded-[6px] overflow-hidden relative" style={{ width: "100%", aspectRatio: "386 / 96" }}>
          {bannerImageSrc ? (
            <Image
              src={bannerImageSrc}
              alt="SolidFind"
              fill
              sizes="(max-width: 440px) calc(100vw - 56px), 384px"
              className="absolute inset-0 w-full h-full object-cover object-right-bottom sm:object-center"
              unoptimized={bannerImageSrc.startsWith("data:")}
            />
          ) : (
            <div className="absolute inset-0 bg-[#e4e4e4]" />
          )}
        </div>

        <h3
          style={{
            textAlign: "center",
            fontSize: "18px",
            fontWeight: 600,
            color: "#333",
            letterSpacing: "0.36px",
            fontFamily: "var(--font-sora), sans-serif",
            marginBottom: "6px",
            marginTop: 0,
          }}
        >
          CHOOSE ACCOUNT TYPE
        </h3>

        <p style={{ textAlign: "center", fontSize: "9px", color: "#999", lineHeight: 1.5, marginBottom: "16px", marginTop: 0 }}>
          Please select how you want to continue before accessing your dashboard.
          <br />
          Silakan pilih tipe akun sebelum masuk ke dashboard.
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: "11px", fontWeight: 500, color: "#333", letterSpacing: "0.22px", fontFamily: "var(--font-sora), sans-serif" }}>COMPANY</span>
              <Toggle checked={accountType === "company"} onChange={() => setAccountType("company")} />
            </div>
            <p style={{ fontSize: "9px", color: "#999", margin: 0, lineHeight: 1.4 }}>
              Create a profile page/
              <br />
              Buat halaman
            </p>
          </div>

          <div style={{ textAlign: "left", marginLeft: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: "11px", fontWeight: 500, color: "#333", letterSpacing: "0.22px", fontFamily: "var(--font-sora), sans-serif" }}>INDIVIDUAL</span>
              <Toggle checked={accountType === "individual"} onChange={() => setAccountType("individual")} />
            </div>
            <p style={{ fontSize: "9px", color: "#999", margin: 0, lineHeight: 1.4 }}>
              Save listings/
              <br />
              Simpan daftar
            </p>
          </div>
        </div>

        {accountType === "company" && (
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 500, color: "#333", marginBottom: "5px", letterSpacing: "0.22px" }}>
              Company Name <span style={{ color: "#F14110" }}>(*)</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
              style={{ width: "100%", height: "38px", backgroundColor: "white", border: "1px solid #E4E4E4", borderRadius: "6px", padding: "0 10px", fontSize: "12px", color: "#333", outline: "none", boxSizing: "border-box" }}
            />
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", marginTop: "28px", marginBottom: "4px" }}>
          <button
            type="button"
            disabled={isSubmitting || (accountType === "company" && !companyName.trim())}
            onClick={() => onSubmit(accountType, accountType === "company" ? companyName.trim() : undefined)}
            onMouseEnter={() => setSubmitHovered(true)}
            onMouseLeave={() => setSubmitHovered(false)}
            style={{
              width: "145px",
              height: "40px",
              borderRadius: "20px",
              border: submitHovered ? "none" : "1px solid #F14110",
              background: submitHovered ? "linear-gradient(to right, #E9A28E, #F14110)" : "transparent",
              color: submitHovered ? "white" : "#F14110",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.5px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              opacity: isSubmitting || (accountType === "company" && !companyName.trim()) ? 0.6 : 1,
            }}
          >
            {isSubmitting ? "Saving..." : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
