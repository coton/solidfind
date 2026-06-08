"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useQuery } from "convex/react";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";
import { MobileMenuButton } from "@/components/MobileMenuDrawer";
import { AccountIconLink } from "@/components/AccountIcon";
import { LinkedText } from "@/components/LinkedText";
import { api } from "../../../convex/_generated/api";
import {
  DEFAULT_PRO_TERMS_EN_TEXT,
  DEFAULT_PRO_TERMS_ID_TEXT,
  DEFAULT_TERMS_ID_TEXT,
  DEFAULT_TERMS_TEXT,
  parseTermsContent,
  PRO_TERMS_EN_PLATFORM_SETTING_KEY,
  PRO_TERMS_ID_PLATFORM_SETTING_KEY,
  TERMS_ID_TEXT_PLATFORM_SETTING_KEY,
  TERMS_TEXT_PLATFORM_SETTING_KEY,
} from "@/lib/terms-content.mjs";
import { resolveTextSetting } from "@/lib/platform-settings.mjs";
import { useSearchParams } from "next/navigation";

type TermsView = "main" | "pro-en" | "pro-id";
type TermsLanguage = "en" | "id";

function normalizeHeading(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function sanitizeReturnPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  try {
    const parsed = new URL(value, "https://solidfind.local");
    if (parsed.origin !== "https://solidfind.local") {
      return null;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export default function TermsPage() {
  const searchParams = useSearchParams();
  const [proTermsModalView, setProTermsModalView] = useState<Exclude<TermsView, "main"> | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const requestedView = searchParams.get("view");
  const view: TermsView =
    requestedView === "pro-en" || requestedView === "pro-id" ? requestedView : "main";
  const language: TermsLanguage =
    view === "pro-id" || (view === "main" && searchParams.get("lang") === "id") ? "id" : "en";
  const fromPath = sanitizeReturnPath(searchParams.get("from"));
  const termsText = useQuery(api.platformSettings.get, { key: TERMS_TEXT_PLATFORM_SETTING_KEY });
  const termsTextIndonesian = useQuery(api.platformSettings.get, { key: TERMS_ID_TEXT_PLATFORM_SETTING_KEY });
  const proTermsEnglish = useQuery(api.platformSettings.get, { key: PRO_TERMS_EN_PLATFORM_SETTING_KEY });
  const proTermsIndonesian = useQuery(api.platformSettings.get, { key: PRO_TERMS_ID_PLATFORM_SETTING_KEY });
  const termsTextState = resolveTextSetting(termsText, DEFAULT_TERMS_TEXT);
  const termsTextIndonesianState = resolveTextSetting(termsTextIndonesian, DEFAULT_TERMS_ID_TEXT);
  const proTermsEnglishState = resolveTextSetting(proTermsEnglish, DEFAULT_PRO_TERMS_EN_TEXT);
  const proTermsIndonesianState = resolveTextSetting(proTermsIndonesian, DEFAULT_PRO_TERMS_ID_TEXT);
  const proEnabledValue = useQuery(api.platformSettings.get, { key: "pro_enabled" });
  const proTermsVisible = proEnabledValue === "true";
  const effectiveView: TermsView = proTermsVisible ? view : "main";
  const selectedText =
    effectiveView === "pro-en"
      ? proTermsEnglishState.value || DEFAULT_PRO_TERMS_EN_TEXT
      : effectiveView === "pro-id"
        ? proTermsIndonesianState.value || DEFAULT_PRO_TERMS_ID_TEXT
        : language === "id"
          ? termsTextIndonesianState.value || DEFAULT_TERMS_ID_TEXT
          : termsTextState.value || DEFAULT_TERMS_TEXT;
  const isLoading =
    effectiveView === "pro-en"
      ? proTermsEnglishState.isLoading
      : effectiveView === "pro-id"
        ? proTermsIndonesianState.isLoading
        : language === "id"
          ? termsTextIndonesianState.isLoading
          : termsTextState.isLoading;
  const sections = isLoading ? [] : parseTermsContent(selectedText);
  const selectedProModalText =
    proTermsModalView === "pro-id"
      ? proTermsIndonesianState.value || DEFAULT_PRO_TERMS_ID_TEXT
      : proTermsEnglishState.value || DEFAULT_PRO_TERMS_EN_TEXT;
  const selectedProModalSections = proTermsModalView ? parseTermsContent(selectedProModalText) : [];
  const legalHeading =
    effectiveView === "pro-en"
      ? "Pro Terms of Services"
      : effectiveView === "pro-id"
        ? "Ketentuan Penggunaan Pro"
        : language === "id"
          ? "Syarat & Ketentuan"
          : "Terms & Conditions";
  const normalizedLegalHeading = normalizeHeading(legalHeading);
  const backHref = effectiveView === "main" ? "/" : fromPath || "/terms";
  const fromSuffix = fromPath ? `&from=${encodeURIComponent(fromPath)}` : "";
  const languageLinks: Record<TermsLanguage, string> =
    view === "main"
      ? {
          en: "/terms?lang=en",
          id: "/terms?lang=id",
        }
      : {
          en: `/terms?view=pro-en${fromSuffix}`,
          id: `/terms?view=pro-id${fromSuffix}`,
        };
  const nextLanguage: TermsLanguage = language === "en" ? "id" : "en";
  const isHiddenLegalTitle = (section: (typeof sections)[number], sectionIndex: number) => (
    sectionIndex === 0 &&
    (normalizeHeading(section.title) === normalizedLegalHeading ||
      normalizeHeading(section.title).includes(normalizedLegalHeading) ||
      normalizeHeading(section.title).includes("terms & conditions") ||
      normalizeHeading(section.title).includes("syarat & ketentuan"))
  );
  const visibleTocSections = sections
    .map((section, sectionIndex) => ({ section, sectionIndex }))
    .filter(({ section, sectionIndex }) => !isHiddenLegalTitle(section, sectionIndex));

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      <main className="sf-about sf-legal" data-screen-label="Legal">
        <div className="sf-about-hero">
          <div className="sf-about-hero-bg" aria-hidden="true" />
          <div className="sf-about-hero-bar">
            <Link className="sf-shell-brand" href="/">
              <Image src="/assets/solidfind-logo.svg" alt="SolidFind" width={136} height={20} />
              <span className="sf-brand-id sf-about-hero-id">.id</span>
            </Link>
            <div className="sf-shell-actions">
              <Link className="sf-lang" aria-label={`Switch language to ${nextLanguage.toUpperCase()}`} href={languageLinks[nextLanguage]}>
                <span className={language === "en" ? "on" : ""}>EN</span>
                <span className={language === "id" ? "on" : ""}>ID</span>
              </Link>
              <AccountIconLink href="/dashboard" />
              <button type="button" className="sf-btn sf-btn-pri sf-static-list-btn" onClick={() => setAuthModalOpen(true)}>List your services</button>
              <MobileMenuButton />
            </div>
          </div>
          <div className="sf-about-hero-copy">
            <span className="sf-tag-light">Legal</span>
            <h1>{legalHeading}</h1>
            <p>{language === "id" ? "Dokumen hukum dan ketentuan penggunaan SolidFind." : "Platform terms, privacy notes and service conditions."}</p>
            <div className="sf-doc-tabs sf-doc-tabs-below" role="tablist" aria-label="Legal documents">
              <Link className={`sf-doc-tab ${effectiveView === "main" ? "on" : ""}`} href={`/terms?lang=${language}`}>Terms &amp; Conditions</Link>
              {proTermsVisible && (
                <Link className={`sf-doc-tab ${effectiveView !== "main" ? "on" : ""}`} href={`/terms?view=${language === "id" ? "pro-id" : "pro-en"}${fromSuffix}`}>Pro Terms of Service</Link>
              )}
            </div>
          </div>
        </div>

        <Link className="sf-about-back" href={backHref}>← Back</Link>

        <div className="sf-legal-body">
          <div className="sf-legal-content">
            <div className="sf-doc-panel on">
              {sections.map((section, sectionIndex) => {
                const shouldHideTitle = isHiddenLegalTitle(section, sectionIndex);
                const visibleNumber = sections
                  .slice(0, sectionIndex + 1)
                  .filter((candidate, candidateIndex) => {
                    return !isHiddenLegalTitle(candidate, candidateIndex);
                  }).length;

                return (
                  <section className="sf-legal-section" id={`legal-${sectionIndex + 1}`} key={section.title}>
                    {!shouldHideTitle && (
                      <h3 className="sf-legal-h2">
                        <span className="sf-legal-n">{visibleNumber}</span>{section.title}
                      </h3>
                    )}

                    {section.blocks.map((block, index) => {
                      if (block.type === "list") {
                        return (
                          <ul key={`${section.title}-${index}`} className="space-y-0.5 pl-8 ml-2 mb-1">
                            {block.items.map((item) => (
                              <li key={item}><LinkedText text={item} /></li>
                            ))}
                          </ul>
                        );
                      }

                      return (
                        <p key={`${section.title}-${index}`} className={`sf-legal-p ${index === 0 ? "is-intro" : ""}`}>
                          <LinkedText text={block.content} />
                        </p>
                      );
                    })}
                  </section>
                );
              })}
            </div>
            <button className="sf-about-back sf-legal-totop" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑ Back to top</button>
          </div>

          <aside className="sf-legal-toc">
            <span className="sf-tag-mono">On this page</span>
            <nav>
              {visibleTocSections.slice(0, 12).map(({ section, sectionIndex }, index) => (
                <a href={`#legal-${sectionIndex + 1}`} key={`${section.title}-toc`}>
                  <span>{index + 1}</span>{section.title}
                </a>
              ))}
            </nav>
          </aside>
        </div>
      </main>

      {proTermsVisible && proTermsModalView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#333]/30 px-4 py-8">
          <div className="relative flex max-h-[86vh] w-full max-w-[620px] flex-col overflow-hidden rounded-[6px] bg-[#f8f8f8]">
            <button
              type="button"
              onClick={() => setProTermsModalView(null)}
              aria-label="Close Pro Terms"
              className="absolute right-4 top-4 z-10 text-[#333]/45 transition-colors hover:text-[#f14110]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <div className="overflow-y-auto p-6 pr-8 sm:p-8 sm:pr-10">
              <h2 className="mb-5 pr-8 text-[18px] font-semibold leading-[20px] tracking-[0.36px] text-[#333]">
                {proTermsModalView === "pro-id" ? "Ketentuan Penggunaan Pro" : "Pro Terms of Services"}
              </h2>
              <div className="space-y-6 text-[11px] leading-[15px] tracking-[0.22px] text-[#333]/70">
                {selectedProModalSections.map((section, sectionIndex) => {
                  const modalHeading =
                    proTermsModalView === "pro-id" ? "Ketentuan Penggunaan Pro" : "Pro Terms of Services";
                  const shouldHideTitle =
                    sectionIndex === 0 &&
                    normalizeHeading(section.title).includes(normalizeHeading(modalHeading));

                  return (
                    <section key={section.title}>
                      {!shouldHideTitle && (
                        <h3 className="mb-2 text-[18px] font-semibold leading-[20px] tracking-[0.36px] text-[#333]">
                          {section.title}
                        </h3>
                      )}
                      {section.blocks.map((block, index) => {
                        if (block.type === "list") {
                          return (
                            <ul key={`${section.title}-${index}`} className="space-y-0.5 pl-8 ml-2 mb-1">
                              {block.items.map((item) => (
                                <li key={item} className="flex items-start gap-2 leading-[15px]">
                                  <span className="text-[#f14110]">•</span>
                                  <span><LinkedText text={item} /></span>
                                </li>
                              ))}
                            </ul>
                          );
                        }

                        return (
                          <p key={`${section.title}-${index}`} className="mb-1">
                            {block.content}
                          </p>
                        );
                      })}
                    </section>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

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
