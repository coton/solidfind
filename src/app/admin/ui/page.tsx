"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Upload } from "lucide-react";
import { useQuery, useMutation, useConvex } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { uploadFile as uploadFileToStorage } from "@/lib/uploadFile";
import {
  FOOTER_MEDIA_PLATFORM_SETTING_KEY,
  HEADER_MEDIA_PLATFORM_SETTING_KEY,
  parseMediaSetting,
} from "@/lib/platform-settings.mjs";
import { TERMS_TEXT_PLATFORM_SETTING_KEY } from "@/lib/terms-content.mjs";

interface UISettings {
  headerMediaUrl: string;
  headerMediaType: "image" | "video" | "";
  footerMediaUrl: string;
  footerMediaType: "image" | "video" | "";
  termsText: string;
}

const DEFAULT: UISettings = {
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
  accept = "image/*,video/*",
}: {
  label: string;
  hint?: string;
  url: string;
  mediaType: string;
  onUrl: (url: string) => void;
  onFile: (payload: { file: File; previewUrl: string; type: "image" | "video" }) => void | Promise<void>;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const previewUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve((ev.target?.result as string) || "");
      reader.onerror = () => reject(reader.error ?? new Error("Failed to read media file"));
      reader.readAsDataURL(file);
    });
    await onFile({ file, previewUrl, type: isVideo ? "video" : "image" });
    e.target.value = "";
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
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFile} />
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
  const convex = useConvex();
  const [termsFile, setTermsFile] = useState("");
  const termsRef = useRef<HTMLInputElement>(null);
  const [saveAllUiSaved, setSaveAllUiSaved] = useState(false);
  const termsTextValue = useQuery(api.platformSettings.get, { key: TERMS_TEXT_PLATFORM_SETTING_KEY });
  const [termsSaved, setTermsSaved] = useState(false);
  const headerMediaValue = useQuery(api.platformSettings.get, { key: HEADER_MEDIA_PLATFORM_SETTING_KEY });
  const footerMediaValue = useQuery(api.platformSettings.get, { key: FOOTER_MEDIA_PLATFORM_SETTING_KEY });
  const parsedHeaderMedia = parseMediaSetting(headerMediaValue, { url: "", type: "image" });
  const parsedFooterMedia = parseMediaSetting(footerMediaValue, { url: "", type: "image" });
  const effectiveHeaderMediaUrl = s.headerMediaUrl || parsedHeaderMedia.url;
  const effectiveHeaderMediaType = (s.headerMediaType || parsedHeaderMedia.type) as "image" | "video";
  const effectiveFooterMediaUrl = s.footerMediaUrl || parsedFooterMedia.url;
  const effectiveFooterMediaType = (s.footerMediaType || parsedFooterMedia.type) as "image" | "video";
  const [headerMediaSaved, setHeaderMediaSaved] = useState(false);
  const [footerMediaSaved, setFooterMediaSaved] = useState(false);

  // New User image (Convex-backed)
  const newUserImageValue = useQuery(api.platformSettings.get, { key: "newUserImage" });
  const [newUserImageDraftUrl, setNewUserImageDraftUrl] = useState("");
  const [newUserImageHasDraft, setNewUserImageHasDraft] = useState(false);
  const [newUserImageSaved, setNewUserImageSaved] = useState(false);

  // About profile picture (Convex-backed)
  const aboutProfilePictureUrlValue = useQuery(api.platformSettings.get, { key: "aboutProfilePictureUrl" });
  const parsedAboutProfilePicture = parseMediaSetting(aboutProfilePictureUrlValue, { url: "", type: "image" });
  const [aboutProfilePictureDraft, setAboutProfilePictureDraft] = useState<{ url: string; type: "image" | "video" }>({ url: "", type: "image" });
  const [aboutProfilePictureHasDraft, setAboutProfilePictureHasDraft] = useState(false);
  const [aboutProfilePictureSaved, setAboutProfilePictureSaved] = useState(false);
  const [aboutProfilePictureUploading, setAboutProfilePictureUploading] = useState(false);
  const [aboutProfilePictureUploadError, setAboutProfilePictureUploadError] = useState("");
  const effectiveAboutProfilePictureUrl = aboutProfilePictureHasDraft ? aboutProfilePictureDraft.url : parsedAboutProfilePicture.url;
  const effectiveAboutProfilePictureType = aboutProfilePictureHasDraft ? aboutProfilePictureDraft.type : parsedAboutProfilePicture.type;

  // About Card (Convex-backed)
  const aboutCardValue = useQuery(api.platformSettings.get, { key: "aboutCardDescription" });
  const setPlatformSetting = useMutation(api.platformSettings.set);
  const deletePlatformSettingByKey = useMutation(api.platformSettings.deleteByKey);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const [aboutText, setAboutText] = useState("");
  const [aboutSaved, setAboutSaved] = useState(false);

  // Ad Spaces (Convex-backed)
  const adVerticalValue = useQuery(api.platformSettings.get, { key: "adVertical" });
  const adHorizontalValue = useQuery(api.platformSettings.get, { key: "adHorizontal" });
  const [adVerticalUrl, setAdVerticalUrl] = useState("");
  const [adVerticalMediaType, setAdVerticalMediaType] = useState<"image" | "video" | "">("");
  const [adHorizontalUrl, setAdHorizontalUrl] = useState("");
  const [adHorizontalMediaType, setAdHorizontalMediaType] = useState<"image" | "video" | "">("");
  const [adSpacesSaved, setAdSpacesSaved] = useState(false);
  const [adVerticalUploading, setAdVerticalUploading] = useState(false);
  const [adHorizontalUploading, setAdHorizontalUploading] = useState(false);
  const [adSpacesUploadError, setAdSpacesUploadError] = useState("");
  const adSpacesLoaded = useRef(false);

  const parsedNewUserImage = (() => {
    if (!newUserImageValue) return { url: "", type: "image" as const };
    try {
      const parsed = JSON.parse(newUserImageValue);
      return {
        url: parsed.url ?? "",
        type: (parsed.type ?? "image") as "image" | "video",
      };
    } catch {
      return { url: newUserImageValue, type: "image" as const };
    }
  })();

  const newUserImageUrl = newUserImageHasDraft ? newUserImageDraftUrl : parsedNewUserImage.url;
  const newUserImageType = "image" as const;
  const effectiveTermsText = s.termsText || termsTextValue || "";

  useEffect(() => {
    if (adSpacesLoaded.current) return;
    if (adVerticalValue === undefined || adHorizontalValue === undefined) return;

    adSpacesLoaded.current = true;
    const vertical = parseMediaSetting(adVerticalValue, { url: "", type: "image" });
    const horizontal = parseMediaSetting(adHorizontalValue, { url: "", type: "image" });

    setAdVerticalUrl(vertical.url);
    setAdVerticalMediaType(vertical.url ? vertical.type : "");
    setAdHorizontalUrl(horizontal.url);
    setAdHorizontalMediaType(horizontal.url ? horizontal.type : "");
  }, [adVerticalValue, adHorizontalValue]);

  // Site-wide links (Convex-backed)
  const igUrlValue = useQuery(api.platformSettings.get, { key: "ig_url" });
  const igVisibleValue = useQuery(api.platformSettings.get, { key: "ig_visible" });
  const contactUrlValue = useQuery(api.platformSettings.get, { key: "contact_url" });
  const [igUrl, setIgUrl] = useState("");
  const [igVisible, setIgVisible] = useState(true);
  const [contactUrl, setContactUrl] = useState("");
  const [linksSaved, setLinksSaved] = useState(false);
  const linksLoaded = useRef(false);

  useEffect(() => {
    if (linksLoaded.current) return;
    if (igUrlValue !== undefined) {
      linksLoaded.current = true;
      setIgUrl(igUrlValue ?? "");
      setIgVisible(igVisibleValue !== "false");
      setContactUrl(contactUrlValue ?? "");
    }
  }, [igUrlValue, igVisibleValue, contactUrlValue]);

  // About Page content (Convex-backed)
  const aboutTagline = useQuery(api.platformSettings.get, { key: "aboutPageTagline" });
  const aboutDescription = useQuery(api.platformSettings.get, { key: "aboutPageDescription" });
  const aboutIndividual = useQuery(api.platformSettings.get, { key: "aboutPageIndividual" });
  const aboutFreeCompany = useQuery(api.platformSettings.get, { key: "aboutPageFreeCompany" });
  const aboutProCompany = useQuery(api.platformSettings.get, { key: "aboutPageProCompany" });
  const aboutContact = useQuery(api.platformSettings.get, { key: "aboutPageContact" });
  const aboutEmail = useQuery(api.platformSettings.get, { key: "aboutPageEmail" });

  const [aboutPageFields, setAboutPageFields] = useState({
    tagline: "",
    description: "",
    individual: "",
    freeCompany: "",
    proCompany: "",
    contact: "",
    email: "",
  });
  const [aboutPageSaved, setAboutPageSaved] = useState(false);
  const aboutPageLoaded = useRef(false);

  useEffect(() => {
    if (aboutPageLoaded.current) return;
    if (aboutTagline !== undefined) {
      aboutPageLoaded.current = true;
      setAboutPageFields({
        tagline: aboutTagline ?? "",
        description: aboutDescription ?? "",
        individual: aboutIndividual ?? "",
        freeCompany: aboutFreeCompany ?? "",
        proCompany: aboutProCompany ?? "",
        contact: aboutContact ?? "",
        email: aboutEmail ?? "",
      });
    }
  }, [aboutTagline, aboutDescription, aboutIndividual, aboutFreeCompany, aboutProCompany, aboutContact, aboutEmail]);

  useEffect(() => {
    if (aboutCardValue !== undefined && aboutCardValue !== null) {
      setAboutText(aboutCardValue);
    }
  }, [aboutCardValue]);

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

  const flashSaved = (setter: (value: boolean) => void) => {
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const uploadAdminMediaAsset = async (file: File) => {
    const uploadUrl = await generateUploadUrl();
    const storageId = await uploadFileToStorage(file, uploadUrl);
    const publicUrl = await convex.query(api.files.getUrl, { storageId: storageId as Id<"_storage"> });

    if (!publicUrl) {
      throw new Error("Upload completed but no public URL was returned.");
    }

    return publicUrl;
  };

  const saveAboutText = async () => {
    await setPlatformSetting({ key: "aboutCardDescription", value: aboutText, updatedBy: "admin" });
    flashSaved(setAboutSaved);
  };

  const saveAboutPage = async () => {
    const entries: [string, string][] = [
      ["aboutPageTagline", aboutPageFields.tagline],
      ["aboutPageDescription", aboutPageFields.description],
      ["aboutPageIndividual", aboutPageFields.individual],
      ["aboutPageFreeCompany", aboutPageFields.freeCompany],
      ["aboutPageProCompany", aboutPageFields.proCompany],
      ["aboutPageContact", aboutPageFields.contact],
      ["aboutPageEmail", aboutPageFields.email],
    ];

    for (const [key, value] of entries) {
      await setPlatformSetting({ key, value, updatedBy: "admin" });
    }

    flashSaved(setAboutPageSaved);
  };

  const saveLinks = async () => {
    await Promise.all([
      setPlatformSetting({ key: "ig_url", value: igUrl, updatedBy: "admin" }),
      setPlatformSetting({ key: "ig_visible", value: igVisible ? "true" : "false", updatedBy: "admin" }),
      setPlatformSetting({ key: "contact_url", value: contactUrl, updatedBy: "admin" }),
    ]);

    flashSaved(setLinksSaved);
  };

  const saveNewUserImage = async () => {
    await setPlatformSetting({ key: "newUserImage", value: JSON.stringify({ url: newUserImageUrl, type: "image" }), updatedBy: "admin" });
    setNewUserImageHasDraft(false);
    setNewUserImageDraftUrl("");
    flashSaved(setNewUserImageSaved);
  };

  const saveAdSpaces = async () => {
    if (adVerticalUploading || adHorizontalUploading) return;

    await Promise.all([
      setPlatformSetting({ key: "adVertical", value: JSON.stringify({ url: adVerticalUrl, type: adVerticalMediaType }), updatedBy: "admin" }),
      setPlatformSetting({ key: "adHorizontal", value: JSON.stringify({ url: adHorizontalUrl, type: adHorizontalMediaType }), updatedBy: "admin" }),
    ]);

    flashSaved(setAdSpacesSaved);
  };

  const handleAdMediaFile = async (placement: "vertical" | "horizontal", file: File, type: "image" | "video") => {
    setAdSpacesUploadError("");
    const setUploading = placement === "vertical" ? setAdVerticalUploading : setAdHorizontalUploading;
    setUploading(true);

    try {
      const uploadedUrl = await uploadAdminMediaAsset(file);

      if (placement === "vertical") {
        setAdVerticalUrl(uploadedUrl);
        setAdVerticalMediaType(type);
      } else {
        setAdHorizontalUrl(uploadedUrl);
        setAdHorizontalMediaType(type);
      }
    } catch (error) {
      setAdSpacesUploadError(error instanceof Error ? error.message : "Failed to upload ad media.");
    } finally {
      setUploading(false);
    }
  };

  const saveHeaderMedia = async () => {
    await setPlatformSetting({ key: HEADER_MEDIA_PLATFORM_SETTING_KEY, value: JSON.stringify({ url: effectiveHeaderMediaUrl, type: effectiveHeaderMediaType }), updatedBy: "admin" });
    u({ headerMediaUrl: "", headerMediaType: "" });
    flashSaved(setHeaderMediaSaved);
  };

  const saveFooterMedia = async () => {
    await setPlatformSetting({ key: FOOTER_MEDIA_PLATFORM_SETTING_KEY, value: JSON.stringify({ url: effectiveFooterMediaUrl, type: effectiveFooterMediaType }), updatedBy: "admin" });
    u({ footerMediaUrl: "", footerMediaType: "" });
    flashSaved(setFooterMediaSaved);
  };

  const saveAboutProfilePicture = async () => {
    await setPlatformSetting({
      key: "aboutProfilePictureUrl",
      value: JSON.stringify({ url: effectiveAboutProfilePictureUrl, type: effectiveAboutProfilePictureType }),
      updatedBy: "admin",
    });
    setAboutProfilePictureDraft({ url: "", type: "image" });
    setAboutProfilePictureHasDraft(false);
    flashSaved(setAboutProfilePictureSaved);
  };

  const clearAboutProfilePicture = async () => {
    await deletePlatformSettingByKey({ key: "aboutProfilePictureUrl" });
    setAboutProfilePictureDraft({ url: "", type: "image" });
    setAboutProfilePictureHasDraft(false);
    flashSaved(setAboutProfilePictureSaved);
  };

  const saveTermsContent = async () => {
    await setPlatformSetting({ key: TERMS_TEXT_PLATFORM_SETTING_KEY, value: effectiveTermsText, updatedBy: "admin" });
    flashSaved(setTermsSaved);
  };

  const saveAllUiSettings = async () => {
    if (adVerticalUploading || adHorizontalUploading) return;

    const pendingSaves = [
      saveAboutText(),
      saveAboutPage(),
      saveLinks(),
      saveAdSpaces(),
      saveTermsContent(),
    ];

    if (newUserImageHasDraft) {
      pendingSaves.push(saveNewUserImage());
    }

    if (s.headerMediaUrl || s.headerMediaType) {
      pendingSaves.push(saveHeaderMedia());
    }

    if (s.footerMediaUrl || s.footerMediaType) {
      pendingSaves.push(saveFooterMedia());
    }

    if (aboutProfilePictureHasDraft) {
      pendingSaves.push(saveAboutProfilePicture());
    }

    await Promise.all(pendingSaves);

    flashSaved(setSaveAllUiSaved);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-[24px] font-bold text-[#333] tracking-[0.48px]">UI Settings</h1>
          <p className="text-[11px] text-[#333]/50 mt-1">Each section saves directly to website-facing platform settings.</p>
        </div>
        <button
          type="button"
          onClick={saveAllUiSettings}
          disabled={adVerticalUploading || adHorizontalUploading}
          className="h-9 px-4 rounded-[6px] bg-[#333] text-white text-[11px] font-medium hover:bg-[#111] transition-colors disabled:bg-[#333]/25"
        >
          {adVerticalUploading || adHorizontalUploading ? "Uploading ad…" : saveAllUiSaved ? "✓ All UI Settings Saved!" : "Save All UI Settings"}
        </button>
      </div>

      {/* About Card */}
      <SectionCard title="About Card">
        <Field label="Description text" hint="Shown on the WelcomeCard on the homepage. Falls back to default if empty.">
          <textarea
            value={aboutText}
            onChange={(e) => setAboutText(e.target.value)}
            placeholder="We help you find trusted professionals to build, renovate, design and shape the places you live in."
            rows={3}
            className="w-full max-w-[400px] px-3 py-2 bg-white border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#333] transition-colors resize-y"
          />
        </Field>
        <button
          type="button"
          onClick={saveAboutText}
          className="h-8 px-4 rounded-[6px] bg-[#333] text-white text-[11px] font-medium hover:bg-[#111] transition-colors"
        >
          {aboutSaved ? "✓ Saved!" : "Save About Text"}
        </button>
      </SectionCard>

      {/* About Page Content */}
      <SectionCard title="About Page Content">
        <Field label="Tagline" hint="Bold text at the top of the about page">
          <TextInput
            value={aboutPageFields.tagline}
            onChange={(v) => setAboutPageFields((p) => ({ ...p, tagline: v }))}
            placeholder="A clearer way to build and live in Indonesia."
          />
        </Field>
        <Field label="Description" hint="Main paragraph below the tagline. Use line breaks for multiple paragraphs. Wrap text in **bold** to emphasize it on the public About page.">
          <textarea
            value={aboutPageFields.description}
            onChange={(e) => setAboutPageFields((p) => ({ ...p, description: e.target.value }))}
            placeholder="Building, renovating, or choosing a home is one of the most important decisions people make..."
            rows={5}
            className="w-full max-w-[500px] px-3 py-2 bg-white border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#333] transition-colors resize-y"
          />
        </Field>
        <Field label="Individual Account description">
          <textarea
            value={aboutPageFields.individual}
            onChange={(e) => setAboutPageFields((p) => ({ ...p, individual: e.target.value }))}
            placeholder="For property owners & renters — browse listings, bookmark companies..."
            rows={3}
            className="w-full max-w-[500px] px-3 py-2 bg-white border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#333] transition-colors resize-y"
          />
        </Field>
        <Field label="Company Account description">
          <textarea
            value={aboutPageFields.freeCompany}
            onChange={(e) => setAboutPageFields((p) => ({ ...p, freeCompany: e.target.value }))}
            placeholder="For construction & renovation professionals — create your company profile..."
            rows={3}
            className="w-full max-w-[500px] px-3 py-2 bg-white border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#333] transition-colors resize-y"
          />
        </Field>
        <Field label="Pro Company Account description">
          <textarea
            value={aboutPageFields.proCompany}
            onChange={(e) => setAboutPageFields((p) => ({ ...p, proCompany: e.target.value }))}
            placeholder="Everything in Free, plus: top search ranking, AI search optimization..."
            rows={3}
            className="w-full max-w-[500px] px-3 py-2 bg-white border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#333] transition-colors resize-y"
          />
        </Field>
        <Field label="Contact text" hint="Text above the email link in the contact section">
          <TextInput
            value={aboutPageFields.contact}
            onChange={(v) => setAboutPageFields((p) => ({ ...p, contact: v }))}
            placeholder="Questions, feedback, or partnership inquiries?"
          />
        </Field>
        <Field label="Contact email">
          <TextInput
            value={aboutPageFields.email}
            onChange={(v) => setAboutPageFields((p) => ({ ...p, email: v }))}
            placeholder="hello@solidfind.id"
          />
        </Field>
        <button
          type="button"
          onClick={saveAboutPage}
          className="h-8 px-4 rounded-[6px] bg-[#333] text-white text-[11px] font-medium hover:bg-[#111] transition-colors"
        >
          {aboutPageSaved ? "✓ Saved!" : "Save About Page"}
        </button>
      </SectionCard>

      {/* Contact URL */}
      <SectionCard title="Contact URL">
        <Field label="Mail icon URL (email or link)" hint="Used for the mail icon in header & footer (e.g. mailto:hello@solidfind.id)">
          <TextInput value={contactUrl} onChange={setContactUrl} placeholder="mailto:hello@solidfind.id" />
        </Field>
      </SectionCard>

      {/* IG Button */}
      <SectionCard title="Instagram Button">
        <Field label="Instagram URL" hint="Used for the Instagram icon in header & footer">
          <TextInput value={igUrl} onChange={setIgUrl} placeholder="https://instagram.com/solidfind" />
        </Field>
        <Toggle
          checked={igVisible}
          onChange={() => setIgVisible(!igVisible)}
          label={igVisible ? "Visible on website" : "Hidden on website"}
        />
      </SectionCard>

      {/* Save Links */}
      <div className="mb-4">
        <button
          type="button"
          onClick={saveLinks}
          className="h-8 px-4 rounded-[6px] bg-[#333] text-white text-[11px] font-medium hover:bg-[#111] transition-colors"
        >
          {linksSaved ? "✓ Links Saved!" : "Save Contact & Instagram"}
        </button>
      </div>

      {/* New User Image */}
      <SectionCard title="New User Image">
        <Field
          label="New User image"
          hint="Shown on the account type selection page for new users. Use a wide desktop/mobile-safe image. Recommended ratio: 386:96 (about 4.02:1), for example 1608×400px or larger. Keep the important content centered because the image can crop slightly on smaller screens."
        >
          <MediaUpload
            label="New User image"
            url={newUserImageUrl}
            mediaType={newUserImageType}
            onUrl={(v) => {
              setNewUserImageHasDraft(true);
              setNewUserImageDraftUrl(v);
            }}
            onFile={({ previewUrl }) => {
              setNewUserImageHasDraft(true);
              setNewUserImageDraftUrl(previewUrl);
            }}
            accept="image/*"
          />
        </Field>
        <div className="mt-2">
          <button
            type="button"
            onClick={saveNewUserImage}
            className="h-8 px-4 rounded-[6px] bg-[#333] text-white text-[11px] font-medium hover:bg-[#111] transition-colors"
          >
            {newUserImageSaved ? "✓ Saved!" : "Save New User Image"}
          </button>
        </div>
      </SectionCard>

      {/* Ads */}
      <SectionCard title="Ad Spaces">
        <Field label="Vertical Ad" hint="Appears on the left panel of popups (150×500px)">
          <MediaUpload
            label="Vertical Ad Image"
            url={adVerticalUrl}
            mediaType={adVerticalMediaType}
            onUrl={(v) => {
              setAdSpacesUploadError("");
              setAdVerticalUrl(v);
              setAdVerticalMediaType(v ? (adVerticalMediaType || "image") : "");
            }}
            onFile={({ file, type }) => handleAdMediaFile("vertical", file, type)}
          />
        </Field>
        {adVerticalUploading && (
          <p className="text-[10px] text-[#f14110] mb-2">Uploading vertical ad to Convex storage…</p>
        )}
        <Field label="Horizontal Ad" hint="Appears below search results — 700×150px (scales proportionally on mobile)">
          <MediaUpload
            label="Horizontal Ad Image"
            url={adHorizontalUrl}
            mediaType={adHorizontalMediaType}
            onUrl={(v) => {
              setAdSpacesUploadError("");
              setAdHorizontalUrl(v);
              setAdHorizontalMediaType(v ? (adHorizontalMediaType || "image") : "");
            }}
            onFile={({ file, type }) => handleAdMediaFile("horizontal", file, type)}
          />
        </Field>
        {adHorizontalUploading && (
          <p className="text-[10px] text-[#f14110] mb-2">Uploading horizontal ad to Convex storage…</p>
        )}
        {adSpacesUploadError && (
          <p className="text-[10px] text-red-600 mb-2">{adSpacesUploadError}</p>
        )}
        <div className="flex items-center gap-4 mt-2">
          <button
            type="button"
            onClick={saveAdSpaces}
            disabled={adVerticalUploading || adHorizontalUploading}
            className={`h-10 px-6 rounded-full border border-[#333] text-[#333] text-[11px] font-medium tracking-[0.22px] hover:border-[#f14110] hover:text-[#f14110] transition-colors flex items-center justify-center disabled:border-[#333]/25 disabled:text-[#333]/25 disabled:hover:border-[#333]/25 disabled:hover:text-[#333]/25 ${adSpacesSaved ? 'border-[#f14110] text-[#f14110]' : ''}`}
          >
            {adVerticalUploading || adHorizontalUploading ? "Uploading…" : adSpacesSaved ? "Saved" : "Save Ad Spaces"}
          </button>
        </div>
      </SectionCard>

      {/* Header */}
      <SectionCard title="Header Background">
        <MediaUpload
          label="Header media"
          hint="Photo or video — replaces the header background across the whole website. Recommended JPG size: 3840×1080px (supports up to 4K)"
          url={effectiveHeaderMediaUrl}
          mediaType={effectiveHeaderMediaType}
          onUrl={(v) => u({ headerMediaUrl: v })}
          onFile={({ previewUrl, type }) => u({ headerMediaUrl: previewUrl, headerMediaType: type })}
        />
        <div className="mt-2">
          <button
            type="button"
            onClick={saveHeaderMedia}
            className="h-8 px-4 rounded-[6px] bg-[#333] text-white text-[11px] font-medium hover:bg-[#111] transition-colors"
          >
            {headerMediaSaved ? "✓ Saved!" : "Save Header Media"}
          </button>
        </div>
      </SectionCard>

      {/* Footer */}
      <SectionCard title="Footer Background">
        <MediaUpload
          label="Footer media"
          hint="Photo or video — replaces the footer background across the whole website. Recommended JPG size: 3840×600px (supports up to 4K)"
          url={effectiveFooterMediaUrl}
          mediaType={effectiveFooterMediaType}
          onUrl={(v) => u({ footerMediaUrl: v })}
          onFile={({ previewUrl, type }) => u({ footerMediaUrl: previewUrl, footerMediaType: type })}
        />
        <div className="mt-2">
          <button
            type="button"
            onClick={saveFooterMedia}
            className="h-8 px-4 rounded-[6px] bg-[#333] text-white text-[11px] font-medium hover:bg-[#111] transition-colors"
          >
            {footerMediaSaved ? "✓ Saved!" : "Save Footer Media"}
          </button>
        </div>
      </SectionCard>

      {/* About Profile Picture */}
      <SectionCard title="About Page Profile Picture">
        <Field label="Profile picture" hint="Upload a profile picture for the About page (1:1 ratio recommended)">
          <MediaUpload
            label="About Profile Picture"
            url={effectiveAboutProfilePictureUrl}
            mediaType={effectiveAboutProfilePictureType}
            onUrl={(v) => {
              setAboutProfilePictureUploadError("");
              setAboutProfilePictureHasDraft(true);
              setAboutProfilePictureDraft({ url: v, type: "image" });
            }}
            onFile={async ({ file, type }) => {
              setAboutProfilePictureUploadError("");
              setAboutProfilePictureUploading(true);

              try {
                const uploadedUrl = await uploadAdminMediaAsset(file);
                setAboutProfilePictureHasDraft(true);
                setAboutProfilePictureDraft({ url: uploadedUrl, type });
              } catch (error) {
                setAboutProfilePictureUploadError(error instanceof Error ? error.message : "Failed to upload profile picture.");
              } finally {
                setAboutProfilePictureUploading(false);
              }
            }}
            accept="image/*"
          />
        </Field>
        {aboutProfilePictureUploading && (
          <p className="text-[10px] text-[#f14110] mb-2">Uploading profile picture to Convex storage…</p>
        )}
        {aboutProfilePictureUploadError && (
          <p className="text-[10px] text-red-600 mb-2">{aboutProfilePictureUploadError}</p>
        )}
        {aboutProfilePictureHasDraft && (
          <p className="text-[10px] text-green-600 mb-2">✓ About profile picture draft loaded — click Save Profile Picture or Save All UI Settings to publish it.</p>
        )}
        <div className="mt-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={saveAboutProfilePicture}
              disabled={aboutProfilePictureUploading}
              className="h-8 px-4 rounded-[6px] bg-[#333] text-white text-[11px] font-medium hover:bg-[#111] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {aboutProfilePictureUploading ? "Uploading..." : aboutProfilePictureSaved ? "✓ Saved!" : "Save Profile Picture"}
            </button>
            <button
              type="button"
              onClick={clearAboutProfilePicture}
              className="h-8 px-4 rounded-[6px] border border-[#e4e4e4] text-[11px] font-medium text-[#333]/70 hover:border-[#333] hover:text-[#333] transition-colors"
            >
              Delete Existing Entry
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Terms & Conditions */}
      <SectionCard title="Terms & Conditions">
        <p className="text-[10px] text-[#333]/50 mb-3">
          Upload a <code className="bg-[#f5f5f5] px-1 rounded">.txt</code> file. Use{" "}
          <code className="bg-[#f5f5f5] px-1 rounded">[TITLE]</code> for section headings and{" "}
          <code className="bg-[#f5f5f5] px-1 rounded">[COPY]</code> for body text. These are auto-formatted on the website.
        </p>
        <p className="text-[10px] text-[#f14110] mb-3">
          Upload loads a draft only. Click Save Terms & Conditions or Save All UI Settings to publish it to the website.
        </p>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => termsRef.current?.click()}
            className="flex items-center gap-1.5 h-9 px-4 rounded-[6px] border border-[#e4e4e4] text-[11px] text-[#333]/70 hover:border-[#333] hover:text-[#333] transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload .txt file
          </button>
          <button
            type="button"
            onClick={saveTermsContent}
            className="h-9 px-4 rounded-[6px] bg-[#333] text-white text-[11px] font-medium hover:bg-[#111] transition-colors"
          >
            {termsSaved ? "✓ Saved!" : "Save Terms & Conditions"}
          </button>
          <input ref={termsRef} type="file" accept=".txt" className="hidden" onChange={handleTermsFile} />
          {termsFile && <span className="text-[10px] text-green-600">✓ File loaded</span>}
        </div>

        <textarea
          value={effectiveTermsText}
          onChange={(e) => u({ termsText: e.target.value })}
          placeholder={"[TITLE] Section 1\n[COPY] Content of the section goes here.\n\n[TITLE] Section 2\n[COPY] More content here."}
          rows={8}
          className="w-full max-w-[600px] px-3 py-2 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#333] transition-colors font-mono resize-y"
        />

        {effectiveTermsText && (
          <div className="mt-4">
            <p className="text-[10px] font-semibold text-[#333]/50 mb-2 uppercase tracking-wider">Preview</p>
            <div className="max-w-[600px] bg-[#f8f8f8] rounded-[6px] p-4 border border-[#e4e4e4]">
              {parseTermsPreview(effectiveTermsText)}
            </div>
          </div>
        )}

        <div className="mt-4">
          <button
            type="button"
            onClick={saveTermsContent}
            className="h-8 px-4 rounded-[6px] bg-[#333] text-white text-[11px] font-medium hover:bg-[#111] transition-colors"
          >
            {termsSaved ? "✓ Saved!" : "Save Terms & Conditions"}
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
