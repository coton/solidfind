"use client";

import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function AboutPage() {
  // Dynamic content from admin UI tab
  const tagline = useQuery(api.platformSettings.get, { key: "aboutPageTagline" });
  const description = useQuery(api.platformSettings.get, { key: "aboutPageDescription" });
  const individual = useQuery(api.platformSettings.get, { key: "aboutPageIndividual" });
  const freeCompany = useQuery(api.platformSettings.get, { key: "aboutPageFreeCompany" });
  const proCompany = useQuery(api.platformSettings.get, { key: "aboutPageProCompany" });
  const contact = useQuery(api.platformSettings.get, { key: "aboutPageContact" });
  const email = useQuery(api.platformSettings.get, { key: "aboutPageEmail" });
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "SOLIDFIND.ID", url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      <Header />

      <main className="max-w-[900px] mx-auto px-4 sm:px-0 py-6 sm:py-8 flex-grow w-full">
        {/* Back + Share Row — consistent with profile page */}
        <div className="flex items-center justify-between mb-3 py-2 border-b border-[#333]/10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#333] tracking-[0.22px] hover:text-[#f14110] transition-colors"
          >
            <svg width="8" height="5" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <path d="M1 5H15M1 5L5 1M1 5L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>BACK</span>
          </Link>

          <button onClick={handleShare} className="group flex items-center gap-2 text-[#333]/35 transition-colors relative">
            <span className="font-bam text-[9px]">Share</span>
            <svg width="8" height="5" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:stroke-[#f14110] transition-colors">
              <path d="M4 1L9 1L9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-[#333]/35 group-hover:stroke-[#f14110]"/>
              <path d="M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-[#333]/35 group-hover:stroke-[#f14110]"/>
            </svg>
          </button>
        </div>

        {/* Title */}
        <h1 className="text-[24px] sm:text-[32px] font-bold text-[#333] tracking-[0.64px] mb-6 sm:mb-8">SOLIDFIND.ID</h1>

        {/* About Content - Mobile: stack, Desktop: side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-12 mb-8 sm:mb-12">
          {/* Left Column */}
          <div className="flex flex-col items-center lg:items-start">
            {/* Logo */}
            <div className="w-[180px] sm:w-[200px] h-[180px] sm:h-[200px] rounded-[6px] mb-4 bg-[#f8f8f8] flex items-center justify-center p-6 sm:p-8">
              <Image 
                src="/images/logo-full.svg" 
                alt="SOLIDFIND.ID Logo" 
                width={175} 
                height={19}
                className="w-full h-auto"
              />
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <button className="text-[#333] hover:opacity-70 transition-opacity">
                <svg width="24" height="19" viewBox="0 0 24 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 1H2C1.44772 1 1 1.44772 1 2V17C1 17.5523 1.44772 18 2 18H22C22.5523 18 23 17.5523 23 17V2C23 1.44772 22.5523 1 22 1Z" stroke="#333" strokeWidth="1.5"/>
                  <path d="M1 2L12 11L23 2" stroke="#333" strokeWidth="1.5"/>
                </svg>
              </button>
              <button className="text-[#333] hover:opacity-70 transition-opacity">
                <Image src="/images/icon-ig.svg" alt="Instagram" width={20} height={20} className="invert" />
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Tagline */}
            <p className="text-[14px] font-semibold text-[#333] mb-4">
              {tagline || "A clearer way to build and live in Indonesia."}
            </p>

            {/* About Description */}
            <div className="space-y-4 text-[11px] text-[#333]/70 leading-[16px] tracking-[0.22px]" style={{ whiteSpace: "pre-wrap" }}>
              {description ? (
                <p>{description}</p>
              ) : (
                <>
                  <p>
                    Building, renovating, or choosing a home is one of the most important
                    decisions people make — yet reliable information and trustworthy contacts are often hard to find.{" "}
                    <span className="font-semibold text-[#333]">
                      SOLIDFIND.ID exists to bring clarity, structure, and confidence to that process.
                    </span>
                  </p>

                  <p>SOLIDFIND.ID is built for people who are:</p>
                  <ul className="space-y-1 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-[#333]">•</span>
                      <span>planning to build or renovate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#333]">•</span>
                      <span>looking for professionals they can trust</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#333]">•</span>
                      <span>trying to make informed decisions in a complex environment</span>
                    </li>
                  </ul>
                </>
              )}
            </div>

            {/* Account Types */}
            <div className="mt-8 space-y-4">
              <h3 className="text-[12px] font-semibold text-[#333] tracking-[0.24px] mb-2">
                How it works
              </h3>

              <div className="p-3 bg-white rounded-[6px]">
                <h4 className="text-[11px] font-semibold text-[#333] uppercase tracking-[0.22px] mb-1">
                  INDIVIDUAL ACCOUNT
                </h4>
                <p className="text-[10px] text-[#333]/70 tracking-[0.2px] leading-[16px]">
                  {individual || "For property owners & renters — browse listings, bookmark companies, write reviews, and find the right professionals for your project. Choose your household type: Solo / Couple, Family / Co-Hosting, or Shared / Community."}
                </p>
              </div>

              <div className="p-3 bg-white rounded-[6px]">
                <h4 className="text-[11px] font-semibold text-[#333] uppercase tracking-[0.22px] mb-1">
                  FREE COMPANY ACCOUNT
                </h4>
                <p className="text-[10px] text-[#333]/70 tracking-[0.2px] leading-[16px]">
                  {freeCompany || "For construction & renovation professionals — create your company profile, showcase up to 3 project photos, receive reviews, and get discovered by potential clients across Bali."}
                </p>
              </div>

              <div className="p-3 bg-white rounded-[6px]">
                <h4 className="text-[11px] font-semibold text-[#333] uppercase tracking-[0.22px] mb-1">
                  PRO COMPANY ACCOUNT
                </h4>
                <p className="text-[10px] text-[#333]/70 tracking-[0.2px] leading-[16px]">
                  {proCompany || "Everything in Free, plus: top search ranking, AI search optimization, detailed analytics, 12 project photos, and access to premium ad space. Built for companies ready to grow."}
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="mt-8 pt-4 border-t border-[#e4e4e4]">
              <h3 className="text-[12px] font-semibold text-[#333] tracking-[0.24px] mb-2">
                Get in touch
              </h3>
              <p className="text-[11px] text-[#333]/70 tracking-[0.22px] leading-[18px]">
                {contact || "Questions, feedback, or partnership inquiries?"}
                <br />
                Reach us at{" "}
                <a href={`mailto:${email || "hello@solidfind.id"}`} className="text-[#f14110] hover:underline">
                  {email || "hello@solidfind.id"}
                </a>
              </p>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
