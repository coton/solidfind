"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdBanner } from "@/components/AdBanner";

// Mock data for the profile
const mockProfile = {
  id: "1",
  name: "Company name Company name Company name Company name Company name",
  phone: "+62 812 463 4536",
  website: "www.example.com",
  since: 2021,
  projects: 75,
  team: 25,
  saves: 25,
  rating: 4.5,
  reviewCount: 75,
  address:
    "Jl. Imam Bonjol No.198/249, Pemecutan Klod, Kec. Denpasar Bar., Kota Denpasar, Bali 80119",
  about: `I Gusti Ngurah Andri Saputra, a proud Balinese architect, founded Lumbung Architect in 2010. After earning his architecture degree from Udayana University (2004-2008), he improved his skills with local firms and gained international experience working with architects from France and Australia.

These diverse experiences shaped his design philosophy, which remains grounded in Balinese traditions. Driven by memories of his childhood home, I Gusti Ngurah Andri Saputra finds joy in creating buildings that support connections and friendships between clients. Inspired by the warmth of family, he took a career in architecture to help people find their perfect living environments.Lumbung Architect, based in Bali, now employs around 67 professionals. Lumbung Architect, based in Bali, now employs around 67 professionals.I Gusti Ngurah Andri Saputra.`,
  services: {
    projectSize: ["Solo / Couple", "Family / Co-Hosting", "Shared / Community"],
    construction: ["Residential", "Commercial", "Hospitality"],
    renovation: [
      "Whole House",
      "Bathroom",
      "Bedroom",
      "Living room",
      "Electricity",
      "Roof",
      "Pool",
      "Mold",
      "Tiling",
      "Painting",
      "Fencing",
    ],
    location: ["Bali"],
  },
  photos: Array(12).fill(null),
  reviews: [
    { name: "User Name", rating: 5, text: "fdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;w", date: "2026/01/13" },
    { name: "User Name", rating: 5, text: "fdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;w", date: "2026/01/13" },
    { name: "User Name", rating: 5, text: "fdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;w", date: "2026/01/13" },
    { name: "User Name", rating: 5, text: "fdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;wfdkgbfgb;w", date: "2026/01/13" },
  ],
  isPro: true,
};

function ReviewCard({ name, text, date }: { name: string; rating?: number; text: string; date: string }) {
  return (
    <div className="w-[210px]">
      <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-2">{name}</p>
      <div className="flex items-center gap-1.5 mb-2">
        {Array(5).fill(null).map((_, i) => (
          <Image key={i} src="/images/icon-star.svg" alt="" width={14} height={14} />
        ))}
      </div>
      <p className="text-[10px] text-[#333] leading-[18px] tracking-[0.2px] mb-2 line-clamp-4">{text}</p>
      <p className="text-[9px] text-[#333]/35 font-mono">{date}</p>
    </div>
  );
}

export default function ProfilePage() {
  const [isSaved, setIsSaved] = useState(false);
  const profile = mockProfile;

  return (
    <div className="min-h-screen bg-[#e4e4e4]">
      <Header />

      <main className="max-w-[900px] mx-auto px-6 py-8">
        {/* Back Button Row */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#333]/10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#333] tracking-[0.22px] hover:text-[#f14110] transition-colors"
          >
            <span>←</span> BACK
          </Link>

          {/* Pro Account Badge */}
          {profile.isPro && (
            <div className="flex items-center gap-1">
              <Image src="/images/icon-sponsored.svg" alt="" width={20} height={20} />
              <div className="bg-[#e4e4e4] rounded-[10px] px-3 py-1">
                <span className="text-[9px] text-[#333]/35 font-medium">Pro Account</span>
              </div>
            </div>
          )}
        </div>

        {/* Company Name */}
        <h1 className="text-[26px] font-semibold text-[#333] leading-[30px] mb-6 max-w-[440px]">
          {profile.name}
        </h1>

        {/* Main Content Grid */}
        <div className="grid grid-cols-[210px_210px_1fr_70px] gap-5 mb-8">
          {/* Column 1: Logo */}
          <div>
            <div
              className="w-[210px] h-[210px] rounded-[6px] bg-[#d8d8d8]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='10' height='10' fill='%23ccc'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23ccc'/%3E%3C/svg%3E")`,
                backgroundSize: '20px 20px'
              }}
            />
          </div>

          {/* Column 2: Contact Info */}
          <div>
            {/* Phone */}
            <div className="border-b border-[#333]/20 pb-2 mb-3">
              <p className="text-[11px] font-medium text-[#333] tracking-[0.22px]">
                Tel. {profile.phone}
              </p>
            </div>

            {/* Website */}
            <div className="border-b border-[#333]/20 pb-2 mb-4">
              <p className="text-[11px] font-medium text-[#333] tracking-[0.22px]">
                WEBSITE
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-5 mb-6">
              {/* Mail */}
              <button className="text-[#333] hover:text-[#f14110] transition-colors">
                <svg width="24" height="19" viewBox="0 0 24 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 0H2C0.9 0 0 0.9 0 2V16C0 17.1 0.9 18 2 18H22C23.1 18 24 17.1 24 16V2C24 0.9 23.1 0 22 0ZM22 4L12 10L2 4V2L12 8L22 2V4Z" fill="currentColor"/>
                </svg>
              </button>
              {/* WhatsApp */}
              <button className="text-[#333] hover:text-[#f14110] transition-colors">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.05 3.05C15.15 1.15 12.65 0 10 0C4.5 0 0 4.5 0 10C0 11.75 0.5 13.45 1.35 14.9L0 20L5.25 18.7C6.65 19.45 8.3 19.9 10 19.9C15.5 19.9 20 15.4 20 9.9C20 7.35 18.95 4.95 17.05 3.05ZM10 18.25C8.45 18.25 6.95 17.85 5.65 17.1L5.35 16.9L2.3 17.7L3.15 14.75L2.9 14.4C2.05 13.05 1.6 11.5 1.6 9.95C1.6 5.35 5.35 1.6 9.95 1.6C12.15 1.6 14.25 2.45 15.8 4.05C17.4 5.6 18.3 7.75 18.25 9.95C18.35 14.6 14.6 18.25 10 18.25Z" fill="currentColor"/>
                </svg>
              </button>
              {/* Instagram */}
              <button className="text-[#333] hover:text-[#f14110] transition-colors">
                <Image src="/images/icon-ig.svg" alt="Instagram" width={20} height={20} className="invert" />
              </button>
              {/* Facebook */}
              <button className="text-[#333] hover:text-[#f14110] transition-colors">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 11H14L15 7H11V5C11 3.97 11 3 13 3H15V0.14C14.69 0.1 13.39 0 12.01 0C9.12 0 7 1.66 7 4.7V7H4V11H7V20H11V11Z" fill="currentColor"/>
                </svg>
              </button>
              {/* LinkedIn */}
              <button className="text-[#333] hover:text-[#f14110] transition-colors">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 0H2C0.9 0 0 0.9 0 2V18C0 19.1 0.9 20 2 20H18C19.1 20 20 19.1 20 18V2C20 0.9 19.1 0 18 0ZM6 17H3V8H6V17ZM4.5 6.3C3.5 6.3 2.7 5.5 2.7 4.5C2.7 3.5 3.5 2.7 4.5 2.7C5.5 2.7 6.3 3.5 6.3 4.5C6.3 5.5 5.5 6.3 4.5 6.3ZM17 17H14V12.5C14 11.4 13.1 10.5 12 10.5C10.9 10.5 10 11.4 10 12.5V17H7V8H10V9.2C10.5 8.4 11.6 7.8 12.8 7.8C15.1 7.8 17 9.7 17 12V17Z" fill="currentColor"/>
                </svg>
              </button>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2">
              <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5 flex-shrink-0 text-[#333]">
                <path d="M8 0C3.58 0 0 3.58 0 8C0 14 8 20 8 20C8 20 16 14 16 8C16 3.58 12.42 0 8 0ZM8 11C6.34 11 5 9.66 5 8C5 6.34 6.34 5 8 5C9.66 5 11 6.34 11 8C11 9.66 9.66 11 8 11Z" fill="currentColor"/>
              </svg>
              <p className="text-[9px] text-[#333]/50 leading-[12px] font-mono">
                {profile.address}
              </p>
            </div>
          </div>

          {/* Column 3: Stats + About */}
          <div>
            {/* Stats */}
            <div className="mb-6">
              {/* Projects */}
              <div className="flex items-center justify-between border-b border-[#333]/20 py-1">
                <span className="text-[11px] font-medium text-[#333] tracking-[0.22px]">Projects</span>
                <span className="text-[18px] font-semibold text-[#333] tracking-[0.36px]">+{profile.projects}</span>
              </div>
              {/* Team */}
              <div className="flex items-center justify-between border-b border-[#333]/20 py-1">
                <span className="text-[11px] font-medium text-[#333] tracking-[0.22px]">Team</span>
                <span className="text-[18px] font-semibold text-[#333] tracking-[0.36px]">+{profile.team}</span>
              </div>
              {/* Since */}
              <div className="flex items-center justify-between border-b border-[#333]/20 py-1">
                <span className="text-[11px] font-medium text-[#333] tracking-[0.22px]">Since</span>
                <span className="text-[18px] font-semibold text-[#333] tracking-[0.36px]">{profile.since}</span>
              </div>
            </div>

            {/* About */}
            <p className="text-[10px] text-[#333] leading-[18px] tracking-[0.2px] whitespace-pre-line">
              {profile.about}
            </p>
          </div>

          {/* Column 4: Save/Share/Report */}
          <div className="flex flex-col items-end gap-4">
            {/* Save */}
            <button
              onClick={() => setIsSaved(!isSaved)}
              className="flex items-center gap-2 text-[#333]/35 hover:text-[#f14110] transition-colors"
            >
              <span className="text-[9px] font-mono">{profile.saves} Saves</span>
              <Image
                src="/images/icon-bookmark.svg"
                alt="Save"
                width={15}
                height={20}
                className={isSaved ? 'opacity-100' : 'opacity-60'}
              />
            </button>

            {/* Share */}
            <button className="flex items-center gap-2 text-[#333]/35 hover:text-[#f14110] transition-colors">
              <span className="text-[9px] font-mono">Share</span>
              <svg width="15" height="20" viewBox="0 0 15 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 0V12M7.5 0L3 4.5M7.5 0L12 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 9V17C1 17.5523 1.44772 18 2 18H13C13.5523 18 14 17.5523 14 17V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Report */}
            <button className="flex items-center gap-2 text-[#333]/35 hover:text-[#f14110] transition-colors">
              <span className="text-[9px] font-mono">Report</span>
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1V17M1 1H11L15 5V13L11 17H1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 6V10M8 13V13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Photos Grid + Services */}
        <div className="grid grid-cols-[440px_1fr] gap-5 mb-8">
          {/* Photos Grid - 4x3 */}
          <div className="grid grid-cols-4 gap-5">
            {profile.photos.map((_, index) => (
              <div
                key={index}
                className="w-[95px] h-[95px] rounded-[6px] bg-[#d8d8d8]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='10' height='10' fill='%23ccc'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23ccc'/%3E%3C/svg%3E")`,
                  backgroundSize: '10px 10px'
                }}
              />
            ))}
          </div>

          {/* Services Tags */}
          <div className="space-y-4">
            <p className="text-[9px] text-[#333] font-mono">Services provided:</p>

            {/* Project Size */}
            <div>
              <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">PROJECT SIZE</p>
              <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">
                {profile.services.projectSize.join(", ")}
              </p>
            </div>

            {/* Construction */}
            <div>
              <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">CONSTRUCTION</p>
              <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">
                {profile.services.construction.join(", ")}
              </p>
            </div>

            {/* Renovation */}
            <div>
              <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">RENOVATION</p>
              <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">
                {profile.services.renovation.join(", ")}
              </p>
            </div>

            {/* Location */}
            <div>
              <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">LOCATION</p>
              <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">
                {profile.services.location.join(", ")}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-8">
          {/* Reviews Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[11px] font-medium text-[#333] tracking-[0.22px]">Latest reviews /</p>
                <p className="text-[11px] font-medium text-[#333] tracking-[0.22px]">Ulasan terbaru</p>
              </div>
              <div className="flex items-center gap-1">
                <Image src="/images/icon-star.svg" alt="" width={18} height={18} />
                <span className="text-[26px] font-semibold text-[#f14110] tracking-[0.52px]">{profile.rating}</span>
                <span className="text-[10px] text-[#f14110]/70 tracking-[0.2px]">({profile.reviewCount})</span>
              </div>
            </div>
            <button className="h-[40px] px-6 rounded-full border border-[#333] text-[11px] font-medium text-[#333] tracking-[0.22px] hover:bg-[#333] hover:text-white transition-colors">
              See all
            </button>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-4 gap-5">
            {profile.reviews.map((review, index) => (
              <ReviewCard key={index} {...review} />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button className="text-[11px] font-semibold text-[#333] tracking-[0.22px] hover:text-[#f14110] transition-colors">
            ← PREVIOUS
          </button>
          <button className="text-[11px] font-semibold text-[#333] tracking-[0.22px] hover:text-[#f14110] transition-colors">
            NEXT →
          </button>
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
