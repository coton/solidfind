"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
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
import { sanitizeNextPath } from "@/lib/magic-link-login.mjs";
import { useSearchParams } from "next/navigation";

type TermsView = "main" | "pro-en" | "pro-id";
type TermsLanguage = "en" | "id";

export default function TermsPage() {
  const searchParams = useSearchParams();
  const requestedView = searchParams.get("view");
  const view: TermsView =
    requestedView === "pro-en" || requestedView === "pro-id" ? requestedView : "main";
  const language: TermsLanguage =
    view === "pro-id" || (view === "main" && searchParams.get("lang") === "id") ? "id" : "en";
  const fromPath = sanitizeNextPath(searchParams.get("from"));
  const termsText = useQuery(api.platformSettings.get, { key: TERMS_TEXT_PLATFORM_SETTING_KEY });
  const termsTextIndonesian = useQuery(api.platformSettings.get, { key: TERMS_ID_TEXT_PLATFORM_SETTING_KEY });
  const proTermsEnglish = useQuery(api.platformSettings.get, { key: PRO_TERMS_EN_PLATFORM_SETTING_KEY });
  const proTermsIndonesian = useQuery(api.platformSettings.get, { key: PRO_TERMS_ID_PLATFORM_SETTING_KEY });
  const proEnabledValue = useQuery(api.platformSettings.get, { key: "pro_enabled" });
  const termsTextState = resolveTextSetting(termsText, DEFAULT_TERMS_TEXT);
  const termsTextIndonesianState = resolveTextSetting(termsTextIndonesian, DEFAULT_TERMS_ID_TEXT);
  const proTermsEnglishState = resolveTextSetting(proTermsEnglish, DEFAULT_PRO_TERMS_EN_TEXT);
  const proTermsIndonesianState = resolveTextSetting(proTermsIndonesian, DEFAULT_PRO_TERMS_ID_TEXT);
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
  const proTermsVisible = proEnabledValue === "true";
  const title =
    view === "pro-en"
      ? "Pro Terms of Services"
      : view === "pro-id"
        ? "Ketentuan Penggunaan Pro"
        : language === "id"
          ? "Syarat & Ketentuan SOLIDFIND.ID"
          : "SOLIDFIND.ID Terms & Conditions";
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

      <main className="max-w-[780px] mx-auto px-4 sm:px-0 py-8 flex-grow w-full">
        <div className="mb-6">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-[11px] text-[#333]/50 hover:text-[#333] transition-colors tracking-[0.22px]"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK
          </Link>
        </div>

        <div className="mb-8 flex items-start justify-between gap-4">
          <h1 className="text-[32px] font-bold text-[#333] tracking-[0.64px] leading-[36px]">
            {title}
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

        <div className="space-y-6 text-[11px] text-[#333]/70 leading-[15px] tracking-[0.22px] mb-12">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-[18px] font-semibold text-[#333] tracking-[0.36px] leading-[20px] mb-2">
                {section.title}
              </h2>

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
          ))}
        </div>

        {view === "main" && proTermsVisible && (
          <div className="border-t border-[#333]/10 pt-6 mb-12">
            <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-3">
              Pro Terms of Services /
              <br />
              Ketentuan Penggunaan Pro
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/terms?view=pro-en"
                className="h-9 px-5 rounded-full border border-[#333] text-[11px] font-medium text-[#333] tracking-[0.22px] hover:border-[#f14110] hover:text-[#f14110] transition-colors"
              >
                English
              </Link>
              <Link
                href="/terms?view=pro-id"
                className="h-9 px-5 rounded-full border border-[#333] text-[11px] font-medium text-[#333] tracking-[0.22px] hover:border-[#f14110] hover:text-[#f14110] transition-colors"
              >
                Indonesian
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
