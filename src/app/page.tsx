"use client";

import { Suspense, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WelcomeCard, FeaturedCard, ListingCard } from "@/components/cards";
import { Pagination } from "@/components/Pagination";
import { SortDropdown } from "@/components/SortDropdown";
import { AdBanner } from "@/components/AdBanner";

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#ececec]" />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("latest");
  const { user: clerkUser } = useUser();

  const categoryParam = searchParams.get("category") || undefined;
  const locationParam = searchParams.get("location") || undefined;
  const searchParam = searchParams.get("search") || undefined;
  const projectSizeParam = searchParams.get("projectSize") || undefined;

  const hasFilters = !!(categoryParam || locationParam || searchParam || projectSizeParam);

  const companies = useQuery(api.companies.list, {
    category: categoryParam,
    location: locationParam,
    search: searchParam,
    projectSize: projectSizeParam,
  });

  const latestCompanies = useQuery(api.companies.latest);

  // Get current user for bookmarks
  const currentUser = useQuery(
    api.users.getCurrentUser,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const savedIds = useQuery(
    api.savedListings.listSavedIds,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const toggleSave = useMutation(api.savedListings.toggle);

  const handleBookmark = useCallback(
    async (companyId: string, category: string) => {
      if (!currentUser?._id) {
        // Redirect to sign-in
        window.location.href = "/sign-in";
        return;
      }
      await toggleSave({
        userId: currentUser._id,
        companyId: companyId as Id<"companies">,
        category,
      });
    },
    [currentUser, toggleSave]
  );

  const savedIdSet = new Set(savedIds ?? []);

  // Map Convex companies to the format ListingCard expects
  const listings = (companies ?? []).map((c) => ({
    id: c._id,
    name: c.name,
    description: c.description ?? "",
    category: c.category,
    rating: c.rating ?? 4.5,
    reviewCount: c.reviewCount ?? 0,
    projects: c.projects ?? 0,
    team: c.teamSize ?? 0,
    address: c.address ?? "",
    isPro: c.isPro,
    isFeatured: false,
    isSaved: savedIdSet.has(c._id),
    imageUrl: c.imageUrl,
  }));

  const latestListings = (latestCompanies ?? []).map((c) => ({
    id: c._id,
    name: c.name,
    description: c.description ?? "",
    category: c.category,
    rating: c.rating ?? 4.5,
    reviewCount: c.reviewCount ?? 0,
    projects: c.projects ?? 0,
    team: c.teamSize ?? 0,
    address: c.address ?? "",
    isPro: c.isPro,
    isFeatured: false,
    isSaved: savedIdSet.has(c._id),
    imageUrl: c.imageUrl,
  }));

  const showEmptyState = hasFilters && companies !== undefined && companies.length === 0;

  return (
    <div className="min-h-screen bg-[#ececec]">
      <Header />

      <main className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[18px] sm:text-[24px] font-bold text-[#333]">{listings.length} Solid Finds</h2>
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>

        {showEmptyState ? (
          /* Empty State */
          <div className="mb-8">
            <div className="text-center py-8 sm:py-12">
              <p className="text-[14px] sm:text-[16px] text-[#333] mb-2">No results</p>
              <h3 className="text-[16px] sm:text-[20px] font-bold text-[#f14110] max-w-[500px] mx-auto mb-4 px-4">
                We are still finding some solid profiles for your search. Come back soon ;)
              </h3>
              <p className="text-[12px] sm:text-[14px] text-[#333]/70 mb-6 sm:mb-8">
                In the meantime, here are the latest added profiles:
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 justify-items-center lg:justify-items-start">
              {latestListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  {...listing}
                  onBookmark={() => handleBookmark(listing.id, listing.category)}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Results Grid - Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8 justify-items-center lg:justify-items-start">
              {/* First Row: Welcome + Featured + Listing Cards */}
              <WelcomeCard />
              <FeaturedCard
                image="/images/featured-bg.png"
                title="FEATURED ARTICLE TITLE"
                address="Jl. Imam Bonjol No.198/249, Pemecutan Klod, Kec. Denpasar Bar., Kota Denpasar, Bali 80119"
              />

              {/* Listing Cards */}
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  {...listing}
                  onBookmark={() => handleBookmark(listing.id, listing.category)}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center lg:justify-start mb-8">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.max(1, Math.ceil(listings.length / 9))}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}

        {/* Ad Banner */}
        <div className="mb-8">
          <AdBanner imageSrc="/images/ad-kini-resort.png" alt="Kini Resort" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
