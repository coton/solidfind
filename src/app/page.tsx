"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { ListingCardSkeleton } from "@/components/ui/ListingCardSkeleton";

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#ececec]" />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("latest");
  const { user: clerkUser } = useUser();

  const categoryParam = searchParams.get("category") || undefined;
  const locationParam = searchParams.get("location") || undefined;
  const searchParam = searchParams.get("search") || undefined;
  const projectSizeParam = searchParams.get("projectSize") || undefined;

  const hasFilters = !!(categoryParam || locationParam || searchParam || projectSizeParam);

  // Items per page: 3 rows (10 cards) default, 7 rows (26 cards) with filters/search
  // Row 1 has WelcomeCard + FeaturedCard + 2 listings
  // Subsequent rows have 4 listings each
  const itemsPerPage = hasFilters ? 26 : 10;

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
        // Redirect to sign-in if not logged in
        router.push("/sign-in");
        return;
      }
      await toggleSave({
        userId: currentUser._id,
        companyId: companyId as Id<"companies">,
        category,
      });
    },
    [currentUser, toggleSave, router]
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
    projectImageIds: c.projectImageIds ?? [],
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
    projectImageIds: c.projectImageIds ?? [],
  }));

  const showEmptyState = hasFilters && companies !== undefined && companies.length === 0;

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(listings.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedListings = listings.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryParam, locationParam, searchParam, projectSizeParam]);

  return (
    <div className="min-h-screen bg-[#ececec] flex flex-col">
      <Header />

      <main className="max-w-[900px] mx-auto px-4 sm:px-0 pt-3 sm:pt-4 flex-grow w-full">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-[11px] font-medium text-[#333]/50 tracking-[0.22px] leading-[14px]">{listings.length} Solid Finds</h2>
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>

        {showEmptyState ? (
          /* Empty State */
          <div className="mb-8">
            <div className="py-8 sm:py-12">
              <p className="text-[11px] font-medium text-[#333]/50 tracking-[0.22px] leading-[14px] mb-4">No results</p>
              <h3 className="text-[26px] font-semibold text-[#f14110] leading-[30px] mb-6">
                We are still finding some solid profiles for your search. Come back soon ; )
              </h3>
              <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] leading-[14px] mb-6">
                In the meantime, here are the latest added profiles:
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {/* First Row: Welcome + Featured + Listing Cards */}
              <WelcomeCard />
              <FeaturedCard
                image="/images/featured-bg.png"
                title="FEATURED ARTICLE TITLE"
                description="Here goes the description of this first article, re-directing to a special page."
              />

              {/* Listing Cards - show skeletons while Convex loads */}
              {companies === undefined
                ? Array.from({ length: itemsPerPage }).map((_, i) => <ListingCardSkeleton key={i} />)
                : paginatedListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    {...listing}
                    onBookmark={() => handleBookmark(listing.id, listing.category)}
                  />
                ))
              }
            </div>

            {/* Pagination */}
            <div className="flex justify-start mb-[52px]">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}

        {/* Ad Banner */}
        <div className="mb-[52px]">
          <AdBanner imageSrc="/images/ad-kini-resort.png" alt="Kini Resort" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
