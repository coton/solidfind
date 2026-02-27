"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Upload } from "lucide-react";

const STORAGE_KEY = "solidfind_ui_settings";

interface UISettings {
  contactUrl: string;
  igUrl: string;
  igVisible: boolean;
  adVerticalUrl: string;
  adHorizontalUrl: string;
  headerMediaUrl: string;
  headerMediaType: "image" | "video" | "";
  footerMediaUrl: string;
  footerMediaType: "image" | "video" | "";
  termsText: string;
}

const DEFAULT: UISettings = {
  contactUrl: "",
  igUrl: "",
  igVisible: true,
  adVerticalUrl: "",
  adHorizontalUrl: "",
  headerMediaUrl: "",
  headerMediaType: "",
  footerMediaUrl: "",
  footerMediaType: "",
  termsText: "",
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[8px] border border-[#e4e4e4] p-6 mb-4">
      <h2 className="text-[13px] font-semibold text-[#333] mb-4 pb-3 border-b border-[#e4e4e4]">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-[11px] font-medium text-[#333]/70 mb-1">{label}</label>
      {hint && <p className="text-[10px] text-[#333]/40 mb-1">{hint}</p>}
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full max-w-[400px] h-9 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#333] transition-colors"
    />
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-2 group"
    >
      <div className={`w-9 h-5 rounded-full relative transition-colors ${checked ? "bg-[#333]" : "bg-[#e4e4e4]"}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? "left-4" : "left-0.5"}`} />
      </div>
      <span className="text-[11px] text-[#333]/70 group-hover:text-[#333]">{label}</span>
      {checked ? <Eye className="w-3.5 h-3.5 text-[#333]/50" /> : <EyeOff className="w-3.5 h-3.5 text-[#333]/30" />}
    </button>
  );
}

function MediaUpload({
  label,
  hint,
  url,
  mediaType,
  onUrl,
  onFile,
}: {
  label: string;
  hint?: string;
  url: string;
  mediaType: string;
  onUrl: (url: string) => void;
  onFile: (dataUrl: string, type: "image" | "video") => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const reader = new FileReader();
    reader.onload = (ev) => {
      onFile(ev.target?.result as string, isVideo ? "video" : "image");
    };
    reader.readAsDataURL(file);
  };

  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-3 mb-2">
        <TextInput value={url} onChange={onUrl} placeholder="Paste URL or upload below" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 h-9 px-3 rounded-[6px] border border-[#e4e4e4] text-[11px] text-[#333]/70 hover:border-[#333] hover:text-[#333] transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload
        </button>
        <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
      </div>
      {url && (
        <div className="mt-2 rounded-[6px] overflow-hidden border border-[#e4e4e4] w-[200px] h-[100px]">
          {mediaType === "video" ? (
            <video src={url} className="w-full h-full object-cover" muted />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={label} className="w-full h-full object-cover" />
          )}
        </div>
      )}
    </Field>
  );
}

function parseTermsPreview(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("[TITLE]")) {
      return <p key={i} className="text-[12px] font-bold text-[#333] mt-3 mb-1">{line.replace("[TITLE]", "").trim()}</p>;
    }
    if (line.startsWith("[COPY]")) {
      return <p key={i} className="text-[11px] text-[#333]/70 leading-relaxed mb-1">{line.replace("[COPY]", "").trim()}</p>;
    }
    return <p key={i} className="text-[10px] text-[#333]/40">{line}</p>;
  });
}

export default function AdminUI() {
  const [s, setS] = useState<UISettings>(DEFAULT);
  const [saved, setSaved] = useState(false);
  const [termsFile, setTermsFile] = useState("");
  const termsRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setS(JSON.parse(stored) as UISettings); } catch { /* ignore */ }
    }
  }, []);

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const u = (patch: Partial<UISettings>) => setS((prev) => ({ ...prev, ...patch }));

  const handleTermsFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setTermsFile(text);
      u({ termsText: text });
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-bold text-[#333] tracking-[0.48px]">UI Settings</h1>
        <button
          onClick={save}
          className="h-9 px-5 rounded-[6px] bg-[#333] text-white text-[12px] font-medium hover:bg-[#111] transition-colors"
        >
          {saved ? "✓ Saved!" : "Save All"}
        </button>
      </div>

      {/* Contact URL */}
      <SectionCard title="Contact URL">
        <Field label="Mail icon URL (email or link)" hint="Used for the mail icon across the entire website">
          <TextInput value={s.contactUrl} onChange={(v) => u({ contactUrl: v })} placeholder="mailto:hello@solidfind.id" />
        </Field>
      </SectionCard>

      {/* IG Button */}
      <SectionCard title="Instagram Button">
        <Field label="Instagram URL">
          <TextInput value={s.igUrl} onChange={(v) => u({ igUrl: v })} placeholder="https://instagram.com/solidfind" />
        </Field>
        <Toggle
          checked={s.igVisible}
          onChange={() => u({ igVisible: !s.igVisible })}
          label={s.igVisible ? "Visible on website" : "Hidden on website"}
        />
      </SectionCard>

      {/* Ads */}
      <SectionCard title="Ad Spaces">
        <Field label="Vertical Ad" hint="Appears on the left panel of popups (150×500px)">
          <TextInput value={s.adVerticalUrl} onChange={(v) => u({ adVerticalUrl: v })} placeholder="https://..." />
        </Field>
        <Field label="Horizontal Ad" hint="Appears below search results — 700×150px (scales proportionally on mobile)">
          <TextInput value={s.adHorizontalUrl} onChange={(v) => u({ adHorizontalUrl: v })} placeholder="https://..." />
        </Field>
      </SectionCard>

      {/* Header */}
      <SectionCard title="Header Background">
        <MediaUpload
          label="Header media"
          hint="Photo or video — replaces the header background across the whole website. Recommended JPG size: 3840×1080px (supports up to 4K)"
          url={s.headerMediaUrl}
          mediaType={s.headerMediaType}
          onUrl={(v) => u({ headerMediaUrl: v })}
          onFile={(dataUrl, type) => u({ headerMediaUrl: dataUrl, headerMediaType: type })}
        />
      </SectionCard>

      {/* Footer */}
      <SectionCard title="Footer Background">
        <MediaUpload
          label="Footer media"
          hint="Photo or video — replaces the footer background across the whole website. Recommended JPG size: 3840×600px (supports up to 4K)"
          url={s.footerMediaUrl}
          mediaType={s.footerMediaType}
          onUrl={(v) => u({ footerMediaUrl: v })}
          onFile={(dataUrl, type) => u({ footerMediaUrl: dataUrl, footerMediaType: type })}
        />
      </SectionCard>

      {/* Terms & Conditions */}
      <SectionCard title="Terms & Conditions">
        <p className="text-[10px] text-[#333]/50 mb-3">
          Upload a <code className="bg-[#f5f5f5] px-1 rounded">.txt</code> file. Use{" "}
          <code className="bg-[#f5f5f5] px-1 rounded">[TITLE]</code> for section headings and{" "}
          <code className="bg-[#f5f5f5] px-1 rounded">[COPY]</code> for body text. These are auto-formatted on the website.
        </p>
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => termsRef.current?.click()}
            className="flex items-center gap-1.5 h-9 px-4 rounded-[6px] border border-[#e4e4e4] text-[11px] text-[#333]/70 hover:border-[#333] hover:text-[#333] transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload .txt file
          </button>
          <input ref={termsRef} type="file" accept=".txt" className="hidden" onChange={handleTermsFile} />
          {termsFile && <span className="text-[10px] text-green-600">✓ File loaded</span>}
        </div>

        <textarea
          value={s.termsText}
          onChange={(e) => u({ termsText: e.target.value })}
          placeholder={"[TITLE] Section 1\n[COPY] Content of the section goes here.\n\n[TITLE] Section 2\n[COPY] More content here."}
          rows={8}
          className="w-full max-w-[600px] px-3 py-2 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#333] transition-colors font-mono resize-y"
        />

        {s.termsText && (
          <div className="mt-4">
            <p className="text-[10px] font-semibold text-[#333]/50 mb-2 uppercase tracking-wider">Preview</p>
            <div className="max-w-[600px] bg-[#f8f8f8] rounded-[6px] p-4 border border-[#e4e4e4]">
              {parseTermsPreview(s.termsText)}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
