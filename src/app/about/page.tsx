"use client";

import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdBanner } from "@/components/AdBanner";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      <Header />

      <main className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-grow w-full">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] text-[#333]/50 hover:text-[#333] transition-colors tracking-[0.22px]"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK
          </Link>
        </div>

        {/* Title Row */}
        <div className="flex items-start justify-between mb-6 sm:mb-8">
          <h1 className="text-[24px] sm:text-[32px] font-bold text-[#333] tracking-[0.64px]">SOLIDFIND.ID</h1>
          {/* Share Button */}
          <button className="hover:opacity-70 transition-opacity">
            <svg width="17" height="22" viewBox="0 0 17 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.5 1V14M8.5 1L4 5.5M8.5 1L13 5.5" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 11V19C1 19.5523 1.44772 20 2 20H15C15.5523 20 16 19.5523 16 19V11" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

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
              A clearer way to build and live in Indonesia.
            </p>

            {/* About Description */}
            <div className="space-y-4 text-[11px] text-[#333]/70 leading-[16px] tracking-[0.22px]">
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
                  For property owners & renters — browse listings, bookmark companies, write reviews, and find the right professionals for your project. Choose your household type: Solo / Couple, Family / Co-Hosting, or Shared / Community.
                </p>
              </div>

              <div className="p-3 bg-white rounded-[6px]">
                <h4 className="text-[11px] font-semibold text-[#333] uppercase tracking-[0.22px] mb-1">
                  FREE COMPANY ACCOUNT
                </h4>
                <p className="text-[10px] text-[#333]/70 tracking-[0.2px] leading-[16px]">
                  For construction & renovation professionals — create your company profile, showcase up to 3 project photos, receive reviews, and get discovered by potential clients across Bali.
                </p>
              </div>

              <div className="p-3 bg-white rounded-[6px]">
                <h4 className="text-[11px] font-semibold text-[#333] uppercase tracking-[0.22px] mb-1">
                  PRO COMPANY ACCOUNT
                </h4>
                <p className="text-[10px] text-[#333]/70 tracking-[0.2px] leading-[16px]">
                  Everything in Free, plus: top search ranking, AI search optimization, detailed analytics, 12 project photos, and access to premium ad space. Built for companies ready to grow.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="mt-8 pt-4 border-t border-[#e4e4e4]">
              <h3 className="text-[12px] font-semibold text-[#333] tracking-[0.24px] mb-2">
                Get in touch
              </h3>
              <p className="text-[11px] text-[#333]/70 tracking-[0.22px] leading-[18px]">
                Questions, feedback, or partnership inquiries?
                <br />
                Reach us at{" "}
                <a href="mailto:hello@solidfind.id" className="text-[#f14110] hover:underline">
                  hello@solidfind.id
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Ad Banner */}
        <div className="mb-8">
          <AdBanner imageSrc="/images/ad-kini-resort.png" alt="Kini Resort" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
