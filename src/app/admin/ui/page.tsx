"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Upload } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const STORAGE_KEY = "solidfind_ui_settings";

interface UISettings {
  contactUrl: string;
  igUrl: string;
  igVisible: boolean;
  adVerticalUrl: string;
  adVerticalMediaType: "image" | "video" | "";
  adHorizontalUrl: string;
  adHorizontalMediaType: "image" | "video" | "";
  headerMediaUrl: string;
  headerMediaType: "image" | "video" | "";
  footerMediaUrl: string;
  footerMediaType: "image" | "video" | "";
  aboutProfilePictureUrl: string;
  aboutProfilePictureType: "image" | "video" | "";
}

const DEFAULT: UISettings = {
  contactUrl: "",
  igUrl: "",
  igVisible: true,
  adVerticalUrl: "",
  adVerticalMediaType: "",
  adHorizontalUrl: "",
  adHorizontalMediaType: "",
  headerMediaUrl: "",
  headerMediaType: "",
  footerMediaUrl: "",
  footerMediaType: "",
  aboutProfilePictureUrl: "",
  aboutProfilePictureType: "",
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
  const termsRef = useRef<HTMLInputElement>(null);

  // Terms & Conditions (Convex-backed)
  const termsTextValue = useQuery(api.platformSettings.get, { key: "termsText" });
  const [termsText, setTermsText] = useState("");
  const [termsSaved, setTermsSaved] = useState(false);

  useEffect(() => {
    if (termsTextValue !== undefined && termsTextValue !== null) {
      setTermsText(termsTextValue);
    }
  }, [termsTextValue]);

  // About profile picture (Convex-backed)
  const aboutProfilePictureUrlValue = useQuery(api.platformSettings.get, { key: "aboutProfilePictureUrl" });
  const [aboutProfilePictureUrl, setAboutProfilePictureUrl] = useState("");
  const [aboutProfilePictureType, setAboutProfilePictureType] = useState<"image" | "video" | "">("");
  const [aboutProfilePictureSaved, setAboutProfilePictureSaved] = useState(false);

  // About Card (Convex-backed)
  const aboutCardValue = useQuery(api.platformSettings.get, { key: "aboutCardDescription" });
  const setPlatformSetting = useMutation(api.platformSettings.set);
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

  useEffect(() => {
    if (adVerticalValue !== undefined && adVerticalValue !== null) {
      const parsed = JSON.parse(adVerticalValue);
      setAdVerticalUrl(parsed.url ?? "");
      setAdVerticalMediaType(parsed.type ?? "");
    }
    if (adHorizontalValue !== undefined && adHorizontalValue !== null) {
      const parsed = JSON.parse(adHorizontalValue);
      setAdHorizontalUrl(parsed.url ?? "");
      setAdHorizontalMediaType(parsed.type ?? "");
    }
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

  useEffect(() => {
    if (aboutProfilePictureUrlValue !== undefined && aboutProfilePictureUrlValue !== null) {
      try {
        const parsed = JSON.parse(aboutProfilePictureUrlValue);
        setAboutProfilePictureUrl(parsed.url ?? "");
        setAboutProfilePictureType(parsed.type ?? "");
      } catch {
        setAboutProfilePictureUrl(aboutProfilePictureUrlValue ?? "");
        setAboutProfilePictureType("image");
      }
    }
  }, [aboutProfilePictureUrlValue]);

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
      setTermsText(text);
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
          onClick={async () => {
            await setPlatformSetting({ key: "aboutCardDescription", value: aboutText });
            setAboutSaved(true);
            setTimeout(() => setAboutSaved(false), 2000);
          }}
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
        <Field label="Description" hint="Main paragraph below the tagline. Use line breaks for multiple paragraphs.">
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
        <Field label="Free Company Account description">
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
          onClick={async () => {
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
              await setPlatformSetting({ key, value });
            }
            setAboutPageSaved(true);
            setTimeout(() => setAboutPageSaved(false), 2000);
          }}
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
          onClick={async () => {
            await setPlatformSetting({ key: "ig_url", value: igUrl, updatedBy: "admin" });
            await setPlatformSetting({ key: "ig_visible", value: igVisible ? "true" : "false", updatedBy: "admin" });
            await setPlatformSetting({ key: "contact_url", value: contactUrl, updatedBy: "admin" });
            setLinksSaved(true);
            setTimeout(() => setLinksSaved(false), 2000);
          }}
          className="h-8 px-4 rounded-[6px] bg-[#333] text-white text-[11px] font-medium hover:bg-[#111] transition-colors"
        >
          {linksSaved ? "✓ Links Saved!" : "Save Contact & Instagram"}
        </button>
      </div>

      {/* Ads */}
      <SectionCard title="Ad Spaces">
        <Field label="Vertical Ad" hint="Appears on the left panel of popups (150×500px)">
          <MediaUpload
            label="Vertical Ad Image"
            url={adVerticalUrl}
            mediaType={adVerticalMediaType}
            onUrl={(v) => setAdVerticalUrl(v)}
            onFile={(dataUrl, type) => { setAdVerticalUrl(dataUrl); setAdVerticalMediaType(type); }}
          />
        </Field>
        <Field label="Horizontal Ad" hint="Appears below search results — 700×150px (scales proportionally on mobile)">
          <MediaUpload
            label="Horizontal Ad Image"
            url={adHorizontalUrl}
            mediaType={adHorizontalMediaType}
            onUrl={(v) => setAdHorizontalUrl(v)}
            onFile={(dataUrl, type) => { setAdHorizontalUrl(dataUrl); setAdHorizontalMediaType(type); }}
          />
        </Field>
        <div className="flex items-center gap-4 mt-2">
          <button
            type="button"
            onClick={() => {
              setAdSpacesSaved(false);
              const promiseVertical = setPlatformSetting({ key: "adVertical", value: JSON.stringify({ url: adVerticalUrl, type: adVerticalMediaType }) });
              const promiseHorizontal = setPlatformSetting({ key: "adHorizontal", value: JSON.stringify({ url: adHorizontalUrl, type: adHorizontalMediaType }) });
              Promise.all([promiseVertical, promiseHorizontal]).then(() => {
                setAdSpacesSaved(true);
                setTimeout(() => setAdSpacesSaved(false), 2000);
              });
            }}
            className={`h-10 px-6 rounded-full border border-[#333] text-[#333] text-[11px] font-medium tracking-[0.22px] hover:border-[#f14110] hover:text-[#f14110] transition-colors flex items-center justify-center ${adSpacesSaved ? 'border-[#f14110] text-[#f14110]' : ''}`}
          >
            {adSpacesSaved ? "Saved" : "Save Ad Spaces"}
          </button>
        </div>
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

      {/* About Profile Picture */}
      <SectionCard title="About Page Profile Picture">
        <Field label="Profile picture" hint="Upload a profile picture for the About page (1:1 ratio recommended)">
          <MediaUpload
            label="About Profile Picture"
            url={aboutProfilePictureUrl}
            mediaType={aboutProfilePictureType}
            onUrl={(v) => setAboutProfilePictureUrl(v)}
            onFile={(dataUrl, type) => { setAboutProfilePictureUrl(dataUrl); setAboutProfilePictureType(type); }}
          />
        </Field>
        <div className="mt-2">
          <button
            type="button"
            onClick={async () => {
              await setPlatformSetting({ key: "aboutProfilePictureUrl", value: JSON.stringify({ url: aboutProfilePictureUrl, type: aboutProfilePictureType }), updatedBy: "admin" });
              setAboutProfilePictureSaved(true);
              setTimeout(() => setAboutProfilePictureSaved(false), 2000);
            }}
            className="h-8 px-4 rounded-[6px] bg-[#333] text-white text-[11px] font-medium hover:bg-[#111] transition-colors"
          >
            {aboutProfilePictureSaved ? "✓ Saved!" : "Save Profile Picture"}
          </button>
        </div>
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
          {termsText && <span className="text-[10px] text-green-600">✓ File loaded</span>}
        </div>

        <textarea
          value={termsText}
          onChange={(e) => setTermsText(e.target.value)}
          placeholder={"[TITLE] Section 1\n[COPY] Content of the section goes here.\n\n[TITLE] Section 2\n[COPY] More content here."}
          rows={8}
          className="w-full max-w-[600px] px-3 py-2 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#333] transition-colors font-mono resize-y"
        />

        {termsText && (
          <div className="mt-4">
            <p className="text-[10px] font-semibold text-[#333]/50 mb-2 uppercase tracking-wider">Preview</p>
            <div className="max-w-[600px] bg-[#f8f8f8] rounded-[6px] p-4 border border-[#e4e4e4]">
              {parseTermsPreview(termsText)}
            </div>
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={async () => {
              await setPlatformSetting({ key: "termsText", value: termsText, updatedBy: "admin" });
              setTermsSaved(true);
              setTimeout(() => setTermsSaved(false), 2000);
            }}
            className="h-8 px-4 rounded-[6px] bg-[#333] text-white text-[11px] font-medium hover:bg-[#111] transition-colors"
          >
            {termsSaved ? "✓ Saved!" : "Save T&C"}
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
