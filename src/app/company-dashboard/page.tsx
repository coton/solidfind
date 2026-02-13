"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Star } from "lucide-react";

// Mock data for company stats
const mockCompanyData = {
  name: "Company Name",
  accountType: "PRO",
  stats: {
    bookmarked: 75,
    viewsLastMonth: 725,
    mostSearchedLocation: "KARANGASEM",
  },
  monthlyViews: [
    { month: "January", views: 32 },
    { month: "February", views: 36 },
    { month: "March", views: 48 },
    { month: "April", views: 32 },
  ],
  rating: 4.5,
  reviewCount: 75,
  reviews: [
    {
      userName: "User Name",
      rating: 3,
      content: "fdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;w",
      date: "2026/01/13",
    },
    {
      userName: "User Name",
      rating: 5,
      content: "fdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;w",
      date: "2026/01/13",
    },
    {
      userName: "User Name",
      rating: 3,
      content: "fdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;w",
      date: "2026/01/13",
    },
    {
      userName: "User Name",
      rating: 5,
      content: "fdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;w",
      date: "2026/01/13",
    },
  ],
};

const proFeatures = [
  { icon: "star", title: "Top search ranking", subtitle: "Peringkat pencarian teratas" },
  { icon: "ai", title: "AI search optimisation", subtitle: "Optimasi pencarian AI" },
  { icon: "stats", title: "Statistics", subtitle: "Statistik" },
  { icon: "photos", title: "12 project pictures", subtitle: "12 gambar proyek" },
  { icon: "ad", title: "Possibility to buy ad space", subtitle: "Boleh untuk membeli iklan" },
];

function ReviewCard({ userName, rating, content, date }: {
  userName: string;
  rating: number;
  content: string;
  date: string;
}) {
  return (
    <div className="bg-white rounded-[6px] p-4">
      <p className="text-[12px] font-semibold text-[#333] mb-2">{userName}</p>
      <div className="flex gap-0.5 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= rating ? 'fill-[#f14110] text-[#f14110]' : 'fill-[#e4e4e4] text-[#e4e4e4]'}`}
          />
        ))}
      </div>
      <p className="text-[9px] text-[#333]/70 leading-[14px] mb-2 line-clamp-4">
        {content}
      </p>
      <p className="text-[9px] text-[#333]/40">{date}</p>
    </div>
  );
}

export default function CompanyDashboardPage() {
  const data = mockCompanyData;
  const maxViews = Math.max(...data.monthlyViews.map(m => m.views));

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <Header isLoggedIn={true} userType="company" />

      <main className="max-w-[900px] mx-auto px-6 py-8">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[32px] font-bold text-[#333] tracking-[0.64px] mb-2">
              Company profile
            </h1>
            <p className="text-[11px] text-[#333]/70 tracking-[0.22px]">
              Here are the latest statistics about your company page. Check the latest reviews.
            </p>
          </div>

          <div className="text-right">
            <p className="text-[11px] text-[#f14110] font-medium tracking-[0.22px] mb-1">
              PRO ACCOUNT
            </p>
            <button className="text-[11px] text-[#333] underline tracking-[0.22px] hover:text-[#f14110]">
              DELETE PROFILE
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button className="h-10 px-6 rounded-full border border-[#f14110] text-[#f14110] text-[11px] font-medium tracking-[0.22px] hover:bg-[#f14110] hover:text-white transition-colors">
            Get AD space
          </button>
          <button className="h-10 px-6 rounded-full bg-[#333] text-white text-[11px] font-medium tracking-[0.22px] hover:bg-[#444] transition-colors">
            Edit profile
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* Bookmarked */}
          <div>
            <p className="text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
              Company bookmarked /
            </p>
            <p className="text-[10px] text-[#333]/70 tracking-[0.2px] mb-2">
              Perusahaan favorit sebanyak
            </p>
            <p className="text-[32px] font-bold text-[#f14110] tracking-[0.64px]">
              {data.stats.bookmarked}
              <span className="text-[14px] font-normal ml-1">Times</span>
            </p>
          </div>

          {/* Views Last Month */}
          <div>
            <p className="text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
              View within the last month /
            </p>
            <p className="text-[10px] text-[#333]/70 tracking-[0.2px] mb-2">
              Lihat dalam sebulan terakhir
            </p>
            <p className="text-[32px] font-bold text-[#f14110] tracking-[0.64px]">
              {data.stats.viewsLastMonth}
              <span className="text-[14px] font-normal ml-1">Views</span>
            </p>
          </div>

          {/* Most Searched Location */}
          <div>
            <p className="text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
              Most frequent location searched/
            </p>
            <p className="text-[10px] text-[#333]/70 tracking-[0.2px] mb-2">
              Lokasi yang paling sering lokasi
            </p>
            <p className="text-[24px] font-bold text-[#f14110] tracking-[0.48px]">
              {data.stats.mostSearchedLocation}
            </p>
          </div>

          {/* PRO Features */}
          <div className="bg-white rounded-[6px] p-4">
            <p className="text-[9px] text-[#333]/50 tracking-[0.18px] mb-3">
              Services included with PRO account
              <br />
              Layanan dengan akun PRO
            </p>
            <div className="space-y-2">
              {proFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center text-[#f14110]">
                    {feature.icon === "star" && <Star className="w-4 h-4" />}
                    {feature.icon === "ai" && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0L10 6L16 8L10 10L8 16L6 10L0 8L6 6L8 0Z"/>
                      </svg>
                    )}
                    {feature.icon === "stats" && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="1" y="8" width="3" height="7"/>
                        <rect x="6" y="4" width="3" height="11"/>
                        <rect x="11" y="1" width="3" height="14"/>
                      </svg>
                    )}
                    {feature.icon === "photos" && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="1" y="3" width="14" height="10" rx="1"/>
                        <circle cx="5" cy="7" r="1.5"/>
                        <path d="M4 11L7 8L9 10L12 7L14 9V12H2V11H4Z"/>
                      </svg>
                    )}
                    {feature.icon === "ad" && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="1" y="1" width="14" height="14" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M4 11L8 5L12 11H4Z"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-[9px] font-medium text-[#333] tracking-[0.18px]">{feature.title}</p>
                    <p className="text-[8px] text-[#333]/50 tracking-[0.16px]">{feature.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full h-8 rounded-full bg-[#333] text-white text-[10px] font-medium tracking-[0.2px] hover:bg-[#444] transition-colors">
              See all
            </button>
          </div>
        </div>

        {/* Monthly Views Chart */}
        <div className="mb-8">
          <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">
            This Month views /
          </p>
          <p className="text-[11px] text-[#333]/70 tracking-[0.22px] mb-4">
            Jumlah tayangan bulan ini
          </p>
          <div className="bg-white rounded-[6px] p-4">
            <div className="space-y-3">
              {data.monthlyViews.map((item) => (
                <div key={item.month} className="flex items-center gap-4">
                  <span className="text-[10px] text-[#333]/70 w-16 tracking-[0.2px]">{item.month}</span>
                  <div className="flex-1 h-4 bg-[#f8f8f8] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(item.views / maxViews) * 100}%`,
                        background: "linear-gradient(to right, #e9a28e, #f14110)"
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-[#333]/70 w-8 text-right tracking-[0.2px]">{item.views}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div>
              <p className="text-[11px] font-medium text-[#333] tracking-[0.22px]">
                Latest reviews /
              </p>
              <p className="text-[11px] text-[#333]/70 tracking-[0.22px]">
                Ulasan terbaru
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-[#f14110] text-[#f14110]" />
              <span className="text-[16px] font-bold text-[#f14110]">{data.rating}</span>
              <span className="text-[12px] text-[#333]/50">({data.reviewCount})</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {data.reviews.map((review, index) => (
              <ReviewCard key={index} {...review} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
