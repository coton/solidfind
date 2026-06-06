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

type LegalDocument = "terms" | "proTerms";
type LegalLanguage = "en" | "id";

const LEGAL_DOCUMENTS: Record<LegalDocument, {
  label: string;
  description: string;
  keys: Record<LegalLanguage, string>;
  defaults: Record<LegalLanguage, string>;
}> = {
  terms: {
    label: "Terms & Conditions",
    description: "Public platform terms, privacy notes and service conditions.",
    keys: {
      en: TERMS_TEXT_PLATFORM_SETTING_KEY,
      id: TERMS_ID_TEXT_PLATFORM_SETTING_KEY,
    },
    defaults: {
      en: DEFAULT_TERMS_TEXT,
      id: DEFAULT_TERMS_ID_TEXT,
    },
  },
  proTerms: {
    label: "Pro Terms of Service",
    description: "Terms shown for Pro subscriptions and paid visibility services.",
    keys: {
      en: PRO_TERMS_EN_PLATFORM_SETTING_KEY,
      id: PRO_TERMS_ID_PLATFORM_SETTING_KEY,
    },
    defaults: {
      en: DEFAULT_PRO_TERMS_EN_TEXT,
      id: DEFAULT_PRO_TERMS_ID_TEXT,
    },
  },
};

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

function LegalUploader({ documentId, language }: { documentId: LegalDocument; language: LegalLanguage }) {
  const config = LEGAL_DOCUMENTS[documentId];
  const title = `${config.label} ${language.toUpperCase()}`;
  const settingKey = config.keys[language];
  const defaultText = config.defaults[language];
  const savedValue = useQuery(api.platformSettings.get, { key: settingKey });
  const setPlatformSetting = useMutation(api.platformSettings.set);
  const [draft, setDraft] = useState("");
  const [fileLoaded, setFileLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const hydrated = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    hydrated.current = false;
  }, [settingKey]);

  useEffect(() => {
    if (hydrated.current || savedValue === undefined) return;
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(savedValue ?? defaultText);
  }, [defaultText, savedValue, settingKey]);

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

function ProGuidelinesEditor({ language }: { language: LegalLanguage }) {
  const suffix = language === "id" ? "Id" : "";
  const titleKey = `proGuidelinesTitle${suffix}`;
  const introKey = `proGuidelinesIntro${suffix}`;
  const itemsKey = `proGuidelinesItems${suffix}`;
  const titleValue = useQuery(api.platformSettings.get, { key: titleKey });
  const introValue = useQuery(api.platformSettings.get, { key: introKey });
  const itemsValue = useQuery(api.platformSettings.get, { key: itemsKey });
  const setPlatformSetting = useMutation(api.platformSettings.set);
  const [title, setTitle] = useState("");
  const [intro, setIntro] = useState("");
  const [items, setItems] = useState("");
  const [saved, setSaved] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    hydrated.current = false;
  }, [language]);

  useEffect(() => {
    if (hydrated.current || titleValue === undefined || introValue === undefined || itemsValue === undefined) return;
    hydrated.current = true;
    setTitle(titleValue ?? "");
    setIntro(introValue ?? "");
    setItems(itemsValue ?? "");
  }, [introValue, itemsValue, language, titleValue]);

  const save = async () => {
    await Promise.all([
      setPlatformSetting({ key: titleKey, value: title, updatedBy: "admin" }),
      setPlatformSetting({ key: introKey, value: intro, updatedBy: "admin" }),
      setPlatformSetting({ key: itemsKey, value: items, updatedBy: "admin" }),
    ]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SectionCard title={`Pro Guidelines visible copy ${language.toUpperCase()}`}>
      <p className="mb-3 text-[10px] text-[#333]/50">
        These fields control the public Pro Guidelines page. Leave fields empty to use the built-in WebKit defaults.
      </p>
      <label className="mb-3 block">
        <span className="mb-1 block text-[11px] font-medium text-[#333]/70">Hero title</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="More visibility.\nSame standards."
          className="h-9 w-full max-w-[700px] rounded-[6px] border border-[#e4e4e4] bg-white px-3 text-[12px] text-[#333] outline-none transition-colors focus:border-[#333]"
        />
      </label>
      <label className="mb-3 block">
        <span className="mb-1 block text-[11px] font-medium text-[#333]/70">Intro copy</span>
        <textarea
          value={intro}
          onChange={(event) => setIntro(event.target.value)}
          rows={3}
          className="w-full max-w-[700px] resize-y rounded-[6px] border border-[#e4e4e4] bg-white px-3 py-2 text-[12px] text-[#333] outline-none transition-colors focus:border-[#333]"
        />
      </label>
      <label className="mb-3 block">
        <span className="mb-1 block text-[11px] font-medium text-[#333]/70">Guideline items JSON</span>
        <p className="mb-1 text-[10px] text-[#333]/40">
          Format: [{`{"title":"Profile accuracy","body":"Keep your public details accurate."}`}]
        </p>
        <textarea
          value={items}
          onChange={(event) => setItems(event.target.value)}
          rows={8}
          className="w-full max-w-[700px] resize-y rounded-[6px] border border-[#e4e4e4] bg-white px-3 py-2 font-mono text-[11px] text-[#333] outline-none transition-colors focus:border-[#333]"
        />
      </label>
      <button type="button" onClick={save} className="h-9 rounded-[6px] bg-[#333] px-4 text-[11px] font-medium text-white hover:bg-[#111]">
        {saved ? "✓ Saved!" : "Save Pro Guidelines"}
      </button>
    </SectionCard>
  );
}

export default function AdminLegalPage() {
  const [documentId, setDocumentId] = useState<LegalDocument>("terms");
  const [language, setLanguage] = useState<LegalLanguage>("en");
  const activeDocument = LEGAL_DOCUMENTS[documentId];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-[#333] tracking-[0.48px]">Legal</h1>
        <p className="text-[11px] text-[#333]/50 mt-1">Manage public Terms & Conditions and PRO Terms of Services.</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex overflow-hidden rounded-full border border-[#333]/15 text-[11px] font-semibold tracking-[0.22px] text-[#333]/50">
          {(Object.keys(LEGAL_DOCUMENTS) as LegalDocument[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setDocumentId(item)}
              className={`px-4 py-2 transition-colors ${documentId === item ? "bg-[#333] text-white" : "hover:text-[#333]"}`}
            >
              {LEGAL_DOCUMENTS[item].label}
            </button>
          ))}
        </div>
        <div className="flex overflow-hidden rounded-full border border-[#333]/15 text-[11px] font-semibold tracking-[0.22px] text-[#333]/50">
          {(["en", "id"] as LegalLanguage[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setLanguage(item)}
              className={`px-4 py-2 transition-colors ${language === item ? "bg-[#333] text-white" : "hover:text-[#333]"}`}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-[11px] text-[#333]/50">{activeDocument.description}</p>
      <LegalUploader documentId={documentId} language={language} />
      <ProGuidelinesEditor language={language} />
    </div>
  );
}
