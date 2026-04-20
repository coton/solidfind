"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import {
  DEFAULT_TERMS_TEXT,
  parseTermsContent,
  TERMS_TEXT_PLATFORM_SETTING_KEY,
} from "@/lib/terms-content.mjs";
import { resolveTextSetting } from "@/lib/platform-settings.mjs";

export default function TermsPage() {
  const termsText = useQuery(api.platformSettings.get, { key: TERMS_TEXT_PLATFORM_SETTING_KEY });
  const termsTextState = resolveTextSetting(termsText, DEFAULT_TERMS_TEXT);
  const sections = termsTextState.isLoading ? [] : parseTermsContent(termsTextState.value || DEFAULT_TERMS_TEXT);

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      <Header />

      <main className="max-w-[900px] mx-auto px-4 sm:px-0 py-8 flex-grow w-full">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] text-[#333]/50 hover:text-[#333] transition-colors tracking-[0.22px]"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK
          </Link>
        </div>

        <h1 className="text-[32px] font-bold text-[#333] tracking-[0.64px] mb-8">
          SOLIDFIND.ID Terms &amp; Conditions
        </h1>

        <div className="space-y-8 text-[11px] text-[#333]/70 leading-[14px] tracking-[0.22px] mb-12">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-[18px] font-semibold text-[#333] tracking-[0.36px] mb-3">
                {section.title}
              </h2>

              {section.blocks.map((block, index) => {
                if (block.type === "list") {
                  return (
                    <ul key={`${section.title}-${index}`} className="space-y-1 ml-4 mb-2">
                      {block.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="text-[#333]">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }

                return (
                  <p key={`${section.title}-${index}`} className="mb-2">
                    {block.content}
                  </p>
                );
              })}
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
