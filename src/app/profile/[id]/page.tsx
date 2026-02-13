"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdBanner } from "@/components/AdBanner";
import { ArrowLeft } from "lucide-react";

// Mock data for the profile
const mockProfile = {
  id: "1",
  name: "ATELIER GENERATIONS VASUDEVA DESIGN EXTRA TEXT TEST",
  phone: "+62 812 463 4536",
  website: "www.example.com",
  since: 2021,
  projects: 75,
  team: 25,
  address:
    "Jl. Imam Bonjol No.194/249, Pemecutan Klod, Kec. Denpasar Bar., Kota Denpasar, Bali 80119",
  about: `I Gusti Ngurah Andri Saputra, a proud Balinese architect, founded Lumbung Architect in 2010. After earning his architecture degree from Udayana University (2004-2008), he improved his skills with local firms and gained international experience working with architects from France and Australia. These diverse experiences shaped his design philosophy, which remains grounded in Balinese traditions.

Driven by memories of his childhood home, I Gusti Ngurah Andri Saputra finds joy in creating buildings that support connections and friendships between clients. Inspired by the warmth of family, he took a career in architecture to help people find their perfect living environments.
Lumbung Architect, based in Bali, now employs around 67 professionals.`,
  services: {
    construction: ["Private Housing", "Hospitality", "Commercial Building"],
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
};

export default function ProfilePage() {
  const [isSaved, setIsSaved] = useState(false);
  const profile = mockProfile;

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <Header />

      <main className="max-w-[900px] mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] text-[#333]/50 hover:text-[#333] transition-colors tracking-[0.22px]"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK
          </Link>
        </div>

        {/* Profile Content */}
        <div className="bg-[#333] rounded-[6px] p-8 mb-8">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-6">
            <h1 className="text-[24px] font-bold text-[#f8f8f8] tracking-[0.48px] max-w-[500px] leading-[28px]">
              {profile.name}
            </h1>
            <div className="flex items-center gap-3">
              {/* Bookmark */}
              <button
                onClick={() => setIsSaved(!isSaved)}
                className="text-[#d8d8d8] hover:text-white transition-colors"
              >
                <Image
                  src="/images/icon-bookmark.svg"
                  alt="Save"
                  width={16}
                  height={22}
                  className={isSaved ? 'opacity-100' : 'opacity-60'}
                />
              </button>
              {/* Share */}
              <button className="text-[#d8d8d8] hover:text-white transition-colors">
                <svg width="17" height="22" viewBox="0 0 17 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.5 1V14M8.5 1L4 5.5M8.5 1L13 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1 11V19C1 19.5523 1.44772 20 2 20H15C15.5523 20 16 19.5523 16 19V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-[200px_1fr_1fr] gap-8">
            {/* Left Column - Logo & Contact */}
            <div>
              {/* Logo Placeholder */}
              <div
                className="w-[140px] h-[140px] rounded-[6px] mb-4"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='10' height='10' fill='%23555'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23555'/%3E%3C/svg%3E")`,
                  backgroundSize: '20px 20px'
                }}
              />

              {/* Phone */}
              <p className="text-[10px] text-[#d8d8d8] tracking-[0.2px] mb-2">
                Tel. {profile.phone}
              </p>

              {/* Website Label */}
              <p className="text-[10px] text-[#d8d8d8]/70 tracking-[0.2px] mb-2">
                WEBSITE
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-3 mb-4">
                <button className="text-[#d8d8d8] hover:text-white transition-colors">
                  <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V2C20 0.9 19.1 0 18 0ZM18 4L10 9L2 4V2L10 7L18 2V4Z" fill="currentColor"/>
                  </svg>
                </button>
                <button className="text-[#d8d8d8] hover:text-white transition-colors">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.05 3.05C15.15 1.15 12.65 0 10 0C4.5 0 0 4.5 0 10C0 11.75 0.5 13.45 1.35 14.9L0 20L5.25 18.7C6.65 19.45 8.3 19.9 10 19.9C15.5 19.9 20 15.4 20 9.9C20 7.35 18.95 4.95 17.05 3.05ZM10 18.25C8.45 18.25 6.95 17.85 5.65 17.1L5.35 16.9L2.3 17.7L3.15 14.75L2.9 14.4C2.05 13.05 1.6 11.5 1.6 9.95C1.6 5.35 5.35 1.6 9.95 1.6C12.15 1.6 14.25 2.45 15.8 4.05C17.4 5.6 18.3 7.75 18.25 9.95C18.35 14.6 14.6 18.25 10 18.25Z" fill="currentColor"/>
                  </svg>
                </button>
                <button className="text-[#d8d8d8] hover:text-white transition-colors">
                  <Image src="/images/icon-ig.svg" alt="Instagram" width={18} height={18} />
                </button>
                <button className="text-[#d8d8d8] hover:text-white transition-colors">
                  <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.5 6.5V4.5C6.5 3.95 6.95 3.5 7.5 3.5H8.5V0.5H6.5C4.29 0.5 2.5 2.29 2.5 4.5V6.5H0.5V9.5H2.5V17.5H6.5V9.5H8.5L9.5 6.5H6.5Z" fill="currentColor"/>
                  </svg>
                </button>
                <button className="text-[#d8d8d8] hover:text-white transition-colors">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 0H2C0.9 0 0 0.9 0 2V16C0 17.1 0.9 18 2 18H16C17.1 18 18 17.1 18 16V2C18 0.9 17.1 0 16 0ZM6 14H3V7H6V14ZM4.5 5.7C3.5 5.7 2.7 4.9 2.7 3.9C2.7 2.9 3.5 2.1 4.5 2.1C5.5 2.1 6.3 2.9 6.3 3.9C6.3 4.9 5.5 5.7 4.5 5.7ZM15 14H12V10.5C12 9.4 11.1 8.5 10 8.5C8.9 8.5 8 9.4 8 10.5V14H5V7H8V8.2C8.5 7.4 9.6 6.8 10.8 6.8C13.1 6.8 15 8.7 15 11V14Z" fill="currentColor"/>
                  </svg>
                </button>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 mb-6">
                <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5 flex-shrink-0">
                  <path d="M7 0C3.13 0 0 3.13 0 7C0 12.25 7 18 7 18C7 18 14 12.25 14 7C14 3.13 10.87 0 7 0ZM7 9.5C5.62 9.5 4.5 8.38 4.5 7C4.5 5.62 5.62 4.5 7 4.5C8.38 4.5 9.5 5.62 9.5 7C9.5 8.38 8.38 9.5 7 9.5Z" fill="#d8d8d8"/>
                </svg>
                <p className="text-[9px] text-[#d8d8d8]/70 leading-[14px] tracking-[0.18px]">
                  {profile.address}
                </p>
              </div>

              {/* Stats */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-[20px] font-bold text-[#f8f8f8]">{profile.projects}+</span>
                  <span className="text-[10px] text-[#d8d8d8]/70 tracking-[0.2px]">Projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[20px] font-bold text-[#f8f8f8]">{profile.team}+</span>
                  <span className="text-[10px] text-[#d8d8d8]/70 tracking-[0.2px]">Team</span>
                </div>
              </div>

              {/* Services */}
              <div className="space-y-4">
                <p className="text-[10px] text-[#d8d8d8]/70 tracking-[0.2px]">Services provided:</p>

                <div>
                  <p className="text-[10px] font-semibold text-[#d8d8d8] tracking-[0.2px] mb-1">CONSTRUCTION</p>
                  <p className="text-[9px] text-[#d8d8d8]/60 tracking-[0.18px]">
                    {profile.services.construction.join(", ")}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-[#d8d8d8] tracking-[0.2px] mb-1">RENOVATION</p>
                  <p className="text-[9px] text-[#d8d8d8]/60 tracking-[0.18px]">
                    {profile.services.renovation.join(", ")}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-[#d8d8d8] tracking-[0.2px] mb-1">LOCATION</p>
                  <p className="text-[9px] text-[#d8d8d8]/60 tracking-[0.18px]">
                    {profile.services.location.join(", ")}
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Column - About */}
            <div>
              <p className="text-[10px] text-[#d8d8d8]/80 leading-[16px] tracking-[0.2px] whitespace-pre-line">
                {profile.about}
              </p>
            </div>

            {/* Right Column - Photo Gallery */}
            <div>
              <div className="grid grid-cols-4 gap-2">
                {profile.photos.map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-[4px]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='10' height='10' fill='%23555'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23555'/%3E%3C/svg%3E")`,
                      backgroundSize: '10px 10px'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button className="text-[11px] text-[#333]/50 tracking-[0.22px] hover:text-[#333]">
            ← PREVIOUS
          </button>
          <button className="text-[11px] text-[#333] font-medium tracking-[0.22px] hover:text-[#f14110]">
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
