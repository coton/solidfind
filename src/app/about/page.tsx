"use client";

import Link from "next/link";
import Image from "next/image";
import { ReactNode, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";
import { MobileMenuButton } from "@/components/MobileMenuDrawer";
import { AccountIconLink } from "@/components/AccountIcon";
import { LinkedText } from "@/components/LinkedText";
import { AdBanner } from "@/components/AdBanner";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  normalizeContactHref,
  resolveMediaSetting,
  resolveTextSetting,
} from "@/lib/platform-settings.mjs";

const DEFAULT_ABOUT_TAGLINE = "A clearer way to build and live in Indonesia.";
const DEFAULT_ABOUT_DESCRIPTION = `Building, renovating, or choosing a home is one of the most important decisions people make — yet reliable information and trustworthy contacts are often hard to find. SOLIDFIND.ID exists to bring clarity, structure, and confidence to that process.`;
const DEFAULT_INDIVIDUAL_TEXT = "For property owners & renters — browse listings, bookmark companies, write testimonials, and find the right professionals for your project. Choose your household type: Solo / Couple, Family / Co-Hosting, or Shared / Community.";
const DEFAULT_FREE_COMPANY_TEXT = "For construction & renovation professionals — create your company profile, showcase up to 3 project photos, receive testimonials, and get discovered by potential clients across Bali.";
const DEFAULT_PRO_COMPANY_TEXT = "Everything in Free, plus: priority positioning in search results, structured AI-assisted search, visibility analytics, up to 12 project photos or videos, and ad placements across the website. Built for companies ready to grow.";
const DEFAULT_CONTACT_TEXT = "Questions, feedback, or partnership inquiries?";
const DEFAULT_CONTACT_EMAIL = "hello@solidfind.id";
const ABOUT_ID_SETTING_SUFFIX = "Id";

type AboutLanguage = "en" | "id";

function renderBoldTextLine(line: string) {
  return line.split(/(\*\*[^*]+\*\*)/g).map((segment, index) => {
    if (segment.startsWith("**") && segment.endsWith("**") && segment.length > 4) {
      return <strong key={`${segment}-${index}`} className="font-semibold text-[#333]">{segment.slice(2, -2)}</strong>;
    }

    return <LinkedText key={`${segment}-${index}`} text={segment} />;
  });
}

function parseBulletLine(line: string) {
  const match = line.trim().match(/^[-•▪*]\s+(.+)$/);
  return match ? match[1].trim() : null;
}

function renderFormattedParagraphs(text: string, className: string) {
  const renderParagraph = (lines: string[], key: string) => {
    if (lines.length === 0) return null;
    return <p key={key} className={className}>{renderBoldTextLine(lines.join(" "))}</p>;
  };

  const renderBulletList = (items: string[], key: string) => {
    if (items.length === 0) return null;
    return (
      <ul key={key} className="sf-about-list">
        {items.map((item, itemIndex) => (
          <li key={`${key}-${itemIndex}`} className={className}>{renderBoldTextLine(item)}</li>
        ))}
      </ul>
    );
  };

  return text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block, index) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      if (lines.length === 0) {
        return null;
      }

      const runs: ReactNode[] = [];
      let paragraphLines: string[] = [];
      let bulletItems: string[] = [];

      const flushParagraph = () => {
        const rendered = renderParagraph(paragraphLines, `paragraph-${index}-${runs.length}`);
        if (rendered) runs.push(rendered);
        paragraphLines = [];
      };
      const flushBullets = () => {
        const rendered = renderBulletList(bulletItems, `bullets-${index}-${runs.length}`);
        if (rendered) runs.push(rendered);
        bulletItems = [];
      };

      for (const line of lines) {
        const bulletContent = parseBulletLine(line);
        if (bulletContent) {
          flushParagraph();
          bulletItems.push(bulletContent);
        } else {
          flushBullets();
          paragraphLines.push(line);
        }
      }
      flushParagraph();
      flushBullets();

      return <div key={`block-${index}`} className="space-y-1">{runs}</div>;
    });
}

export default function AboutPage() {
  const [backHref] = useState(() => {
    if (typeof window === "undefined") {
      return "/";
    }

    return new URLSearchParams(window.location.search).get("from") || "/";
  });
  const [language, setLanguage] = useState<AboutLanguage>("en");

  // Dynamic content from admin UI tab
  const tagline = useQuery(api.platformSettings.get, { key: "aboutPageTagline" });
  const taglineState = resolveTextSetting(tagline, DEFAULT_ABOUT_TAGLINE);
  const taglineId = useQuery(api.platformSettings.get, { key: `aboutPageTagline${ABOUT_ID_SETTING_SUFFIX}` });
  const taglineIdState = resolveTextSetting(taglineId, taglineState.value || DEFAULT_ABOUT_TAGLINE);
  const description = useQuery(api.platformSettings.get, { key: "aboutPageDescription" });
  const descriptionState = resolveTextSetting(description, DEFAULT_ABOUT_DESCRIPTION);
  const descriptionId = useQuery(api.platformSettings.get, { key: `aboutPageDescription${ABOUT_ID_SETTING_SUFFIX}` });
  const descriptionIdState = resolveTextSetting(descriptionId, descriptionState.value || DEFAULT_ABOUT_DESCRIPTION);
  const individual = useQuery(api.platformSettings.get, { key: "aboutPageIndividual" });
  const individualState = resolveTextSetting(individual, DEFAULT_INDIVIDUAL_TEXT);
  const individualId = useQuery(api.platformSettings.get, { key: `aboutPageIndividual${ABOUT_ID_SETTING_SUFFIX}` });
  const individualIdState = resolveTextSetting(individualId, individualState.value || DEFAULT_INDIVIDUAL_TEXT);
  const freeCompany = useQuery(api.platformSettings.get, { key: "aboutPageFreeCompany" });
  const freeCompanyState = resolveTextSetting(freeCompany, DEFAULT_FREE_COMPANY_TEXT);
  const freeCompanyId = useQuery(api.platformSettings.get, { key: `aboutPageFreeCompany${ABOUT_ID_SETTING_SUFFIX}` });
  const freeCompanyIdState = resolveTextSetting(freeCompanyId, freeCompanyState.value || DEFAULT_FREE_COMPANY_TEXT);
  const proCompany = useQuery(api.platformSettings.get, { key: "aboutPageProCompany" });
  const proCompanyState = resolveTextSetting(proCompany, DEFAULT_PRO_COMPANY_TEXT);
  const proCompanyId = useQuery(api.platformSettings.get, { key: `aboutPageProCompany${ABOUT_ID_SETTING_SUFFIX}` });
  const proCompanyIdState = resolveTextSetting(proCompanyId, proCompanyState.value || DEFAULT_PRO_COMPANY_TEXT);
  const contact = useQuery(api.platformSettings.get, { key: "aboutPageContact" });
  const contactState = resolveTextSetting(contact, DEFAULT_CONTACT_TEXT);
  const contactId = useQuery(api.platformSettings.get, { key: `aboutPageContact${ABOUT_ID_SETTING_SUFFIX}` });
  const contactIdState = resolveTextSetting(contactId, contactState.value || DEFAULT_CONTACT_TEXT);
  const email = useQuery(api.platformSettings.get, { key: "aboutPageEmail" });
  const emailState = resolveTextSetting(email, DEFAULT_CONTACT_EMAIL);
  const aboutProfilePicture = useQuery(api.platformSettings.get, { key: "aboutProfilePictureUrl" });
  const aboutProfileMediaState = resolveMediaSetting(aboutProfilePicture, { url: "", type: "image" });
  const aboutProfileMedia = aboutProfileMediaState.media;
  const igUrl = useQuery(api.platformSettings.get, { key: "ig_url" });
  const igUrlState = resolveTextSetting(igUrl, "#");
  const proFeatureValue = useQuery(api.platformSettings.get, { key: "pro_enabled" });
  const showProCompany = proFeatureValue === "true";
  const mailHref = normalizeContactHref(emailState.value, `mailto:${DEFAULT_CONTACT_EMAIL}`);
  const localized = {
    tagline: language === "id" ? taglineIdState.value : taglineState.value,
    description: language === "id" ? descriptionIdState.value : descriptionState.value,
    individual: language === "id" ? individualIdState.value : individualState.value,
    freeCompany: language === "id" ? freeCompanyIdState.value : freeCompanyState.value,
    proCompany: language === "id" ? proCompanyIdState.value : proCompanyState.value,
    contact: language === "id" ? contactIdState.value : contactState.value,
    howItWorks: language === "id" ? "Cara kerjanya" : "How it works",
    individualHeading: language === "id" ? "AKUN INDIVIDU" : "INDIVIDUAL ACCOUNT",
    companyHeading: language === "id" ? "AKUN PERUSAHAAN" : "COMPANY ACCOUNT",
    proCompanyHeading: language === "id" ? "AKUN PRO PERUSAHAAN" : "PRO COMPANY ACCOUNT",
    contactHeading: language === "id" ? "Hubungi kami" : "Get in touch",
    reachUsAt: language === "id" ? "Hubungi kami di" : "Reach us at",
  };
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "SOLIDFIND.ID", url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };
  const toggleLanguage = () => setLanguage((current) => current === "en" ? "id" : "en");
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      <main className="sf-about" data-screen-label="About">
        <div className="sf-about-hero">
          <div className="sf-about-hero-bg" aria-hidden="true" />
          <div className="sf-about-hero-bar">
            <Link className="sf-shell-brand" href="/">
              <Image src="/assets/solidfind-logo.svg" alt="SolidFind" width={136} height={20} />
              <span className="sf-brand-id sf-about-hero-id">.id</span>
            </Link>
            <div className="sf-shell-actions">
              <button type="button" className="sf-lang" onClick={toggleLanguage} aria-label={`Switch language to ${language === "en" ? "Indonesian" : "English"}`}>
                <span className={language === "en" ? "on" : ""}>EN</span>
                <span className={language === "id" ? "on" : ""}>ID</span>
              </button>
              <AccountIconLink href="/dashboard" />
              <button type="button" className="sf-btn sf-btn-pri sf-static-list-btn" onClick={() => setAuthModalOpen(true)}>List your services</button>
              <MobileMenuButton />
            </div>
          </div>
          <div className="sf-about-hero-copy">
            <span className="sf-tag-light">About</span>
            <h1>{localized.tagline}</h1>
            <p>{localized.description.split(/\n+/)[0]}</p>
          </div>
        </div>

        <Link className="sf-about-back" href={backHref}>← Back</Link>

        <div className="sf-about-body">
          <section className="sf-about-main">
            <h2 className="sf-h2-static">Why we exist</h2>
            <div className="sf-about-prose">
              {renderFormattedParagraphs(localized.description, "sf-about-p")}
            </div>

            <h2 className="sf-h2-static">{localized.howItWorks}</h2>
            <div className="sf-about-cards">
              <div className="sf-about-card">
                <span className="sf-about-card-n">01</span>
                <div>
                  <span className="sf-tag-mono">{localized.individualHeading}</span>
                  <p>{localized.individual}</p>
                </div>
              </div>
              <div className="sf-about-card">
                <span className="sf-about-card-n">02</span>
                <div>
                  <span className="sf-tag-mono">{localized.companyHeading}</span>
                  <div>{renderFormattedParagraphs(localized.freeCompany, "sf-about-p")}</div>
                </div>
              </div>
              {showProCompany && (
                <div className="sf-about-card">
                  <span className="sf-about-card-n">03</span>
                  <div>
                    <span className="sf-tag-mono">{localized.proCompanyHeading}</span>
                    <div>{renderFormattedParagraphs(localized.proCompany, "sf-about-p")}</div>
                  </div>
                </div>
              )}
            </div>

            <button className="sf-about-back sf-legal-totop" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑ Back to top</button>
          </section>

          <aside className="sf-about-side">
            <div className="sf-detail-card">
              <span className="sf-tag-mono">{localized.contactHeading}</span>
              <p className="sf-about-contact">{localized.contact}</p>
              <a className="sf-btn sf-btn-pri sf-btn-lg" href={mailHref}>{emailState.value}</a>
            </div>
            <div className="sf-about-jump">
              <Link className="sf-about-jump-btn" href="/">
                <b>Start browsing listings</b>
                <span>Find professionals across Bali →</span>
              </Link>
              <button className="sf-about-jump-btn" type="button" onClick={() => setAuthModalOpen(true)}>
                <b>List your services</b>
                <span>Create a company profile →</span>
              </button>
              <button className="sf-about-jump-btn" type="button" onClick={handleShare}>
                <b>Share SolidFind</b>
                <span>Copy or send this page →</span>
              </button>
            </div>
          </aside>
        </div>

        <div className="sf-about-bottom-ad">
          <AdBanner />
        </div>
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="register"
        initialAccountType="company"
      />
      <Footer />
    </div>
  );
}
