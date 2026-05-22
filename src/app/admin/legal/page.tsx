"use client";

import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  DEFAULT_PRO_TERMS_EN_TEXT,
  DEFAULT_PRO_TERMS_ID_TEXT,
  DEFAULT_TERMS_ID_TEXT,
  DEFAULT_TERMS_TEXT,
  PRO_TERMS_EN_PLATFORM_SETTING_KEY,
  PRO_TERMS_ID_PLATFORM_SETTING_KEY,
  TERMS_ID_TEXT_PLATFORM_SETTING_KEY,
  TERMS_TEXT_PLATFORM_SETTING_KEY,
} from "@/lib/terms-content.mjs";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[8px] border border-[#e4e4e4] p-6 mb-4">
      <h2 className="text-[13px] font-semibold text-[#333] mb-4 pb-3 border-b border-[#e4e4e4]">{title}</h2>
      {children}
    </div>
  );
}

function parseTermsPreview(text: string) {
  return text.split("\n").map((line, i) => {
    const bullet = line.trim().match(/^[-•▪*]\s+(.+)$/);
    if (line.startsWith("[TITLE]")) {
      return <p key={i} className="text-[12px] font-bold text-[#333] mt-3 mb-1">{line.replace("[TITLE]", "").trim()}</p>;
    }
    if (line.startsWith("[COPY]")) {
      return <p key={i} className="text-[11px] text-[#333]/70 leading-[15px] mb-1">{line.replace("[COPY]", "").trim()}</p>;
    }
    if (bullet) {
      return <p key={i} className="pl-8 text-[11px] text-[#333]/70 leading-[15px] mb-0.5">• {bullet[1].trim()}</p>;
    }
    return <p key={i} className="text-[10px] text-[#333]/40">{line}</p>;
  });
}

function LegalUploader({
  title,
  settingKey,
  defaultText,
}: {
  title: string;
  settingKey: string;
  defaultText: string;
}) {
  const savedValue = useQuery(api.platformSettings.get, { key: settingKey });
  const setPlatformSetting = useMutation(api.platformSettings.set);
  const [draft, setDraft] = useState("");
  const [fileLoaded, setFileLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const hydrated = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hydrated.current || savedValue === undefined) return;
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(savedValue ?? defaultText);
  }, [defaultText, savedValue]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setDraft((ev.target?.result as string) || "");
      setFileLoaded(true);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const save = async () => {
    await setPlatformSetting({ key: settingKey, value: draft || defaultText, updatedBy: "admin" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SectionCard title={title}>
      <p className="text-[10px] text-[#333]/50 mb-3">
        Upload a <code className="bg-[#f5f5f5] px-1 rounded">.txt</code> file. Use{" "}
        <code className="bg-[#f5f5f5] px-1 rounded">[TITLE]</code> for section headings and{" "}
        <code className="bg-[#f5f5f5] px-1 rounded">[COPY]</code> for body text.
      </p>
      <p className="text-[10px] text-[#f14110] mb-3">
        Upload loads a draft only. Click Save to publish it to the website.
      </p>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 h-9 px-4 rounded-[6px] border border-[#e4e4e4] text-[11px] text-[#333]/70 hover:border-[#333] hover:text-[#333] transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload .txt file
        </button>
        <button
          type="button"
          onClick={save}
          className="h-9 px-4 rounded-[6px] bg-[#333] text-white text-[11px] font-medium hover:bg-[#111] transition-colors"
        >
          {saved ? "✓ Saved!" : "Save"}
        </button>
        <input ref={fileRef} type="file" accept=".txt" className="hidden" onChange={handleFile} />
        {fileLoaded && <span className="text-[10px] text-green-600">✓ File loaded</span>}
      </div>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={"[TITLE] Section 1\n[COPY] Content of the section goes here.\n\n[TITLE] Section 2\n[COPY] More content here."}
        rows={8}
        className="w-full max-w-[700px] px-3 py-2 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#333] transition-colors font-mono resize-y"
      />

      {draft && (
        <div className="mt-4">
          <p className="text-[10px] font-semibold text-[#333]/50 mb-2 uppercase tracking-wider">Preview</p>
          <div className="max-w-[700px] bg-[#f8f8f8] rounded-[6px] p-4 border border-[#e4e4e4]">
            {parseTermsPreview(draft)}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

export default function AdminLegalPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-[#333] tracking-[0.48px]">Legal</h1>
        <p className="text-[11px] text-[#333]/50 mt-1">Manage public Terms & Conditions and PRO Terms of Services.</p>
      </div>

      <LegalUploader
        title="Terms & Conditions English"
        settingKey={TERMS_TEXT_PLATFORM_SETTING_KEY}
        defaultText={DEFAULT_TERMS_TEXT}
      />
      <LegalUploader
        title="Terms & Conditions Indonesian"
        settingKey={TERMS_ID_TEXT_PLATFORM_SETTING_KEY}
        defaultText={DEFAULT_TERMS_ID_TEXT}
      />
      <LegalUploader
        title="Pro Terms of Services English"
        settingKey={PRO_TERMS_EN_PLATFORM_SETTING_KEY}
        defaultText={DEFAULT_PRO_TERMS_EN_TEXT}
      />
      <LegalUploader
        title="Pro Terms of Services Indonesian"
        settingKey={PRO_TERMS_ID_PLATFORM_SETTING_KEY}
        defaultText={DEFAULT_PRO_TERMS_ID_TEXT}
      />
    </div>
  );
}
