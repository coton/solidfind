"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ListingCard } from "@/components/cards";

export default function DashboardPage() {
  const [sortByConstruction, setSortByConstruction] = useState("latest");
  const [sortByRenovation, setSortByRenovation] = useState("latest");
  const [sortDropdownOpen, setSortDropdownOpen] = useState<string | null>(null);

  const { user: clerkUser } = useUser();

  const currentUser = useQuery(
    api.users.getCurrentUser,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const savedListings = useQuery(
    api.savedListings.listByUser,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const user = {
    name: clerkUser?.fullName || clerkUser?.firstName || "User name",
    email: clerkUser?.primaryEmailAddress?.emailAddress || "user@gmail.com",
  };

  // Split saved listings by category
  const constructionListings = (savedListings ?? [])
    .filter((s) => s.category === "construction" && s.company)
    .map((s) => ({
      id: s.company!._id,
      name: s.company!.name,
      description: s.company!.description ?? "",
      rating: s.company!.rating ?? 4.5,
      isPro: s.company!.isPro,
      isSaved: true,
    }));

  const renovationListings = (savedListings ?? [])
    .filter((s) => s.category === "renovation" && s.company)
    .map((s) => ({
      id: s.company!._id,
      name: s.company!.name,
      description: s.company!.description ?? "",
      rating: s.company!.rating ?? 4.5,
      isPro: s.company!.isPro,
      isSaved: true,
    }));

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <Header />

      <main className="max-w-[900px] mx-auto px-6 py-8">
        {/* User Info Section */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[11px] text-[#333]/70 tracking-[0.22px]">Hello</p>
            <h1 className="text-[32px] font-bold text-[#333] tracking-[0.64px]">{user.name}</h1>
            <p className="text-[10px] text-[#333]/70 leading-[14px] tracking-[0.2px] mt-2 max-w-[440px]">
              Find your list of saved profiles here. Add-remove profiles by clicking bookmark icon.
              <br />
              Temukan daftar profil yang Anda simpan di sini. Tambah-hapus profil dengan mengklik ikon bookmark.
            </p>
          </div>

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
            <Link
              href="/reviews"
              className="h-10 px-6 rounded-full border border-[#f14110] text-[#f14110] text-[11px] font-medium tracking-[0.22px] hover:bg-[#f14110] hover:text-white transition-colors flex items-center"
            >
              Your reviews
            </Link>
          </div>
        </div>

        {/* Construction Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-4">
              <h2 className="text-[24px] font-bold text-[#333] tracking-[0.48px]">CONSTRUCTION</h2>
              <span className="text-[11px] text-[#333]/50 tracking-[0.22px]">
                {constructionListings.length.toString().padStart(2, '0')} Listings Saved
              </span>
            </div>
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

          <div className="grid grid-cols-4 gap-5" style={{ gridTemplateColumns: 'repeat(4, 210px)' }}>
            {constructionListings.length > 0 ? (
              constructionListings.map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))
            ) : (
              <p className="text-[11px] text-[#333]/50 col-span-4">No saved construction listings yet.</p>
            )}
          </div>

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
                {renovationListings.length.toString().padStart(2, '0')} Listings Saved
              </span>
            </div>
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

          <div className="grid grid-cols-4 gap-5" style={{ gridTemplateColumns: 'repeat(4, 210px)' }}>
            {renovationListings.length > 0 ? (
              renovationListings.map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))
            ) : (
              <p className="text-[11px] text-[#333]/50 col-span-4">No saved renovation listings yet.</p>
            )}
          </div>

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
