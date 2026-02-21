"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Star, Check, X } from "lucide-react";

const proFeatures = [
  {
    icon: "star",
    title: "Top search ranking",
    subtitle: "Peringkat pencarian teratas",
    description: "Your company appears first in search results, maximizing your visibility to potential clients.",
  },
  {
    icon: "ai",
    title: "AI search optimisation",
    subtitle: "Optimasi pencarian AI",
    description: "Your profile is optimized for AI-powered search, helping clients find you through natural language queries.",
  },
  {
    icon: "stats",
    title: "Statistics & Analytics",
    subtitle: "Statistik dan Analitik",
    description: "Track your profile views, bookmark count, and most-searched locations to understand your audience.",
  },
  {
    icon: "photos",
    title: "12 project pictures",
    subtitle: "12 gambar proyek",
    description: "Showcase up to 12 project photos instead of 3 — let your work speak for itself.",
  },
  {
    icon: "ad",
    title: "Possibility to buy ad space",
    subtitle: "Boleh untuk membeli iklan",
    description: "Access premium ad placements across the site for maximum brand exposure.",
  },
];

export default function UpgradePage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [showComingSoon, setShowComingSoon] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      <Header />

      <main className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-grow w-full">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <Link
            href="/company-dashboard"
            className="inline-flex items-center gap-2 text-[11px] text-[#333]/50 hover:text-[#333] transition-colors tracking-[0.22px]"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO DASHBOARD
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#333] tracking-[0.64px] mb-2">
            Upgrade to PRO
          </h1>
          <p className="text-[12px] sm:text-[14px] text-[#333]/70 max-w-[500px] mx-auto">
            Stand out from the competition with premium features designed to grow your business in Bali.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="flex items-center justify-center gap-6 sm:gap-8 mb-10">
          {/* Monthly */}
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`relative rounded-[6px] p-6 sm:p-8 text-center transition-all w-[200px] ${
              billingCycle === "monthly"
                ? "bg-white shadow-lg ring-2 ring-[#f14110]"
                : "bg-white/60 hover:bg-white"
            }`}
          >
            {billingCycle === "monthly" && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f14110] text-white text-[8px] font-bold tracking-[0.16px] px-3 py-1 rounded-full">
                SELECTED
              </div>
            )}
            <p className="text-[32px] font-bold text-[#333]">
              $29
            </p>
            <p className="text-[11px] text-[#333]/50 tracking-[0.22px]">per month</p>
            <p className="text-[9px] text-[#333]/40 mt-1">650.000 rp / Bulan</p>
          </button>

          {/* Yearly */}
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`relative rounded-[6px] p-6 sm:p-8 text-center transition-all w-[200px] ${
              billingCycle === "yearly"
                ? "bg-white shadow-lg ring-2 ring-[#f14110]"
                : "bg-white/60 hover:bg-white"
            }`}
          >
            {billingCycle === "yearly" && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f14110] text-white text-[8px] font-bold tracking-[0.16px] px-3 py-1 rounded-full">
                SELECTED
              </div>
            )}
            <div className="absolute -top-3 -right-2 bg-[#333] text-white text-[7px] font-bold tracking-[0.14px] px-2 py-0.5 rounded-full">
              SAVE 43%
            </div>
            <p className="text-[32px] font-bold text-[#333]">
              $199
            </p>
            <p className="text-[11px] text-[#333]/50 tracking-[0.22px]">per year</p>
            <p className="text-[9px] text-[#333]/40 mt-1">~7 jt / Tahun</p>
          </button>
        </div>

        {/* Features List */}
        <div className="max-w-[600px] mx-auto mb-10">
          <h2 className="text-[14px] font-semibold text-[#333] tracking-[0.28px] mb-6 text-center">
            Everything included with PRO
          </h2>

          <div className="space-y-4">
            {proFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-white rounded-[6px]"
              >
                <div className="w-8 h-8 rounded-full bg-[#f14110]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {feature.icon === "star" && <Star className="w-4 h-4 text-[#f14110]" />}
                  {feature.icon === "ai" && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="#f14110">
                      <path d="M8 0L10 6L16 8L10 10L8 16L6 10L0 8L6 6L8 0Z"/>
                    </svg>
                  )}
                  {feature.icon === "stats" && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="#f14110">
                      <rect x="1" y="8" width="3" height="7"/>
                      <rect x="6" y="4" width="3" height="11"/>
                      <rect x="11" y="1" width="3" height="14"/>
                    </svg>
                  )}
                  {feature.icon === "photos" && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="#f14110">
                      <rect x="1" y="3" width="14" height="10" rx="1"/>
                      <circle cx="5" cy="7" r="1.5"/>
                      <path d="M4 11L7 8L9 10L12 7L14 9V12H2V11H4Z"/>
                    </svg>
                  )}
                  {feature.icon === "ad" && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#f14110" strokeWidth="1.5">
                      <rect x="1" y="1" width="14" height="14" rx="1"/>
                      <path d="M5 10L8 6L11 10" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-[#333]">{feature.title}</p>
                  <p className="text-[10px] text-[#333]/50 mb-1">{feature.subtitle}</p>
                  <p className="text-[10px] text-[#333]/70 leading-[16px]">{feature.description}</p>
                </div>
                <Check className="w-4 h-4 text-[#f14110] flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pb-8">
          <button
            onClick={() => setShowComingSoon(true)}
            className="h-12 px-12 rounded-full bg-[#f14110] text-white text-[13px] font-medium tracking-[0.26px] hover:bg-[#d93a0e] transition-colors shadow-lg"
          >
            Upgrade to PRO — {billingCycle === "monthly" ? "$29/mo" : "$199/yr"}
          </button>
          <p className="text-[9px] text-[#333]/40 mt-3">
            Secure payment via Stripe. Cancel anytime.
          </p>
        </div>
      </main>

      <Footer />

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowComingSoon(false)} />
          <div className="relative bg-white w-full max-w-[440px] rounded-[6px] p-8 text-center">
            <button
              onClick={() => setShowComingSoon(false)}
              className="absolute top-4 right-4 text-[#333]/50 hover:text-[#333]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-full bg-[#f14110]/10 flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-[#f14110]" />
            </div>
            <h3 className="text-[20px] font-bold text-[#333] mb-2">Coming Soon!</h3>
            <p className="text-[12px] text-[#333]/70 mb-1">
              Online payment will be available shortly.
            </p>
            <p className="text-[12px] text-[#333]/70 mb-6">
              Pembayaran online akan segera tersedia.
            </p>
            <p className="text-[11px] text-[#333]/50 mb-4">
              In the meantime, contact us to upgrade:
            </p>
            <a
              href="mailto:hello@solidfind.id"
              className="inline-flex items-center h-10 px-8 rounded-full border-2 border-[#f14110] text-[#f14110] text-[12px] font-medium tracking-[0.24px] hover:bg-[#f14110] hover:text-white transition-colors"
            >
              hello@solidfind.id
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
