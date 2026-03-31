"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ListingCard, FeaturedCard } from "@/components/cards";
import { Pagination } from "@/components/Pagination";
import { SortDropdown } from "@/components/SortDropdown";
import { useProEnabled } from "@/hooks/useProEnabled";
import { useReviewsEnabled } from "@/hooks/useReviewsEnabled";

const categoryLabels: Record<string, string> = {
  construction: "CONSTRUCTION",
  renovation: "RENOVATION",
  architecture: "ARCHITECTURE",
  interior: "INTERIOR",
  "real-estate": "REAL ESTATE",
};

const ITEMS_PER_PAGE = 20;

export default function DashboardCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  const categoryLabel = categoryLabels[category] || category.toUpperCase();

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("latest");

  const { user: clerkUser } = useUser();
  const proEnabled = useProEnabled();
  const reviewsEnabled = useReviewsEnabled();

  const currentUser = useQuery(
    api.users.getCurrentUser,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const savedListings = useQuery(
    api.savedListings.listByUser,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  // Get visible featured articles for this category
  const allVisibleArticles = useQuery(api.featuredArticles.listVisible);
  const visibleArticles = allVisibleArticles?.filter((a) => {
    // Support both old `category` (string) and new `categories` (array)
    const cats = a.categories ?? (a.category ? [a.category] : []);
    if (cats.length === 0) return true; // no categories = show on all pages
    return cats.some((cat) => cat.toLowerCase() === category.toLowerCase());
  });

  const toggleSave = useMutation(api.savedListings.toggle);

  const handleBookmark = useCallback(
    async (companyId: string) => {
      if (!currentUser?._id) {
        router.push("/sign-in");
        return;
      }
      await toggleSave({
        userId: currentUser._id,
        companyId: companyId as Id<"companies">,
        category,
      });
    },
    [currentUser, toggleSave, router, category]
  );

  // Filter saved listings for this category
  const listings = (savedListings ?? [])
    .filter((s) => s.category === category && s.company)
    .map((s) => ({
      id: s.company!._id,
      name: s.company!.name,
      description: s.company!.description ?? "",
      category: s.company!.category,
      rating: s.company!.rating ?? 4.5,
      reviewCount: s.company!.reviewCount ?? 0,
      projects: s.company!.projects ?? 0,
      team: s.company!.teamSize ?? 0,
      address: s.company!.address ?? "",
      isPro: s.company!.isPro,
      isSaved: true,
      imageUrl: s.company!.imageUrl,
      logoId: s.company!.logoId,
      projectImageIds: s.company!.projectImageIds ?? [],
    }));

  const totalCount = listings.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedListings = listings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#ececec] flex flex-col">
      <Header />

      <main className="max-w-[900px] mx-auto px-4 sm:px-0 py-8 flex-grow w-full">
        {/* Top bar: Back | Count | Sort */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/dashboard"
            className="text-[11px] text-[#333] tracking-[0.22px] hover:text-[#f14110] transition-colors"
          >
            ← BACK
          </Link>

          <span className={`text-[11px] tracking-[0.22px] font-medium ${totalCount > 0 ? "text-[#f14110]" : "text-[#333]/50"}`}>
            {totalCount.toString().padStart(2, "0")} Listings Saved
          </span>

          <SortDropdown value={sortBy} onChange={setSortBy} reviewsEnabled={reviewsEnabled} />
        </div>

        {/* Category Title */}
        <h1 className="text-[24px] font-bold text-[#333] tracking-[0.48px] mb-6">
          {categoryLabel}
        </h1>

        {/* Featured Articles */}
        {visibleArticles && visibleArticles.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8" style={{ gridTemplateColumns: "repeat(4, 210px)" }}>
            {visibleArticles.map((article) => (
              <FeaturedCard
                key={article._id}
                article={article}
                fromCategory={category}
              />
            ))}
          </div>
        )}

        {/* Grid */}
        {paginatedListings.length > 0 ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5" style={{ gridTemplateColumns: "repeat(4, 210px)" }}>
              {paginatedListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  {...listing}
                  proEnabled={proEnabled}
                  reviewsEnabled={reviewsEnabled}
                  categoryContext={category}
                  onBookmark={() => handleBookmark(listing.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-start mt-8 mb-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <p className="text-[11px] text-[#333]/50 tracking-[0.22px]">
            No saved {categoryLabel.toLowerCase()} listings yet. Start bookmarking company profiles you would be interested to work with.
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
}
