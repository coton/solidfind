"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { WelcomeCard, FeaturedCard, ListingCard } from "@/components/cards";
import { Pagination } from "@/components/Pagination";
import { ListingCardSkeleton } from "@/components/ui/ListingCardSkeleton";
import { useProEnabled } from "@/hooks/useProEnabled";
import { useReviewsEnabled } from "@/hooks/useReviewsEnabled";
import { getEffectiveSubcategoryFilters, parseSubcategoryParam } from "@/lib/category-filter.mjs";
import { expandRenovationTypes } from "@/lib/category-display.mjs";

function getCompanyCategoryTypes(company: any, category: string) {
  if (category === "renovation") return expandRenovationTypes(company.renovationTypes ?? []);
  if (category === "architecture") return company.architectureTypes ?? [];
  if (category === "interior") return company.interiorTypes ?? [];
  if (category === "real-estate") return company.realEstateTypes ?? [];
  return company.constructionTypes ?? (company.subcategory ? [company.subcategory] : []);
}

function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    construction: "Construction",
    renovation: "Renovation",
    architecture: "Architecture",
    interior: "Interior",
    "real-estate": "Real Estate",
  };
  return labels[category] ?? category.replace(/-/g, " ");
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f8f8]" />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileResults, setIsMobileResults] = useState(false);
  const { user: clerkUser } = useUser();

  const proEnabled = useProEnabled();
  const reviewsEnabled = useReviewsEnabled();
  const categoryParam = searchParams.get("category") || "construction";
  const subcategoryParam = searchParams.get("subcategory") || undefined;
  const selectedSubcategories = parseSubcategoryParam(subcategoryParam);
  const effectiveSubcategories = getEffectiveSubcategoryFilters(selectedSubcategories);
  const locationParam = searchParams.get("location") || undefined;
  const searchParam = searchParams.get("search") || undefined;
  const projectSizeParam = searchParams.get("projectSize") || undefined;

  const hasFilters = !!(locationParam || searchParam || projectSizeParam || effectiveSubcategories.length);

  // Get visible page categories to filter out hidden ones
  const pageConfigs = useQuery(api.pageConfigs.listVisible);
  const visibleCategoryIds = pageConfigs?.map((p) => p.categoryId) ?? null;

  const allCompanies = useQuery(api.companies.list, {
    category: categoryParam,
    location: locationParam,
    search: searchParam,
    projectSize: projectSizeParam,
  });

  // Filter companies: only show those in visible categories and matching selected subcategories
  const companies = allCompanies
    ?.filter((c) => !visibleCategoryIds || visibleCategoryIds.includes(c.category))
    ?.filter((c) => {
      if (effectiveSubcategories.length === 0) return true;
      const companyTypes = getCompanyCategoryTypes(c, categoryParam).map((type: string) => type.toLowerCase());
      return (
        companyTypes.includes("all") ||
        companyTypes.includes("every") ||
        effectiveSubcategories.some((subcategory) => companyTypes.includes(subcategory))
      );
    });

  const allLatestCompanies = useQuery(api.companies.latest);
  const latestCompanies = allLatestCompanies && visibleCategoryIds
    ? allLatestCompanies.filter((c) => visibleCategoryIds.includes(c.category))
    : allLatestCompanies;
  const allVisibleArticles = useQuery(api.featuredArticles.listVisible);
  // Filter articles by current category if one is selected, otherwise show all
  const visibleArticles = allVisibleArticles?.filter((a) => {
    if (!categoryParam) return true; // no filter = show all
    // Support both old `category` (string) and new `categories` (array)
    const cats = a.categories ?? (a.category ? [a.category] : []);
    if (cats.length === 0) return true; // no categories = show on all
    return cats.some((cat) => cat.toLowerCase() === categoryParam.toLowerCase());
  });

  // Default landing keeps the grid to two rows. Filtered/search results use
  // five rows of company listings and remove the About/featured cards.
  const DEFAULT_GRID_CARD_COUNT = 15;
  const FILTERED_LISTING_CARD_COUNT = 20;
  const MOBILE_TOTAL_CARD_COUNT = 5;
  const specialCardCount = hasFilters ? 0 : 1 + (visibleArticles?.length ?? 1); // 1 for WelcomeCard + featured articles (default 1 while loading)
  const desktopItemsPerPage = hasFilters ? FILTERED_LISTING_CARD_COUNT : Math.max(1, DEFAULT_GRID_CARD_COUNT - specialCardCount);
  const mobileItemsPerPage = Math.max(1, MOBILE_TOTAL_CARD_COUNT - specialCardCount);
  const itemsPerPage = isMobileResults ? mobileItemsPerPage : desktopItemsPerPage;

  // Get current user for bookmarks
  const currentUser = useQuery(
    api.users.getCurrentUser,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const savedIds = useQuery(
    api.savedListings.listSavedIds,
    currentUser?._id ? { userId: currentUser._id, category: categoryParam } : "skip"
  );

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
        category: categoryParam,
      });
    },
    [currentUser, toggleSave, router, categoryParam]
  );

  const savedIdSet = new Set(
    (savedIds ?? []).map((s: any) =>
      typeof s === "string" ? `${s}:${categoryParam}` : `${s.companyId}:${s.category}`
    )
  );

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
    location: c.location,
    constructionLocations: c.constructionLocations ?? [],
    renovationLocations: c.renovationLocations ?? [],
    architectureLocations: c.architectureLocations ?? [],
    interiorLocations: c.interiorLocations ?? [],
    realEstateLocations: c.realEstateLocations ?? [],
    isPro: c.isPro === true,
    isFeatured: false,
    isSaved: savedIdSet.has(`${c._id}:${categoryParam}`),
    imageUrl: c.imageUrl,
    logoId: c.logoId,
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
    location: c.location,
    constructionLocations: c.constructionLocations ?? [],
    renovationLocations: c.renovationLocations ?? [],
    architectureLocations: c.architectureLocations ?? [],
    interiorLocations: c.interiorLocations ?? [],
    realEstateLocations: c.realEstateLocations ?? [],
    isPro: c.isPro === true,
    isFeatured: false,
    isSaved: savedIdSet.has(`${c._id}:${categoryParam}`),
    imageUrl: c.imageUrl,
    logoId: c.logoId,
    projectImageIds: c.projectImageIds ?? [],
  }));

  const showEmptyState = hasFilters && companies !== undefined && companies.length === 0;
  const searchEcho = [
    searchParam,
    projectSizeParam ? "Project size" : null,
    effectiveSubcategories.length ? `${effectiveSubcategories.length} type${effectiveSubcategories.length === 1 ? "" : "s"}` : null,
    locationParam,
  ].filter(Boolean).join(" · ") || getCategoryLabel(categoryParam);

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(listings.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedListings = listings.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryParam, subcategoryParam, locationParam, searchParam, projectSizeParam]);

  useEffect(() => {
    const updateResultsLayout = () => {
      setIsMobileResults(window.innerWidth < 640);
    };

    updateResultsLayout();
    window.addEventListener("resize", updateResultsLayout);

    return () => window.removeEventListener("resize", updateResultsLayout);
  }, []);

  return (
    <>
      <main className="sf-home-shell pt-0 flex-grow flex flex-col">
        {showEmptyState ? (
          <NoResultsState
            query={searchEcho}
            onClearFilters={() => router.push(`/?category=${categoryParam}`)}
            onBroadenArea={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("location");
              router.push(`/?${params.toString()}`);
            }}
            onBrowseAll={() => router.push("/")}
            onNewSearch={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          />
        ) : (
          <>
            {/* Mobile: WebKit vertical list */}
            <div className="sm:hidden mb-8">
              <div className="m-list">
                {!hasFilters && (
                  <>
                    <WelcomeCard />
                    {visibleArticles === undefined
                      ? <HomeFeaturedCard loading />
                      : visibleArticles.map((article) => (
                        <HomeFeaturedCard key={article._id} article={article} />
                      ))
                    }
                  </>
                )}
                {companies === undefined
                  ? Array.from({ length: itemsPerPage }).map((_, i) => <ListingCardSkeleton key={i} />)
                  : paginatedListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      {...listing}
                      proEnabled={proEnabled}
                      reviewsEnabled={reviewsEnabled}
                      categoryContext={categoryParam}
                      onBookmark={() => handleBookmark(listing.id)}
                    />
                  ))
                }
              </div>
              <div className="mt-1">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>

            {/* Desktop: Grid with Pagination */}
            <div className="hidden sm:block">
              {proEnabled && (
                <div className="sf-sponsored-strip">
                  <div>
                    <p>Sponsored</p>
                    <h2>Sponsored - top construction companies advertise here</h2>
                    <p>97% → 128</p>
                  </div>
                  <button type="button">Advertise →</button>
                </div>
              )}

              <div className="sf-grid mb-8">
                {!hasFilters && (
                  <>
                    <WelcomeCard />
                    {visibleArticles === undefined
                      ? <HomeFeaturedCard loading />
                      : visibleArticles.map((article) => (
                        <HomeFeaturedCard key={article._id} article={article} />
                      ))
                    }
                  </>
                )}

                {/* Listing Cards - show skeletons while Convex loads */}
                {companies === undefined
                  ? Array.from({ length: itemsPerPage }).map((_, i) => <ListingCardSkeleton key={i} />)
                  : paginatedListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      {...listing}
                      proEnabled={proEnabled}
                      reviewsEnabled={reviewsEnabled}
                      categoryContext={categoryParam}
                      onBookmark={() => handleBookmark(listing.id)}
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

          </>
        )}

      </main>

    </>
  );
}

function NoResultsState({
  query,
  onClearFilters,
  onBroadenArea,
  onBrowseAll,
  onNewSearch,
}: {
  query: string;
  onClearFilters: () => void;
  onBroadenArea: () => void;
  onBrowseAll: () => void;
  onNewSearch: () => void;
}) {
  return (
    <div className="flex flex-1 items-start justify-center px-5 py-16 sm:py-20">
      <section className="w-full max-w-[480px] rounded-2xl bg-white px-6 py-10 text-center shadow-[0_12px_32px_rgba(35,31,32,0.12),0_4px_8px_rgba(35,31,32,0.06)] sm:px-10 sm:pb-10 sm:pt-12" role="status" aria-live="polite">
        <div className="relative mb-6 inline-flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#fbe6de] text-[#f14110] before:absolute before:inset-[-7px] before:rounded-full before:border before:border-dashed before:border-[#f0c5b9]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[30px] w-[30px]" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="17" y1="17" x2="22" y2="22" />
          </svg>
        </div>

        <div className="mb-[22px] inline-flex max-w-full items-center gap-[7px] rounded-full border border-[#e4e4e4] bg-[#f8f8f8] py-[5px] pl-2.5 pr-3.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[13px] w-[13px] flex-none text-[#8c8c8c]" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="17" y1="17" x2="22" y2="22" />
          </svg>
          <span className="max-w-[240px] truncate font-mono text-[11px] font-medium tracking-[0.04em] text-[#333]">&quot;{query}&quot;</span>
        </div>

        <h2 className="mb-3.5 text-[22px] font-light leading-[1.2] tracking-[-0.02em] text-[#231f20] sm:text-[26px]">
          No <strong className="font-bold text-[#f14110]">solid finds</strong> yet for you.
        </h2>
        <p className="mb-7 text-[14px] leading-[1.65] text-[#333]">
          We looked, but nothing matched this search. Try widening your area, picking a broader trade, or removing a filter - the right pro might just be one tweak away.
        </p>

        <div className="mb-6 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={onClearFilters} className="rounded-full border border-[#d8d8d8] bg-white px-3.5 py-[7px] text-[13px] font-medium text-[#333] transition hover:border-[#231f20]">Clear all filters</button>
          <button type="button" onClick={onBroadenArea} className="rounded-full border border-[#d8d8d8] bg-white px-3.5 py-[7px] text-[13px] font-medium text-[#333] transition hover:border-[#231f20]">Broaden area</button>
          <button type="button" onClick={onBrowseAll} className="rounded-full border border-[#d8d8d8] bg-white px-3.5 py-[7px] text-[13px] font-medium text-[#333] transition hover:border-[#231f20]">Browse all pros</button>
        </div>

        <button type="button" onClick={onNewSearch} className="inline-flex items-center rounded-[6px] bg-[#f14110] px-6 py-[11px] text-[14px] font-semibold tracking-[0.01em] text-white transition hover:bg-[#ec3300]">
          Try a new search
        </button>

        <div className="mt-6 h-px w-full bg-[#e4e4e4]" aria-hidden="true" />
        <p className="mt-[18px] text-[13px] leading-[1.55] text-[#8c8c8c]">
          Not sure what to search for? <button type="button" onClick={onNewSearch} className="font-semibold text-[#f14110] hover:underline">Tell us what you&apos;re building</button>.
        </p>
      </section>
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
      <div className="sf-pro-card bg-[#e4e4e4] animate-pulse" />
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
