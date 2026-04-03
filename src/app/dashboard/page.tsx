"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser, SignOutButton, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ListingCard } from "@/components/cards";
import { useProEnabled } from "@/hooks/useProEnabled";
import { useReviewsEnabled } from "@/hooks/useReviewsEnabled";

export default function DashboardPage() {
  const [sortByCategory, setSortByCategory] = useState<Record<string, string>>({});
  const [sortDropdownOpen, setSortDropdownOpen] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [redirected, setRedirected] = useState(false);

  const router = useRouter();
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const deleteAccount = useMutation(api.users.deleteAccount);
  const proEnabled = useProEnabled();
  const reviewsEnabled = useReviewsEnabled();

  // Check if user has a company and redirect if needed
  const currentUser = useQuery(
    api.users.getCurrentUser,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const company = useQuery(
    api.companies.getByOwner,
    currentUser?._id ? { ownerId: currentUser._id } : "skip"
  );

  // If user has a company, redirect to company dashboard
  if (currentUser && company !== null && !redirected) {
    setRedirected(true);
    router.push("/company-dashboard");
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/" });
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (!clerkUser?.id) return;
    await deleteAccount({ clerkId: clerkUser.id });
    await handleSignOut();
  };

  const savedListings = useQuery(
    api.savedListings.listByUser,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const user = {
    name: clerkUser?.fullName || clerkUser?.firstName || "User name",
    email: clerkUser?.primaryEmailAddress?.emailAddress || "user@gmail.com",
  };

  // Get visible page categories from admin config
  const pageConfigs = useQuery(api.pageConfigs.listVisible);

  // All category definitions — fallback while loading
  const fallbackCategories = [
    { id: "construction", label: "CONSTRUCTION" },
    { id: "renovation", label: "RENOVATION" },
  ];

  const allCategories = pageConfigs
    ? pageConfigs.map((p) => ({ id: p.categoryId, label: p.label.replace(/^\d+\.\s*/, "").toUpperCase() }))
    : fallbackCategories;

  // Group saved listings by category
  const listingsByCategory = allCategories.map((cat) => ({
    ...cat,
    listings: (savedListings ?? [])
      .filter((s) => s.category === cat.id && s.company)
      .map((s) => ({
        id: s.company!._id,
        name: s.company!.name,
        description: s.company!.description ?? "",
        rating: s.company!.rating ?? 4.5,
        isPro: s.company!.isPro,
        isSaved: true,
        imageUrl: s.company!.imageUrl,
        logoId: s.company!.logoId,
      })),
  }));

  // Only show categories that have at least one bookmark
  const visibleCategories = listingsByCategory.filter((cat) => cat.listings.length > 0);

  return (
    <div className="min-h-screen bg-[#ececec] flex flex-col">
      <Header />

      <main className="max-w-[900px] mx-auto px-4 sm:px-0 py-8 flex-grow w-full">
        {/* User Info Section */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[11px] text-[#333]/70 tracking-[0.22px]">Hello</p>
            <h1 className="text-[32px] font-bold text-[#333] tracking-[0.64px]">{user.name}</h1>
            <p className="font-bam text-[10px] text-[#333]/70 leading-[14px] tracking-[0.2px] mt-2 max-w-full max-w-[440px]">
              Find your list of saved profiles here. Add-remove profiles by clicking bookmark icon.
              <br />
              Temukan daftar profil yang Anda simpan di sini. Tambah-hapus profil dengan mengklik ikon bookmark.
            </p>
          </div>

          <div className="text-right">
            <p className="text-[11px] text-[#333] tracking-[0.22px] mb-1">{user.email}</p>
            {reviewsEnabled && (
              <Link
                href="/reviews"
                className="h-10 px-6 rounded-full border border-[#f14110] text-[#f14110] text-[11px] font-medium tracking-[0.22px] hover:bg-[#f14110] hover:text-white transition-colors flex items-center justify-center"
              >
                Your testimonials
              </Link>
            )}
          </div>
        </div>

        {/* Banner Image */}
        <div className="mb-8 rounded-[6px] overflow-hidden relative" style={{ width: '100%', aspectRatio: '900 / 200' }}>
          <Image
            src="/images/bg-individual-page.png"
            alt="SolidFind"
            fill
            sizes="(max-width: 900px) 100vw, 900px"
            className="object-cover object-right-bottom sm:object-center"
            priority
          />
        </div>

        {/* Bookmark sections — dynamic per category */}
        {visibleCategories.map((cat) => {
          const sortVal = sortByCategory[cat.id] ?? "latest";
          return (
            <section key={cat.id} className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-baseline gap-4">
                  <h2 className="text-[24px] font-bold text-[#333] tracking-[0.48px]">{cat.label}</h2>
                  <span className={`text-[11px] tracking-[0.22px] ${cat.listings.length > 0 ? 'text-[#f14110]' : 'text-[#333]/50'}`}>
                    {cat.listings.length.toString().padStart(2, '0')} Listings Saved
                  </span>
                </div>
                {cat.listings.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setSortDropdownOpen(sortDropdownOpen === cat.id ? null : cat.id)}
                      className="flex items-center gap-2 text-[11px] text-[#333]/70 tracking-[0.22px]"
                    >
                      Sort by: <span className="text-[#f14110] font-medium">{sortVal === 'latest' ? 'Latest' : 'Favorite'}</span>
                      <svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L4 4L7 1" stroke="#f14110" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {sortDropdownOpen === cat.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setSortDropdownOpen(null)} />
                        <div className="absolute top-full right-0 mt-1 bg-white rounded-[6px] shadow-lg z-50 py-2 min-w-[120px]">
                          <button
                            onClick={() => { setSortByCategory(prev => ({ ...prev, [cat.id]: 'latest' })); setSortDropdownOpen(null); }}
                            className={`w-full text-left px-4 py-2 text-[11px] tracking-[0.22px] hover:bg-[#f8f8f8] ${sortVal === 'latest' ? 'text-[#f14110]' : 'text-[#333]'}`}
                          >
                            Latest
                          </button>
                          <button
                            onClick={() => { setSortByCategory(prev => ({ ...prev, [cat.id]: 'favorite' })); setSortDropdownOpen(null); }}
                            className={`w-full text-left px-4 py-2 text-[11px] tracking-[0.22px] hover:bg-[#f8f8f8] ${sortVal === 'favorite' ? 'text-[#f14110]' : 'text-[#333]'}`}
                          >
                            Favorite
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {cat.listings.length > 0 ? (
                <>
                  <div className="grid grid-cols-4 gap-5" style={{ gridTemplateColumns: 'repeat(4, 210px)' }}>
                    {cat.listings.slice(0, 4).map((listing) => (
                      <ListingCard key={listing.id} {...listing} proEnabled={proEnabled} categoryContext={cat.id} />
                    ))}
                  </div>
                  {cat.listings.length > 4 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-6">
                        <button className="text-[11px] text-[#333]/50 tracking-[0.22px] hover:text-[#333]">
                          ← PREVIOUS
                        </button>
                        <button className="text-[11px] text-[#333] font-medium tracking-[0.22px] hover:text-[#f14110]">
                          NEXT →
                        </button>
                      </div>
                      <Link
                        href={`/dashboard/${cat.id}`}
                        className="h-[32px] px-5 rounded-full border border-[#333] text-[#333] text-[11px] font-medium tracking-[0.22px] hover:border-[#f14110] hover:text-[#f14110] transition-colors flex items-center justify-center"
                      >
                        See all
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-[11px] text-[#333]/50 tracking-[0.22px]">No saved {cat.label.toLowerCase()} listings yet. Start bookmarking company profiles you would be interested to work with.</p>
              )}
            </section>
          );
        })}
      </main>

      <Footer />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white w-full max-w-[440px] rounded-[6px] p-8 text-center">
            <h3 className="text-[20px] font-bold text-[#333] mb-4">Delete Profile</h3>
            <p className="text-[12px] text-[#333]/70 mb-6">
              Are you sure you want to delete your profile? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="h-10 px-6 rounded-full border border-[#333] text-[#333] text-[11px] font-medium tracking-[0.22px] hover:bg-[#333] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="h-10 px-6 rounded-full bg-[#f14110] text-white text-[11px] font-medium tracking-[0.22px] hover:bg-[#d93a0e] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
