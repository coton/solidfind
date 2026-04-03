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
  const aboutProfilePicture = useQuery(api.platformSettings.get, { key: "aboutProfilePictureUrl" });
  const igUrl = useQuery(api.platformSettings.get, { key: "ig_url" });
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
        {/* Back row */}
        <div className="flex items-center mb-3 py-2 border-b border-[#333]/10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#333] tracking-[0.22px] hover:text-[#f14110] transition-colors"
          >
            <svg width="8" height="5" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <path d="M1 5H15M1 5L5 1M1 5L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>BACK</span>
          </Link>
        </div>

        {/* Title + Share (same row) */}
        <div className="flex items-start justify-between mb-6 sm:mb-8">
          <h1 className="text-[24px] sm:text-[32px] font-bold text-[#333] tracking-[0.64px]">SOLIDFIND.ID</h1>
          <button onClick={handleShare} className="group flex items-center gap-2 text-[#333]/35 transition-colors relative flex-shrink-0 mt-1">
            <span className="font-bam text-[9px]">Share</span>
            <svg width="15" height="20" viewBox="0 0 15.2353 20" fill="none" xmlns="http://www.w3.org/2000/svg"
              className="stroke-[#D8D8D8] group-hover:stroke-[#f14110] transition-colors"
              style={{ strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }}
            >
              <path d="M11.3071 8H12.7712C13.1595 8 13.5319 8.15444 13.8065 8.42936C14.081 8.70427 14.2353 9.07713 14.2353 9.46592V17.5341C14.2353 17.9229 14.081 18.2957 13.8065 18.5706C13.5319 18.8456 13.1595 19 12.7712 19H2.46408C2.07578 19 1.70339 18.8456 1.42882 18.5706C1.15425 18.2957 1 17.9229 1 17.5341V9.46592C1 9.07713 1.15425 8.70427 1.42882 8.42936C1.70339 8.15444 2.07578 8 2.46408 8H3.92816M10.5458 3.93183L7.61765 1M7.61765 1L4.68948 3.93183M7.61765 1V13.4682" />
            </svg>
          </button>
        </div>

        {/* About Content - Mobile: stack, Desktop: side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-12 mb-8 sm:mb-12">
          {/* Left Column */}
          <div className="flex flex-col items-center lg:items-start">
            {/* Logo */}
            <div className="w-[180px] sm:w-[200px] h-[180px] sm:h-[200px] rounded-[6px] mb-4 bg-[#f8f8f8] flex items-center justify-center p-6 sm:p-8 overflow-hidden">
              {aboutProfilePicture ? (
                (() => {
                  try {
                    const parsed = JSON.parse(aboutProfilePicture);
                    if (parsed.type === "video") {
                      return <video src={parsed.url} className="w-full h-full object-cover" muted autoPlay loop playsInline />;
                    }
                    return <Image src={parsed.url} alt="SOLIDFIND.ID Logo" fill className="object-cover" />;
                  } catch {
                    return <Image src={aboutProfilePicture} alt="SOLIDFIND.ID Logo" fill className="object-cover" />;
                  }
                })()
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

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {/* Mail icon - same as footer (25×20, stroke 1.5) */}
              <a href={`mailto:${email || "hello@solidfind.id"}`} className="text-[#333] hover:opacity-70 transition-opacity">
                <svg width="25" height="20" viewBox="0 0 25 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 2H1C0.447715 2 0 2.44772 0 3V17C0 17.5523 0.447715 18 1 18H24C24.5523 18 25 17.5523 25 17V3C25 2.44772 24.5523 2 24 2Z" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1 3L12.5 11L24 3" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              {/* IG icon - same as header (20×20, stroke 1.5) */}
              <a href={igUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-[#333] hover:opacity-70 transition-opacity">
                <Image src="/images/icon-ig.svg" alt="Instagram" width={20} height={20} />
              </a>
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
                  {individual || "For property owners & renters — browse listings, bookmark companies, write testimonials, and find the right professionals for your project. Choose your household type: Solo / Couple, Family / Co-Hosting, or Shared / Community."}
                </p>
              </div>

              <div className="p-3 bg-white rounded-[6px]">
                <h4 className="text-[11px] font-semibold text-[#333] uppercase tracking-[0.22px] mb-1">
                  FREE COMPANY ACCOUNT
                </h4>
                <p className="text-[10px] text-[#333]/70 tracking-[0.2px] leading-[16px]">
                  {freeCompany || "For construction & renovation professionals — create your company profile, showcase up to 3 project photos, receive testimonials, and get discovered by potential clients across Bali."}
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
