"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useQuery } from "convex/react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
import { resolveMediaSetting, resolveTextSetting } from "@/lib/platform-settings.mjs";
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
  const proEnabledValue = useQuery(api.platformSettings.get, { key: "pro_enabled" });
  const aboutProfilePicture = useQuery(api.platformSettings.get, { key: "aboutProfilePictureUrl" });
  const termsTextState = resolveTextSetting(termsText, DEFAULT_TERMS_TEXT);
  const termsTextIndonesianState = resolveTextSetting(termsTextIndonesian, DEFAULT_TERMS_ID_TEXT);
  const proTermsEnglishState = resolveTextSetting(proTermsEnglish, DEFAULT_PRO_TERMS_EN_TEXT);
  const proTermsIndonesianState = resolveTextSetting(proTermsIndonesian, DEFAULT_PRO_TERMS_ID_TEXT);
  const aboutProfileMediaState = resolveMediaSetting(aboutProfilePicture, { url: "", type: "image" });
  const aboutProfileMedia = aboutProfileMediaState.media;
  const selectedText =
    view === "pro-en"
      ? proTermsEnglishState.value || DEFAULT_PRO_TERMS_EN_TEXT
      : view === "pro-id"
        ? proTermsIndonesianState.value || DEFAULT_PRO_TERMS_ID_TEXT
        : language === "id"
          ? termsTextIndonesianState.value || DEFAULT_TERMS_ID_TEXT
          : termsTextState.value || DEFAULT_TERMS_TEXT;
  const isLoading =
    view === "pro-en"
      ? proTermsEnglishState.isLoading
      : view === "pro-id"
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
  const proTermsVisible = proEnabledValue === "true";
  const legalHeading =
    view === "pro-en"
      ? "Pro Terms of Services"
      : view === "pro-id"
        ? "Ketentuan Penggunaan Pro"
        : language === "id"
          ? "Syarat & Ketentuan"
          : "Terms & Conditions";
  const normalizedLegalHeading = normalizeHeading(legalHeading);
  const backHref = view === "main" ? "/" : fromPath || "/terms";
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

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      <Header />

      <main className="max-w-[900px] mx-auto px-4 sm:px-0 py-6 sm:py-8 flex-grow w-full">
        <div className="flex items-center mb-3 py-2 border-b border-[#333]/10">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#333] tracking-[0.22px] hover:text-[#f14110] transition-colors"
          >
            <svg width="8" height="5" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <path d="M1 5H15M1 5L5 1M1 5L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>BACK</span>
          </Link>
        </div>

        <div className="mb-6 flex items-start justify-between gap-4 sm:mb-8">
          <h1 className="text-[24px] sm:text-[32px] font-bold text-[#333] tracking-[0.64px]">
            SOLIDFIND.ID
          </h1>
          <div className="flex h-7 shrink-0 overflow-hidden rounded-full border border-[#333]/15 text-[10px] font-semibold tracking-[0.2px] text-[#333]/50">
            {(["en", "id"] as TermsLanguage[]).map((option) => (
              <Link
                key={option}
                href={languageLinks[option]}
                className={`flex items-center px-3 transition-colors ${language === option ? "bg-[#333] text-white" : "hover:text-[#333]"}`}
              >
                {option.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_1fr] lg:gap-12 mb-8 sm:mb-12">
          <div className="flex flex-col items-center lg:items-start">
            <div className="w-[180px] sm:w-[200px] h-[180px] sm:h-[200px] relative rounded-[6px] bg-[#f8f8f8] flex items-center justify-center p-6 sm:p-8 overflow-hidden">
              {aboutProfileMedia.url ? (
                aboutProfileMedia.type === "video" ? (
                  <video src={aboutProfileMedia.url} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                ) : (
                  <Image
                    src={aboutProfileMedia.url}
                    alt="SOLIDFIND.ID Logo"
                    fill
                    className="object-cover"
                    unoptimized={aboutProfileMedia.url.startsWith("data:")}
                  />
                )
              ) : aboutProfileMediaState.isLoading ? (
                <div className="w-full h-full bg-[#e4e4e4]" />
              ) : (
                <Image
                  src="/images/logo-full.svg"
                  alt="SOLIDFIND.ID Logo"
                  width={175}
                  height={19}
                  className="w-full h-auto"
                />
              )}
            </div>
          </div>

          <div>
            <h2 className="text-[18px] font-semibold text-[#333] tracking-[0.36px] leading-[20px] mb-5">
              {legalHeading}
            </h2>

            <div className="space-y-6 text-[11px] text-[#333]/70 leading-[15px] tracking-[0.22px] mb-12">
              {sections.map((section, sectionIndex) => {
                const shouldHideTitle =
                  sectionIndex === 0 &&
                  (normalizeHeading(section.title) === normalizedLegalHeading ||
                    normalizeHeading(section.title).includes(normalizedLegalHeading) ||
                    normalizeHeading(section.title).includes("terms & conditions") ||
                    normalizeHeading(section.title).includes("syarat & ketentuan"));

                return (
                  <section key={section.title}>
                    {!shouldHideTitle && (
                      <h3 className="text-[18px] font-semibold text-[#333] tracking-[0.36px] leading-[20px] mb-2">
                        {section.title}
                      </h3>
                    )}

                    {section.blocks.map((block, index) => {
                      if (block.type === "list") {
                        return (
                          <ul key={`${section.title}-${index}`} className="space-y-0.5 pl-8 mb-1">
                            {block.items.map((item) => (
                              <li key={item} className="flex items-start gap-2 leading-[15px]">
                                <span className="text-[#333]">•</span>
                                <span>{item}</span>
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

            {view === "main" && proTermsVisible && (
              <div className="border-t border-[#333]/10 pt-6 mb-12">
                <p className="text-[11px] font-medium text-[#333] tracking-[0.22px]">
                  <button
                    type="button"
                    onClick={() => setProTermsModalView("pro-en")}
                    className="underline decoration-[#333]/30 underline-offset-2 transition-colors hover:text-[#f14110] hover:decoration-[#f14110]"
                  >
                    Pro Terms of Services
                  </button>
                  <span className="text-[#333]/45"> / </span>
                  <button
                    type="button"
                    onClick={() => setProTermsModalView("pro-id")}
                    className="underline decoration-[#333]/30 underline-offset-2 transition-colors hover:text-[#f14110] hover:decoration-[#f14110]"
                  >
                    Ketentuan Penggunaan Pro
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {proTermsModalView && (
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
                            <ul key={`${section.title}-${index}`} className="space-y-0.5 pl-8 mb-1">
                              {block.items.map((item) => (
                                <li key={item} className="flex items-start gap-2 leading-[15px]">
                                  <span className="text-[#333]">•</span>
                                  <span>{item}</span>
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

      <Footer />
    </div>
  );
}
