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
import { useProEnabled } from "@/hooks/useProEnabled";
import { useReviewsEnabled } from "@/hooks/useReviewsEnabled";

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

  const proEnabled = useProEnabled();
  const reviewsEnabled = useReviewsEnabled();
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
  const allVisibleArticles = useQuery(api.featuredArticles.listVisible);
  // Filter articles by current category if one is selected, otherwise show all
  const visibleArticles = allVisibleArticles?.filter((a) => {
    if (!categoryParam) return true; // no filter = show all
    return a.category?.toLowerCase() === categoryParam.toLowerCase();
  });

  // Always display exactly 12 cards total on the homepage grid (desktop).
  // Special cards = 1 (WelcomeCard) + number of visible featured articles.
  // With filters/search, show 26 listing cards (no special cards in grid).
  const TOTAL_GRID_CARDS = 12;
  const specialCardCount = 1 + (visibleArticles?.length ?? 1); // 1 for WelcomeCard + featured articles (default 1 while loading)
  const itemsPerPage = hasFilters ? 26 : Math.max(1, TOTAL_GRID_CARDS - specialCardCount);

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

      <main className="max-w-[900px] mx-auto px-5 sm:px-0 pt-3 sm:pt-4 flex-grow w-full flex flex-col">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-[11px] font-medium text-[#333]/50 tracking-[0.22px] leading-[14px]">{listings.length} Solid Finds</h2>
          {!showEmptyState && <SortDropdown value={sortBy} onChange={setSortBy} />}
        </div>

        {showEmptyState ? (
          /* Empty State — flex column filling remaining height, no ad */
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Orange message — vertically centered in available space */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p className="text-[11px] font-medium text-[#333]/50 tracking-[0.22px] leading-[14px]" style={{ marginBottom: '16px' }}>No results</p>
              <h3 style={{ fontSize: '26px', fontWeight: 600, color: '#f14110', lineHeight: '30px' }}>
                We are still finding some solid profiles for your search. Come back soon ; )
              </h3>
            </div>

            {/* Suggested profiles — pinned to bottom above footer */}
            <div style={{ paddingBottom: '32px' }}>
              <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] leading-[14px]" style={{ marginBottom: '20px' }}>
                In the meantime, here are the latest added profiles:
              </p>

              {/* Mobile: 2-column grid with WelcomeCard + FeaturedCards */}
              <div className="sm:hidden grid grid-cols-2 gap-5">
                <WelcomeCard />
                {visibleArticles === undefined
                  ? <HomeFeaturedCard loading />
                  : visibleArticles.map((article) => (
                    <HomeFeaturedCard key={article._id} article={article} />
                  ))
                }
              </div>

              {/* Desktop: 4-column grid of latest profiles */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {latestListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    {...listing}
                    proEnabled={proEnabled}
                    reviewsEnabled={reviewsEnabled}
                    onBookmark={() => handleBookmark(listing.id, listing.category)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile: Horizontal Scroll (1 row) */}
            <div className="sm:hidden mb-8">
              <div className="overflow-x-auto scrollbar-hide -mx-5 px-5">
                <div className="flex gap-5 pb-2">
                  <WelcomeCard />
                  {visibleArticles === undefined
                    ? <HomeFeaturedCard loading />
                    : visibleArticles.map((article) => (
                      <HomeFeaturedCard key={article._id} article={article} />
                    ))
                  }
                  {companies === undefined
                    ? Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)
                    : listings.slice(0, 10).map((listing) => (
                      <ListingCard
                        key={listing.id}
                        {...listing}
                        proEnabled={proEnabled}
                        onBookmark={() => handleBookmark(listing.id, listing.category)}
                      />
                    ))
                  }
                </div>
              </div>
            </div>

            {/* Desktop: Grid with Pagination */}
            <div className="hidden sm:block">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* First Row: Welcome + Featured + Listing Cards */}
                <WelcomeCard />
                {visibleArticles === undefined
                  ? <HomeFeaturedCard loading />
                  : visibleArticles.map((article) => (
                    <HomeFeaturedCard key={article._id} article={article} />
                  ))
                }

                {/* Listing Cards - show skeletons while Convex loads */}
                {companies === undefined
                  ? Array.from({ length: itemsPerPage }).map((_, i) => <ListingCardSkeleton key={i} />)
                  : paginatedListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      {...listing}
                      proEnabled={proEnabled}
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
            </div>

            {/* Ad Banner — only shown when there are results */}
            <div className="mb-[32px] sm:mb-[52px]">
              <AdBanner imageSrc="/images/ad-kini-resort.png" alt="Kini Resort" />
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

function HomeFeaturedCard({ article, loading }: { article?: { _id: Id<"featuredArticles">; title: string; subtitle?: string; coverImageId?: Id<"_storage">; coverImageUrl?: string }; loading?: boolean }) {
  const coverUrl = useQuery(
    api.files.getUrl,
    article?.coverImageId ? { storageId: article.coverImageId } : "skip"
  );

  // While loading, show a placeholder skeleton instead of fallback text
  if (loading) {
    return (
      <div className="w-[210px] h-[220px] bg-[#e4e4e4] rounded-[6px] animate-pulse" />
    );
  }

  const image = coverUrl ?? article?.coverImageUrl ?? "/images/featured-bg.png";
  const title = article?.title ?? "FEATURED ARTICLE";
  const description = article?.subtitle ?? "";
  const href = article ? `/article/${article._id}` : "/about";

  return (
    <FeaturedCard
      image={image}
      title={title}
      description={description}
      href={href}
    />
  );
}
