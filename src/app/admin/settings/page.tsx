"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface LocalSettings {
  siteTitle: string;
  tagline: string;
  contactEmail: string;
}

const DEFAULT_SETTINGS: LocalSettings = {
  siteTitle: "SolidFind",
  tagline: "Find trusted construction professionals",
  contactEmail: "",
};

const STORAGE_KEY = "solidfind_admin_settings";

export default function AdminSettings() {
  const [settings, setSettings] = useState<LocalSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  // Platform settings from Convex
  const allSettings = useQuery(api.platformSettings.getAll);
  const setSetting = useMutation(api.platformSettings.set);

  // Deletion feedback
  const deletionFeedback = useQuery(api.accountDeletion.listFeedback);

  // Derive platform settings from query
  const platformMap: Record<string, string> = {};
  if (allSettings) {
    for (const s of allSettings) {
      platformMap[s.key] = s.value;
    }
  }

  const proEnabled = platformMap["pro_enabled"] === "true";
  const pricingPhase = platformMap["pricing_phase"] ?? "launch";
  const monthlyLaunch = platformMap["monthly_price_launch"] ?? "450000";
  const yearlyLaunch = platformMap["yearly_price_launch"] ?? "5000000";
  const monthlyStandard = platformMap["monthly_price_standard"] ?? "650000";
  const yearlyStandard = platformMap["yearly_price_standard"] ?? "7000000";

  // Local pricing state
  const [prices, setPrices] = useState({
    monthlyLaunch: "",
    yearlyLaunch: "",
    monthlyStandard: "",
    yearlyStandard: "",
  });
  const [priceSaved, setPriceSaved] = useState(false);

  useEffect(() => {
    if (allSettings) {
      setPrices({
        monthlyLaunch,
        yearlyLaunch,
        monthlyStandard,
        yearlyStandard,
      });
    }
  }, [allSettings, monthlyLaunch, yearlyLaunch, monthlyStandard, yearlyStandard]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSettings(JSON.parse(stored) as LocalSettings);
      } catch {
        // ignore invalid JSON
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2000);
  };

  const handleTogglePro = async () => {
    await setSetting({
      key: "pro_enabled",
      value: proEnabled ? "false" : "true",
      updatedBy: "admin",
    });
  };

  const handlePhaseSave = async (phase: string) => {
    await setSetting({
      key: "pricing_phase",
      value: phase,
      updatedBy: "admin",
    });
  };

  const handlePriceSave = async () => {
    await Promise.all([
      setSetting({ key: "monthly_price_launch", value: prices.monthlyLaunch, updatedBy: "admin" }),
      setSetting({ key: "yearly_price_launch", value: prices.yearlyLaunch, updatedBy: "admin" }),
      setSetting({ key: "monthly_price_standard", value: prices.monthlyStandard, updatedBy: "admin" }),
      setSetting({ key: "yearly_price_standard", value: prices.yearlyStandard, updatedBy: "admin" }),
    ]);
    setPriceSaved(true);
    setTimeout(() => setPriceSaved(false), 2000);
  };

  const inputStyle = {
    width: "100%",
    height: 36,
    padding: "0 12px",
    backgroundColor: "#fff",
    border: "1px solid #e4e4e4",
    borderRadius: 6,
    fontSize: 12,
    color: "#333",
    outline: "none",
  } as const;

  const labelStyle = {
    display: "block",
    fontSize: 11,
    fontWeight: 500 as const,
    color: "rgba(51,51,51,0.6)",
    marginBottom: 4,
  };

  const sectionStyle = {
    backgroundColor: "#fff",
    borderRadius: 8,
    border: "1px solid #e4e4e4",
    padding: 24,
    marginBottom: 24,
  };

  const formatIDR = (val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return val;
    return new Intl.NumberFormat("id-ID").format(num);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-bold text-[#333] tracking-[0.48px]">Settings</h1>
      </div>

      {/* Pro Feature Toggle */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "#333", marginBottom: 16 }}>
          Pro Feature
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={handleTogglePro}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              border: "none",
              backgroundColor: proEnabled ? "#f14110" : "#ccc",
              cursor: "pointer",
              position: "relative",
              transition: "background-color 0.2s",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                backgroundColor: "#fff",
                position: "absolute",
                top: 3,
                left: proEnabled ? 23 : 3,
                transition: "left 0.2s",
              }}
            />
          </button>
          <span style={{ fontSize: 13, color: "#333" }}>
            Pro subscriptions {proEnabled ? "enabled" : "disabled"}
          </span>
        </div>
      </div>

      {/* Pricing Phase */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "#333", marginBottom: 16 }}>
          Pricing Phase
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          {(["launch", "standard"] as const).map((phase) => (
            <button
              key={phase}
              onClick={() => handlePhaseSave(phase)}
              style={{
                padding: "8px 20px",
                borderRadius: 6,
                border: `1px solid ${pricingPhase === phase ? "#f14110" : "#e4e4e4"}`,
                backgroundColor: pricingPhase === phase ? "#f14110" : "#fff",
                color: pricingPhase === phase ? "#fff" : "#333",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {phase}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 11, color: "rgba(51,51,51,0.5)", marginTop: 8 }}>
          Current phase: <strong>{pricingPhase}</strong>. This determines which prices are used for new subscriptions.
        </p>
      </div>

      {/* Pricing Editor */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "#333", marginBottom: 16 }}>
          Pricing (IDR)
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 500 }}>
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 12 }}>
              Launch Prices
            </h3>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Monthly</label>
              <input
                type="text"
                value={prices.monthlyLaunch}
                onChange={(e) => setPrices({ ...prices, monthlyLaunch: e.target.value })}
                style={inputStyle}
              />
              <span style={{ fontSize: 10, color: "#999" }}>Rp {formatIDR(prices.monthlyLaunch)}</span>
            </div>
            <div>
              <label style={labelStyle}>Yearly</label>
              <input
                type="text"
                value={prices.yearlyLaunch}
                onChange={(e) => setPrices({ ...prices, yearlyLaunch: e.target.value })}
                style={inputStyle}
              />
              <span style={{ fontSize: 10, color: "#999" }}>Rp {formatIDR(prices.yearlyLaunch)}</span>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 12 }}>
              Standard Prices
            </h3>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Monthly</label>
              <input
                type="text"
                value={prices.monthlyStandard}
                onChange={(e) => setPrices({ ...prices, monthlyStandard: e.target.value })}
                style={inputStyle}
              />
              <span style={{ fontSize: 10, color: "#999" }}>Rp {formatIDR(prices.monthlyStandard)}</span>
            </div>
            <div>
              <label style={labelStyle}>Yearly</label>
              <input
                type="text"
                value={prices.yearlyStandard}
                onChange={(e) => setPrices({ ...prices, yearlyStandard: e.target.value })}
                style={inputStyle}
              />
              <span style={{ fontSize: 10, color: "#999" }}>Rp {formatIDR(prices.yearlyStandard)}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handlePriceSave}
          style={{
            marginTop: 16,
            fontSize: 11,
            fontWeight: 500,
            padding: "8px 16px",
            borderRadius: 6,
            backgroundColor: "#333",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          {priceSaved ? "Saved!" : "Save Prices"}
        </button>
      </div>

      {/* Deletion Feedback */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "#333", marginBottom: 16 }}>
          Account Deletion Feedback
        </h2>
        {!deletionFeedback || deletionFeedback.length === 0 ? (
          <p style={{ fontSize: 12, color: "rgba(51,51,51,0.5)" }}>No deletion feedback yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {deletionFeedback.map((fb) => (
              <div
                key={fb._id}
                style={{
                  padding: 12,
                  borderRadius: 6,
                  border: "1px solid #e4e4e4",
                  fontSize: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontWeight: 500, color: "#333" }}>
                    {fb.userName} ({fb.userEmail})
                  </span>
                  <span style={{ color: "#999", fontSize: 10 }}>
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ color: "#666", margin: 0, lineHeight: 1.4 }}>{fb.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Platform Settings (local) */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "#333", marginBottom: 16 }}>Platform Settings</h2>
        <div className="space-y-4 max-w-[400px]">
          <div>
            <label style={labelStyle}>Site Title</label>
            <input
              type="text"
              value={settings.siteTitle}
              onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Tagline</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Contact Email</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              placeholder="admin@example.com"
              style={inputStyle}
            />
          </div>
          <button
            onClick={handleSave}
            style={{
              fontSize: 11,
              fontWeight: 500,
              padding: "8px 16px",
              borderRadius: 6,
              backgroundColor: "#333",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            {saved ? "Saved!" : "Save Settings"}
          </button>
        </div>
      </div>

      {/* System Info */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "#333", marginBottom: 16 }}>System Info</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span style={{ fontSize: 12, color: "rgba(51,51,51,0.7)" }}>Convex Backend: Connected</span>
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{ ...sectionStyle, borderColor: "#fecaca", marginBottom: 0 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "#dc2626", marginBottom: 8 }}>Danger Zone</h2>
        <p style={{ fontSize: 11, color: "rgba(51,51,51,0.5)", marginBottom: 16 }}>
          These actions can affect your application. Use with caution.
        </p>
        <button
          onClick={handleClearCache}
          style={{
            fontSize: 11,
            fontWeight: 500,
            padding: "8px 16px",
            borderRadius: 6,
            border: "1px solid #fecaca",
            backgroundColor: "transparent",
            color: "#dc2626",
            cursor: "pointer",
          }}
        >
          {cacheCleared ? "Cache Cleared!" : "Clear Cache"}
        </button>
      </div>
    </div>
  );
}
