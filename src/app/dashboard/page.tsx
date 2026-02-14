"use client";

import { useState } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ListingCard } from "@/components/cards";

// Mock saved listings data
const mockSavedConstruction = [
  {
    id: "1",
    name: "ATELIER GENERATIONS ASUDEVA DESIGN EXTRA TEXT TEST",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore consectetur do nsectetur[...]",
    rating: 4.5,
    isPro: true,
    isSaved: true,
  },
  {
    id: "2",
    name: "ATELIER GENERATIONS ASUDEVA DESIGN EXTRA TEXT TEST",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore consectetur do nsectetur[...]",
    rating: 4.5,
    isPro: true,
    isSaved: true,
  },
  {
    id: "3",
    name: "ATELIER GENERATIONS ASUDEVA DESIGN EXTRA TEXT TEST",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore consectetur do nsectetur[...]",
    rating: 4.5,
    isSaved: true,
  },
  {
    id: "4",
    name: "ATELIER GENERATIONS ASUDEVA DESIGN EXTRA TEXT TEST",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore consectetur do nsectetur[...]",
    rating: 4.5,
    isSaved: true,
  },
];

const mockSavedRenovation = [
  {
    id: "5",
    name: "ATELIER GENERATIONS ASUDEVA DESIGN EXTRA TEXT TEST",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore consectetur do nsectetur[...]",
    rating: 4.5,
    isPro: true,
    isSaved: true,
  },
  {
    id: "6",
    name: "ATELIER GENERATIONS ASUDEVA DESIGN EXTRA TEXT TEST",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore consectetur do nsectetur[...]",
    rating: 4.5,
    isSaved: true,
  },
  {
    id: "7",
    name: "ATELIER GENERATIONS ASUDEVA DESIGN EXTRA TEXT TEST",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore consectetur do nsectetur[...]",
    rating: 4.5,
    isSaved: true,
  },
  {
    id: "8",
    name: "ATELIER GENERATIONS ASUDEVA DESIGN EXTRA TEXT TEST",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore consectetur do nsectetur[...]",
    rating: 4.5,
    isPro: true,
    isSaved: true,
  },
];

export default function DashboardPage() {
  const [sortByConstruction, setSortByConstruction] = useState("latest");
  const [sortByRenovation, setSortByRenovation] = useState("latest");
  const [sortDropdownOpen, setSortDropdownOpen] = useState<string | null>(null);

  const { user: clerkUser } = useUser();

  // Use Clerk user data with fallback to mock
  const user = {
    name: clerkUser?.fullName || clerkUser?.firstName || "User name",
    email: clerkUser?.primaryEmailAddress?.emailAddress || "user@gmail.com",
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <Header />

      <main className="max-w-[900px] mx-auto px-6 py-8">
        {/* User Info Section */}
        <div className="flex items-start justify-between mb-8">
          {/* Left: User greeting */}
          <div>
            <p className="text-[11px] text-[#333]/70 tracking-[0.22px]">Hello</p>
            <h1 className="text-[32px] font-bold text-[#333] tracking-[0.64px]">{user.name}</h1>
            <p className="text-[10px] text-[#333]/70 leading-[14px] tracking-[0.2px] mt-2 max-w-[440px]">
              Find your list of saved profiles here. Add-remove profiles by clicking bookmark icon.
              <br />
              Temukan daftar profil yang Anda simpan di sini. Tambah-hapus profil dengan mengklik ikon bookmark.
            </p>
          </div>

          {/* Right: Account actions */}
          <div className="text-right">
            <p className="text-[11px] text-[#333] tracking-[0.22px] mb-1">{user.email}</p>
            <div className="flex items-center gap-2 justify-end mb-3">
              <button className="text-[11px] text-[#333] underline tracking-[0.22px] hover:text-[#f14110]">
                DELETE PROFILE
              </button>
              <SignOutButton>
                <button className="text-[11px] text-[#333] underline tracking-[0.22px] hover:text-[#f14110]">
                  LOG OUT
                </button>
              </SignOutButton>
            </div>
            <button className="h-10 px-6 rounded-full border border-[#f14110] text-[#f14110] text-[11px] font-medium tracking-[0.22px] hover:bg-[#f14110] hover:text-white transition-colors">
              Your reviews
            </button>
          </div>
        </div>

        {/* Construction Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-4">
              <h2 className="text-[24px] font-bold text-[#333] tracking-[0.48px]">CONSTRUCTION</h2>
              <span className="text-[11px] text-[#333]/50 tracking-[0.22px]">
                {mockSavedConstruction.length.toString().padStart(2, '0')} Listings Saved
              </span>
            </div>
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortDropdownOpen(sortDropdownOpen === 'construction' ? null : 'construction')}
                className="flex items-center gap-2 text-[11px] text-[#333]/70 tracking-[0.22px]"
              >
                Sort by: <span className="text-[#f14110] font-medium">{sortByConstruction === 'latest' ? 'Latest' : 'Favorite'}</span>
                <svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L4 4L7 1" stroke="#f14110" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {sortDropdownOpen === 'construction' && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSortDropdownOpen(null)} />
                  <div className="absolute top-full right-0 mt-1 bg-white rounded-[6px] shadow-lg z-50 py-2 min-w-[120px]">
                    <button
                      onClick={() => { setSortByConstruction('latest'); setSortDropdownOpen(null); }}
                      className={`w-full text-left px-4 py-2 text-[11px] tracking-[0.22px] hover:bg-[#f8f8f8] ${sortByConstruction === 'latest' ? 'text-[#f14110]' : 'text-[#333]'}`}
                    >
                      Latest
                    </button>
                    <button
                      onClick={() => { setSortByConstruction('favorite'); setSortDropdownOpen(null); }}
                      className={`w-full text-left px-4 py-2 text-[11px] tracking-[0.22px] hover:bg-[#f8f8f8] ${sortByConstruction === 'favorite' ? 'text-[#f14110]' : 'text-[#333]'}`}
                    >
                      Favorite
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-4 gap-5" style={{ gridTemplateColumns: 'repeat(4, 210px)' }}>
            {mockSavedConstruction.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-6">
              <button className="text-[11px] text-[#333]/50 tracking-[0.22px] hover:text-[#333]">
                ← PREVIOUS
              </button>
              <button className="text-[11px] text-[#333] font-medium tracking-[0.22px] hover:text-[#f14110]">
                NEXT →
              </button>
            </div>
            <button className="text-[11px] text-[#333] font-medium tracking-[0.22px] hover:text-[#f14110]">
              SEE ALL
            </button>
          </div>
        </section>

        {/* Renovation Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-4">
              <h2 className="text-[24px] font-bold text-[#333] tracking-[0.48px]">RENOVATION</h2>
              <span className="text-[11px] text-[#333]/50 tracking-[0.22px]">
                {mockSavedRenovation.length.toString().padStart(2, '0')} Listings Saved
              </span>
            </div>
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortDropdownOpen(sortDropdownOpen === 'renovation' ? null : 'renovation')}
                className="flex items-center gap-2 text-[11px] text-[#333]/70 tracking-[0.22px]"
              >
                Sort by: <span className="text-[#f14110] font-medium">{sortByRenovation === 'latest' ? 'Latest' : 'Favorite'}</span>
                <svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L4 4L7 1" stroke="#f14110" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {sortDropdownOpen === 'renovation' && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSortDropdownOpen(null)} />
                  <div className="absolute top-full right-0 mt-1 bg-white rounded-[6px] shadow-lg z-50 py-2 min-w-[120px]">
                    <button
                      onClick={() => { setSortByRenovation('latest'); setSortDropdownOpen(null); }}
                      className={`w-full text-left px-4 py-2 text-[11px] tracking-[0.22px] hover:bg-[#f8f8f8] ${sortByRenovation === 'latest' ? 'text-[#f14110]' : 'text-[#333]'}`}
                    >
                      Latest
                    </button>
                    <button
                      onClick={() => { setSortByRenovation('favorite'); setSortDropdownOpen(null); }}
                      className={`w-full text-left px-4 py-2 text-[11px] tracking-[0.22px] hover:bg-[#f8f8f8] ${sortByRenovation === 'favorite' ? 'text-[#f14110]' : 'text-[#333]'}`}
                    >
                      Favorite
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-4 gap-5" style={{ gridTemplateColumns: 'repeat(4, 210px)' }}>
            {mockSavedRenovation.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-6">
              <button className="text-[11px] text-[#333]/50 tracking-[0.22px] hover:text-[#333]">
                ← PREVIOUS
              </button>
              <button className="text-[11px] text-[#333] font-medium tracking-[0.22px] hover:text-[#f14110]">
                NEXT →
              </button>
            </div>
            <button className="text-[11px] text-[#333] font-medium tracking-[0.22px] hover:text-[#f14110]">
              SEE ALL
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
