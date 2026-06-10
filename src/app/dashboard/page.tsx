"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdBanner } from "@/components/AdBanner";
import { DashboardMobileHeader } from "@/components/DashboardMobileHeader";
import { ListingCard } from "@/components/cards";
import { useProEnabled } from "@/hooks/useProEnabled";
import { useReviewsEnabled } from "@/hooks/useReviewsEnabled";
import { buildCompanyProfilePath } from "@/lib/company-profile-url.mjs";

const DASHBOARD_CATEGORY_PAGE_SIZE = 5;
const DASHBOARD_CATEGORY_PAGE_SIZE_MOBILE = 2;
const categoryNumbers: Record<string, string> = {
  construction: "01",
  renovation: "02",
  architecture: "03",
  interior: "04",
  "real-estate": "05",
};

const savedListingSortOptions = [
  { value: "az", label: "Sort by: A > Z" },
  { value: "recent", label: "Sort by: Recent" },
] as const;

type SavedListingSort = typeof savedListingSortOptions[number]["value"];

type SavedListingCard = {
  id: string;
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  projects: number;
  team: number;
  location?: string;
  constructionLocations: string[];
  renovationLocations: string[];
  architectureLocations: string[];
  interiorLocations: string[];
  realEstateLocations: string[];
  isPro: boolean;
  isSaved: boolean;
  imageUrl?: string;
  logoId?: string;
  savedAt: number;
};

function sortSavedListings(listings: SavedListingCard[], sortBy: string) {
  return [...listings].sort((a, b) => {
    if (sortBy === "az") {
      return a.name.localeCompare(b.name);
    }

    return b.savedAt - a.savedAt;
  });
}

function formatCategoryTitle(label: string) {
  const normalized = label.replace(/^\d+\.\s*/, "").trim().toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export default function DashboardPage() {
  const [sortByCategory, setSortByCategory] = useState<Record<string, SavedListingSort>>({});
  const [sortDropdownOpen, setSortDropdownOpen] = useState<string | null>(null);
  const [deleteState, setDeleteState] = useState<"confirm" | "success" | "failure" | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [mobileReviewsOpen, setMobileReviewsOpen] = useState(false);

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

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/" });
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (!clerkUser?.id) return;
    setDeleteError("");
    try {
      await deleteAccount({ clerkId: clerkUser.id });
      setDeleteState("success");
      window.setTimeout(() => {
        void handleSignOut();
      }, 1200);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "An unexpected error occurred.");
      setDeleteState("failure");
    }
  };

  useEffect(() => {
    const syncMobile = () => setIsMobile(window.innerWidth < 640);
    syncMobile();
    window.addEventListener("resize", syncMobile);
    return () => window.removeEventListener("resize", syncMobile);
  }, []);

  const savedListings = useQuery(
    api.savedListings.listByUser,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );
  const userReviews = useQuery(
    api.reviews.listByUser,
    currentUser?._id && reviewsEnabled ? { userId: currentUser._id } : "skip"
  );

  const user = {
    name: clerkUser?.fullName || clerkUser?.firstName || "User name",
    email: clerkUser?.primaryEmailAddress?.emailAddress || "user@gmail.com",
  };

  // Get visible page categories from admin config
  const pageConfigs = useQuery(api.pageConfigs.listVisible);

  useEffect(() => {
    if (currentUser?.accountType === "company") {
      router.push("/company-dashboard");
    }
  }, [currentUser?.accountType, router]);

  // Redirect company users to company dashboard based on accountType, not DB company record
  if (currentUser?.accountType === "company") {
    return null;
  }

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
        reviewCount: s.company!.reviewCount ?? 0,
        projects: s.company!.projects ?? 0,
        team: s.company!.teamSize ?? 0,
        location: s.company!.location,
        constructionLocations: s.company!.constructionLocations ?? [],
        renovationLocations: s.company!.renovationLocations ?? [],
        architectureLocations: s.company!.architectureLocations ?? [],
        interiorLocations: s.company!.interiorLocations ?? [],
        realEstateLocations: s.company!.realEstateLocations ?? [],
        isPro: s.company!.isPro === true,
        isSaved: true,
        imageUrl: s.company!.imageUrl,
        logoId: s.company!.logoId,
        savedAt: s.savedAt,
      })),
  }));

  // Only show categories that have at least one bookmark
  const visibleCategories = listingsByCategory.filter((cat) => cat.listings.length > 0);
  const totalSavedCount = visibleCategories.reduce((sum, cat) => sum + cat.listings.length, 0);
  const dashboardPageSize = isMobile ? DASHBOARD_CATEGORY_PAGE_SIZE_MOBILE : DASHBOARD_CATEGORY_PAGE_SIZE;

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      <Header />
      <DashboardMobileHeader dashboardHref="/dashboard" onSignOut={handleSignOut} />

      <main className="sf-userdash-main flex-grow w-full pt-[94px] sm:pt-0">
        <div className="sf-user-intro">
            <div>
              <span className="sf-tag-mono sf-user-account-line">Individual account · <span>{user.email}</span></span>
              <h1>Hi {user.name},</h1>
              <p className="sf-dash-sub">
                Everything you've saved while planning, in one place. Pick up where you left off, compare companies and revisit the reviews you've written.
              </p>
            </div>

            <div className="sf-user-email hidden sm:flex">
              <button type="button" className="sf-user-delete" onClick={() => setDeleteState("confirm")}>
                Delete account
              </button>
            </div>
        </div>

        <div className="sf-userdash-layout">
          <div className="sf-userdash-content">
            <div className="sf-saved-head">
              <h2>Saved companies</h2>
              <div className="sf-saved-count">
                <b>{totalSavedCount}</b>
                <span>saved across {visibleCategories.length} categories</span>
              </div>
            </div>

            {visibleCategories.map((cat) => {
              const sortVal = sortByCategory[cat.id] ?? "recent";
              const sortedListings = sortSavedListings(cat.listings, sortVal);
              const isExpanded = !!expandedCategories[cat.id];
              const shownListings = isExpanded ? sortedListings : sortedListings.slice(0, dashboardPageSize);

              return (
                <section key={cat.id} className="sf-saved-group">
                  <div className="sf-saved-group-head">
                    <div className="sf-saved-titleline">
                      <h2><span>{categoryNumbers[cat.id] ?? "01"}</span>{formatCategoryTitle(cat.label)}</h2>
                      {cat.listings.length > 0 && (
                        <div className="sf-saved-actions">
                          <div className="relative">
                            <button
                              onClick={() => setSortDropdownOpen(sortDropdownOpen === cat.id ? null : cat.id)}
                              className="sf-saved-sort"
                            >
                              Sort by <b>{sortVal === 'az' ? 'A > Z' : 'Recent'}</b>⌄
                            </button>
                            {sortDropdownOpen === cat.id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setSortDropdownOpen(null)} />
                                <div className="absolute top-full right-0 mt-1 bg-white rounded-[6px] shadow-lg z-50 py-2 min-w-[120px]">
                                  {savedListingSortOptions.map((option) => (
                                    <button
                                      key={option.value}
                                      onClick={() => { setSortByCategory(prev => ({ ...prev, [cat.id]: option.value })); setSortDropdownOpen(null); }}
                                      className={`w-full text-left px-4 py-2 text-[11px] tracking-[0.22px] hover:bg-[#f8f8f8] ${sortVal === option.value ? 'text-[#f14110]' : 'text-[#333]'}`}
                                    >
                                      {option.label.replace("Sort by: ", "")}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                          <span className="sf-saved-chip">{cat.listings.length} saved</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {cat.listings.length > 0 ? (
                    <>
                      <div className="sf-saved-grid">
                        {shownListings.map((listing) => (
                          <ListingCard key={listing.id} {...listing} proEnabled={proEnabled} categoryContext={cat.id} returnToDashboard />
                        ))}
                      </div>
                      {cat.listings.length > dashboardPageSize && (
                        <button
                          type="button"
                          className="sf-saved-more"
                          onClick={() => setExpandedCategories((prev) => ({ ...prev, [cat.id]: !isExpanded }))}
                        >
                          {isExpanded ? "Show less" : `See all ${cat.listings.length} ${formatCategoryTitle(cat.label).toLowerCase()}`} →
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="sf-saved-empty">No saved {cat.label.toLowerCase()} listings yet. Start bookmarking company profiles you would be interested to work with.</p>
                  )}
                </section>
              );
            })}

            {visibleCategories.length === 0 && (
              <div className="sf-saved-empty">
                No saved listings yet. Start bookmarking company profiles you would be interested to work with.
              </div>
            )}

            <section className="sf-user-search-cta">
              <div>
                <h2>Looking for something else?</h2>
                <p>Browse all construction, renovation, architecture, interior and real estate companies across Bali.</p>
              </div>
              <Link href="/" className="sf-btn sf-btn-ghost">Browse companies →</Link>
            </section>

          </div>

          <aside className="sf-userdash-side">
            <section className="sf-user-reviews-card">
              {isMobile ? (
                <button
                  type="button"
                  className="sf-user-reviews-head sf-user-reviews-toggle"
                  onClick={() => setMobileReviewsOpen((open) => !open)}
                  aria-expanded={mobileReviewsOpen}
                >
                  <h2>Your reviews</h2>
                  <span>{userReviews?.length ?? 0}</span>
                </button>
              ) : (
                <div className="sf-user-reviews-head">
                  <h2>Your reviews</h2>
                  <span>{userReviews?.length ?? 0}</span>
                </div>
              )}
              <div className={isMobile && !mobileReviewsOpen ? "hidden" : "block"}>
                <p className="sf-tag-mono">Latest reviews you've posted</p>
                {userReviews && userReviews.length > 0 ? (
                  <div className="sf-user-review-list">
                    {(isMobile ? userReviews : userReviews.slice(0, 3)).map((review) => (
                      <Link key={review._id} href={buildCompanyProfilePath({ _id: review.companyId, name: review.companyName })} className="sf-user-review-item">
                        <div>
                          <b>{review.companyName}</b>
                          <span>{"★".repeat(Math.round(review.rating))}</span>
                        </div>
                        <p>&quot;{review.content}&quot;</p>
                        <small>View company →</small>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="sf-user-review-empty">No reviews yet. Your reputation starts with the first project you share.</p>
                )}
                {!isMobile && userReviews && userReviews.length > 3 && (
                  <Link href="/reviews" className="sf-user-reviews-all">See all {userReviews.length} reviews →</Link>
                )}
              </div>
            </section>
            <button
              type="button"
              className="sf-user-delete sf-user-delete-mobile sm:hidden"
              onClick={() => setDeleteState("confirm")}
            >
              Delete your account
            </button>
            <AdBanner placeholderWhenEmpty variant="rectangle" />
          </aside>
        </div>

        <div className="sf-userdash-mobile-media">
          <AdBanner mobilePlaceholder placeholderWhenEmpty />
        </div>
      </main>

      <Footer />

      {deleteState === "confirm" && (
        <DeleteAccountWebKitModal
          email={user.email}
          onClose={() => setDeleteState(null)}
          onDelete={handleDeleteAccount}
        />
      )}
      {deleteState === "success" && (
        <DeleteStatusModal
          tone="success"
          title="Your account has been removed"
          eyebrow="Account deleted"
          body="All your data, saved listings and reviews have been permanently deleted. We're sorry to see you go."
          actionLabel="Back to SolidFind →"
          onAction={handleSignOut}
        />
      )}
      {deleteState === "failure" && (
        <DeleteStatusModal
          tone="error"
          title="We couldn't delete your account"
          eyebrow="Something went wrong"
          body={`Your account has not been deleted. ${deleteError || "Please try again or get in touch if the issue continues."}`}
          actionLabel="Try again →"
          onClose={() => setDeleteState(null)}
          onAction={() => setDeleteState("confirm")}
        />
      )}
    </div>
  );
}

function DeleteAccountWebKitModal({ email, onClose, onDelete }: { email: string; onClose: () => void; onDelete: () => void }) {
  return (
    <div className="sf-modal-scrim" onClick={onClose}>
      <div className="sf-modal sf-modal-confirm" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="sf-confirm-ico" style={{ color: "var(--sf-danger)" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/></svg>
        </div>
        <h2>Delete your account?</h2>
        <p>This permanently removes <b>{email}</b>, your saved companies and the reviews you've written. This cannot be undone.</p>
        <div className="sf-del-reason">
          <span className="sf-tag-mono">Mind sharing why? (optional)</span>
          <div className="sf-del-chips">
            {["Found what I needed", "Not useful enough", "Too many emails", "Privacy concerns", "Other"].map((reason) => (
              <button className="sf-del-chip" type="button" key={reason}>{reason}</button>
            ))}
          </div>
          <textarea className="sf-edit-textarea" rows={3} placeholder="Tell us what we could have done better..." />
        </div>
        <div className="sf-confirm-actions">
          <button className="sf-btn sf-btn-lg sf-btn-ghost" type="button" onClick={onClose}>Keep account</button>
          <button className="sf-btn sf-btn-lg sf-btn-danger" type="button" onClick={onDelete}>Delete permanently</button>
        </div>
      </div>
    </div>
  );
}

function DeleteStatusModal({ tone, title, eyebrow, body, actionLabel, onClose, onAction }: { tone: "success" | "error"; title: string; eyebrow: string; body: string; actionLabel: string; onClose?: () => void; onAction: () => void }) {
  return (
    <div className="sf-modal-scrim" onClick={onClose ?? ((event) => event.stopPropagation())}>
      <div className="sf-modal sf-modal-confirm" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        {onClose && <button className="sf-modal-x" type="button" onClick={onClose}>×</button>}
        <div className="sf-confirm-ico" style={{ background: tone === "success" ? "var(--sf-stone-200)" : "var(--sf-peach-100)", color: tone === "success" ? "var(--sf-ink)" : "var(--sf-orange)" }}>
          {tone === "success" ? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          )}
        </div>
        <span className="sf-tag-mono" style={{ display: "block", color: tone === "success" ? "var(--sf-fg-3)" : "var(--sf-orange)", marginBottom: 8 }}>{eyebrow}</span>
        <h2>{title}</h2>
        <p>{body}</p>
        <button className="sf-btn sf-btn-lg sf-btn-pri" type="button" style={{ width: "100%", justifyContent: "center", marginTop: 22 }} onClick={onAction}>{actionLabel}</button>
      </div>
    </div>
  );
}
