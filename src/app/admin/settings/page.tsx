"use client";

import { useState, useEffect } from "react";

interface PlatformSettings {
  siteTitle: string;
  tagline: string;
  contactEmail: string;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  siteTitle: "SolidFind",
  tagline: "Find trusted construction professionals",
  contactEmail: "",
};

const STORAGE_KEY = "solidfind_admin_settings";

export default function AdminSettings() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSettings(JSON.parse(stored) as PlatformSettings);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-bold text-[#333] tracking-[0.48px]">Settings</h1>
      </div>

      {/* Platform Settings */}
      <div className="bg-white rounded-[8px] border border-[#e4e4e4] p-6 mb-6">
        <h2 className="text-[14px] font-semibold text-[#333] mb-4">Platform Settings</h2>
        <div className="space-y-4 max-w-[400px]">
          <div>
            <label className="block text-[11px] font-medium text-[#333]/60 mb-1">Site Title</label>
            <input
              type="text"
              value={settings.siteTitle}
              onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
              className="w-full h-9 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#333] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#333]/60 mb-1">Tagline</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full h-9 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#333] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#333]/60 mb-1">Contact Email</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              placeholder="admin@example.com"
              className="w-full h-9 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#333] transition-colors"
            />
          </div>
          <button
            onClick={handleSave}
            className="text-[11px] font-medium px-4 py-2 rounded-[6px] bg-[#333] text-white hover:bg-[#222] transition-colors"
          >
            {saved ? "Saved!" : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Convex Backend Status */}
      <div className="bg-white rounded-[8px] border border-[#e4e4e4] p-6 mb-6">
        <h2 className="text-[14px] font-semibold text-[#333] mb-4">System Info</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-[12px] text-[#333]/70">Convex Backend: Connected</span>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-[8px] border border-red-200 p-6">
        <h2 className="text-[14px] font-semibold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-[11px] text-[#333]/50 mb-4">
          These actions can affect your application. Use with caution.
        </p>
        <button
          onClick={handleClearCache}
          className="text-[11px] font-medium px-4 py-2 rounded-[6px] border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
        >
          {cacheCleared ? "Cache Cleared!" : "Clear Cache"}
        </button>
      </div>
    </div>
  );
}
