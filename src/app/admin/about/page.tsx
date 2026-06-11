"use client";

import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { uploadFile as uploadFileToStorage } from "@/lib/uploadFile";
import { normalizeReviewedIndonesianText } from "@/lib/reviewed-indonesian-copy.mjs";

type AboutLanguage = "en" | "id";
type AboutFields = {
  tagline: string;
  description: string;
  individual: string;
  freeCompany: string;
  proCompany: string;
  contact: string;
};

const EMPTY_ABOUT_FIELDS: AboutFields = {
  tagline: "",
  description: "",
  individual: "",
  freeCompany: "",
  proCompany: "",
  contact: "",
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-[8px] border border-[#e4e4e4] bg-white p-6">
      <h2 className="mb-4 border-b border-[#e4e4e4] pb-3 text-[13px] font-semibold text-[#333]">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-[11px] font-medium text-[#333]/70">{label}</label>
      {hint && <p className="mb-1 text-[10px] text-[#333]/40">{hint}</p>}
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text" }: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-9 w-full rounded-[6px] border border-[#e4e4e4] bg-white px-3 text-[12px] text-[#333] outline-none transition-colors focus:border-[#333]"
    />
  );
}

function LanguagePair({
  label,
  en,
  id,
  onEn,
  onId,
  multiline = false,
  rows = 3,
  hint,
}: {
  label: string;
  en: string;
  id: string;
  onEn: (value: string) => void;
  onId: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  hint?: string;
}) {
  const controlClass = "w-full rounded-[6px] border border-[#e4e4e4] bg-white px-3 py-2 text-[12px] text-[#333] outline-none transition-colors focus:border-[#333]";
  return (
    <Field label={label} hint={hint}>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[#333]/40">English</p>
          {multiline ? (
            <textarea value={en} onChange={(event) => onEn(event.target.value)} rows={rows} className={`${controlClass} resize-y`} />
          ) : (
            <TextInput value={en} onChange={onEn} />
          )}
        </div>
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[#333]/40">Indonesian</p>
          {multiline ? (
            <textarea value={id} onChange={(event) => onId(event.target.value)} rows={rows} placeholder="Falls back to English if empty" className={`${controlClass} resize-y`} />
          ) : (
            <TextInput value={id} onChange={onId} placeholder="Falls back to English if empty" />
          )}
        </div>
      </div>
    </Field>
  );
}

export default function AdminAboutPage() {
  const convex = useConvex();
  const setPlatformSetting = useMutation(api.platformSettings.set);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const aboutCardTitle = useQuery(api.platformSettings.get, { key: "aboutCardTitle" });
  const aboutCardTitleId = useQuery(api.platformSettings.get, { key: "aboutCardTitleId" });
  const aboutCardDescription = useQuery(api.platformSettings.get, { key: "aboutCardDescription" });
  const aboutCardDescriptionId = useQuery(api.platformSettings.get, { key: "aboutCardDescriptionId" });
  const aboutCardImage = useQuery(api.platformSettings.get, { key: "aboutCardImageUrl" });
  const aboutProfilePicture = useQuery(api.platformSettings.get, { key: "aboutProfilePictureUrl" });
  const aboutEmail = useQuery(api.platformSettings.get, { key: "aboutPageEmail" });

  const aboutTagline = useQuery(api.platformSettings.get, { key: "aboutPageTagline" });
  const aboutDescription = useQuery(api.platformSettings.get, { key: "aboutPageDescription" });
  const aboutIndividual = useQuery(api.platformSettings.get, { key: "aboutPageIndividual" });
  const aboutFreeCompany = useQuery(api.platformSettings.get, { key: "aboutPageFreeCompany" });
  const aboutProCompany = useQuery(api.platformSettings.get, { key: "aboutPageProCompany" });
  const aboutContact = useQuery(api.platformSettings.get, { key: "aboutPageContact" });
  const aboutTaglineId = useQuery(api.platformSettings.get, { key: "aboutPageTaglineId" });
  const aboutDescriptionId = useQuery(api.platformSettings.get, { key: "aboutPageDescriptionId" });
  const aboutIndividualId = useQuery(api.platformSettings.get, { key: "aboutPageIndividualId" });
  const aboutFreeCompanyId = useQuery(api.platformSettings.get, { key: "aboutPageFreeCompanyId" });
  const aboutProCompanyId = useQuery(api.platformSettings.get, { key: "aboutPageProCompanyId" });
  const aboutContactId = useQuery(api.platformSettings.get, { key: "aboutPageContactId" });

  const [card, setCard] = useState({ title: "", titleId: "", description: "", descriptionId: "", imageUrl: "" });
  const [page, setPage] = useState<{ en: AboutFields; id: AboutFields; email: string; headerImageUrl: string }>({
    en: EMPTY_ABOUT_FIELDS,
    id: EMPTY_ABOUT_FIELDS,
    email: "",
    headerImageUrl: "",
  });
  const [uploadingTarget, setUploadingTarget] = useState<"card" | "header" | null>(null);
  const [saved, setSaved] = useState(false);
  const loaded = useRef(false);
  const cardInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (loaded.current) return;
    const values = [
      aboutCardTitle,
      aboutCardTitleId,
      aboutCardDescription,
      aboutCardDescriptionId,
      aboutCardImage,
      aboutProfilePicture,
      aboutEmail,
      aboutTagline,
      aboutDescription,
      aboutIndividual,
      aboutFreeCompany,
      aboutProCompany,
      aboutContact,
      aboutTaglineId,
      aboutDescriptionId,
      aboutIndividualId,
      aboutFreeCompanyId,
      aboutProCompanyId,
      aboutContactId,
    ];
    if (values.some((value) => value === undefined)) return;

    loaded.current = true;
    setCard({
      title: aboutCardTitle ?? "SolidFind.id",
      titleId: aboutCardTitleId ?? "",
      description: aboutCardDescription ?? "",
      descriptionId: aboutCardDescriptionId ?? "",
      imageUrl: aboutCardImage ?? "",
    });
    setPage({
      en: {
        tagline: aboutTagline ?? "",
        description: aboutDescription ?? "",
        individual: aboutIndividual ?? "",
        freeCompany: aboutFreeCompany ?? "",
        proCompany: aboutProCompany ?? "",
        contact: aboutContact ?? "",
      },
      id: {
        tagline: normalizeReviewedIndonesianText(aboutTaglineId ?? ""),
        description: normalizeReviewedIndonesianText(aboutDescriptionId ?? ""),
        individual: normalizeReviewedIndonesianText(aboutIndividualId ?? ""),
        freeCompany: normalizeReviewedIndonesianText(aboutFreeCompanyId ?? ""),
        proCompany: normalizeReviewedIndonesianText(aboutProCompanyId ?? ""),
        contact: normalizeReviewedIndonesianText(aboutContactId ?? ""),
      },
      email: aboutEmail ?? "",
      headerImageUrl: aboutProfilePicture ?? "",
    });
  }, [
    aboutCardTitle,
    aboutCardTitleId,
    aboutCardDescription,
    aboutCardDescriptionId,
    aboutCardImage,
    aboutProfilePicture,
    aboutEmail,
    aboutTagline,
    aboutDescription,
    aboutIndividual,
    aboutFreeCompany,
    aboutProCompany,
    aboutContact,
    aboutTaglineId,
    aboutDescriptionId,
    aboutIndividualId,
    aboutFreeCompanyId,
    aboutProCompanyId,
    aboutContactId,
  ]);

  const updatePageField = (language: AboutLanguage, field: keyof AboutFields, value: string) => {
    setPage((current) => ({
      ...current,
      [language]: { ...current[language], [field]: value },
    }));
  };

  const uploadImage = async (file: File) => {
    const uploadUrl = await generateUploadUrl();
    const storageId = await uploadFileToStorage(file, uploadUrl);
    const publicUrl = await convex.query(api.files.getUrl, { storageId: storageId as Id<"_storage"> });
    if (!publicUrl) throw new Error("Upload completed but no public URL was returned.");
    return publicUrl;
  };

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>, target: "card" | "header") => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploadingTarget(target);
    try {
      const url = await uploadImage(file);
      if (target === "card") {
        setCard((current) => ({ ...current, imageUrl: url }));
      } else {
        setPage((current) => ({ ...current, headerImageUrl: url }));
      }
    } finally {
      setUploadingTarget(null);
    }
  };

  const save = async () => {
    const entries: [string, string][] = [
      ["aboutCardTitle", card.title],
      ["aboutCardTitleId", card.titleId],
      ["aboutCardDescription", card.description],
      ["aboutCardDescriptionId", card.descriptionId],
      ["aboutCardImageUrl", card.imageUrl],
      ["aboutProfilePictureUrl", page.headerImageUrl],
      ["aboutPageTagline", page.en.tagline],
      ["aboutPageDescription", page.en.description],
      ["aboutPageIndividual", page.en.individual],
      ["aboutPageFreeCompany", page.en.freeCompany],
      ["aboutPageProCompany", page.en.proCompany],
      ["aboutPageContact", page.en.contact],
      ["aboutPageTaglineId", page.id.tagline],
      ["aboutPageDescriptionId", page.id.description],
      ["aboutPageIndividualId", page.id.individual],
      ["aboutPageFreeCompanyId", page.id.freeCompany],
      ["aboutPageProCompanyId", page.id.proCompany],
      ["aboutPageContactId", page.id.contact],
      ["aboutPageEmail", page.email],
    ];

    for (const [key, value] of entries) {
      await setPlatformSetting({ key, value, updatedBy: "admin" });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-[0.48px] text-[#333]">About</h1>
          <p className="mt-1 text-[11px] text-[#333]/50">Manage About card and public About page content.</p>
        </div>
        <button type="button" onClick={save} className="h-9 rounded-[6px] bg-[#333] px-5 text-[12px] font-medium text-white hover:bg-[#222]">
          {saved ? "✓ Saved" : "Save About"}
        </button>
      </div>

      <SectionCard title="Card details">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="h-20 w-20 overflow-hidden rounded-[8px] border border-[#e4e4e4] bg-[#f14110]">
            {card.imageUrl ? <img src={card.imageUrl} alt="" className="h-full w-full object-cover" /> : null}
          </div>
          <button type="button" onClick={() => cardInputRef.current?.click()} className="inline-flex h-9 items-center gap-2 rounded-[6px] border border-[#e4e4e4] px-4 text-[11px] font-medium text-[#333] hover:border-[#333]">
            <Upload className="h-3.5 w-3.5" />
            {uploadingTarget === "card" ? "Uploading..." : "Upload card image"}
          </button>
          <input ref={cardInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handleFile(event, "card")} />
        </div>
        <LanguagePair label="Card title" en={card.title} id={card.titleId} onEn={(value) => setCard((current) => ({ ...current, title: value }))} onId={(value) => setCard((current) => ({ ...current, titleId: value }))} />
        <LanguagePair label="Card description" en={card.description} id={card.descriptionId} onEn={(value) => setCard((current) => ({ ...current, description: value }))} onId={(value) => setCard((current) => ({ ...current, descriptionId: value }))} multiline rows={3} />
      </SectionCard>

      <SectionCard title="About page content">
        <Field label="Header image" hint="Used on the About page profile/visual area.">
          <div className="mb-3 h-32 max-w-[360px] overflow-hidden rounded-[8px] border border-[#e4e4e4] bg-[#f8f8f8]">
            {page.headerImageUrl ? <img src={page.headerImageUrl} alt="" className="h-full w-full object-cover" /> : null}
          </div>
          <button type="button" onClick={() => headerInputRef.current?.click()} className="inline-flex h-9 items-center gap-2 rounded-[6px] border border-[#e4e4e4] px-4 text-[11px] font-medium text-[#333] hover:border-[#333]">
            <Upload className="h-3.5 w-3.5" />
            {uploadingTarget === "header" ? "Uploading..." : "Upload header image"}
          </button>
          <input ref={headerInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handleFile(event, "header")} />
        </Field>
        <LanguagePair label="Tagline" en={page.en.tagline} id={page.id.tagline} onEn={(value) => updatePageField("en", "tagline", value)} onId={(value) => updatePageField("id", "tagline", value)} />
        <LanguagePair label="Description" en={page.en.description} id={page.id.description} onEn={(value) => updatePageField("en", "description", value)} onId={(value) => updatePageField("id", "description", value)} multiline rows={5} hint="Use line breaks for paragraphs. Wrap text in **bold** for emphasized copy." />
        <LanguagePair label="Individual account" en={page.en.individual} id={page.id.individual} onEn={(value) => updatePageField("en", "individual", value)} onId={(value) => updatePageField("id", "individual", value)} multiline rows={3} />
        <LanguagePair label="Company account" en={page.en.freeCompany} id={page.id.freeCompany} onEn={(value) => updatePageField("en", "freeCompany", value)} onId={(value) => updatePageField("id", "freeCompany", value)} multiline rows={3} />
        <LanguagePair label="Pro company account" en={page.en.proCompany} id={page.id.proCompany} onEn={(value) => updatePageField("en", "proCompany", value)} onId={(value) => updatePageField("id", "proCompany", value)} multiline rows={3} />
        <LanguagePair label="Contact text" en={page.en.contact} id={page.id.contact} onEn={(value) => updatePageField("en", "contact", value)} onId={(value) => updatePageField("id", "contact", value)} />
        <Field label="Contact email">
          <TextInput value={page.email} onChange={(value) => setPage((current) => ({ ...current, email: value }))} placeholder="hello@solidfind.id" />
        </Field>
      </SectionCard>
    </div>
  );
}
