"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Footer } from "@/components/Footer";
import { DashboardHeroMedia } from "@/components/DashboardHeroMedia";
import { ListingCard } from "@/components/cards";
import { useProEnabled } from "@/hooks/useProEnabled";
import { useReviewsEnabled } from "@/hooks/useReviewsEnabled";

const DASHBOARD_CATEGORY_PAGE_SIZE = 4;
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

export default function DashboardPage() {
  const [sortByCategory, setSortByCategory] = useState<Record<string, SavedListingSort>>({});
  const [sortDropdownOpen, setSortDropdownOpen] = useState<string | null>(null);
  const [deleteState, setDeleteState] = useState<"confirm" | "success" | "failure" | null>(null);
  const [deleteError, setDeleteError] = useState("");

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
        isPro: s.company!.isPro,
        isSaved: true,
        imageUrl: s.company!.imageUrl,
        logoId: s.company!.logoId,
        savedAt: s.savedAt,
      })),
  }));

  // Only show categories that have at least one bookmark
  const visibleCategories = listingsByCategory.filter((cat) => cat.listings.length > 0);

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      <header className="sf-userhdr">
        <Link href="/" className="sf-shell-brand">
          <Image src="/assets/solidfind-logo.svg" alt="SolidFind" width={136} height={20} className="h-[18px] w-auto" />
          <span className="sf-brand-id sf-about-hero-id">.id</span>
        </Link>
        <div className="sf-shell-actions">
          {reviewsEnabled && (
            <Link href="/reviews" className="sf-btn sf-btn-ghost">Your testimonials</Link>
          )}
          <button type="button" className="sf-btn sf-btn-pri" onClick={handleSignOut}>Log out</button>
        </div>
      </header>

      <main className="sf-userdash-main flex-grow w-full">
        <div className="sf-user-intro">
            <div>
              <span className="sf-tag-mono">Hello</span>
              <h1>{user.name}</h1>
              <p className="sf-about-contact">
                Find your list of saved profiles here. Add or remove profiles by clicking the bookmark icon.
              </p>
            </div>

            <div className="sf-user-email">
              <p>{user.email}</p>
              <button type="button" className="sf-user-delete" onClick={() => setDeleteState("confirm")}>
                Delete account
              </button>
            </div>
        </div>

        <DashboardHeroMedia className="mb-8" priority />

        <div className="sf-saved-head">
          <div className="sf-saved-count">
            <b>{visibleCategories.reduce((sum, cat) => sum + cat.listings.length, 0)}</b>
            <span>Saved listings</span>
          </div>
        </div>

        {/* Bookmark sections — dynamic per category */}
        {visibleCategories.map((cat) => {
          const sortVal = sortByCategory[cat.id] ?? "recent";
          const sortedListings = sortSavedListings(cat.listings, sortVal);
          const desktopListings = sortedListings.slice(0, DASHBOARD_CATEGORY_PAGE_SIZE);

          return (
            <section key={cat.id} className="sf-saved-group">
              <div className="sf-saved-group-head">
                <div>
                  <h2>{cat.label}</h2>
                  <span className="sf-saved-count">
                    <span>
                    {cat.listings.length.toString().padStart(2, '0')} Listings Saved
                  </span>
                  </span>
                </div>
                  {cat.listings.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => setSortDropdownOpen(sortDropdownOpen === cat.id ? null : cat.id)}
                        className="flex items-center gap-2 text-right text-[11px] text-[#333]/70 tracking-[0.22px]"
                      >
                        Sort by: <span className="text-[#f14110] font-medium">{sortVal === 'az' ? 'A > Z' : 'Recent'}</span>
                        <svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L4 4L7 1" stroke="#f14110" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
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
                  )}
              </div>

              {cat.listings.length > 0 ? (
                <>
                  <div className="sm:hidden overflow-x-auto overscroll-x-contain scrollbar-hide -mx-4 px-4">
                    <div className="flex gap-5 pb-2">
                      {sortedListings.map((listing) => (
                        <div key={listing.id} className="flex-shrink-0">
                          <ListingCard {...listing} proEnabled={proEnabled} categoryContext={cat.id} returnToDashboard />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="hidden sm:grid sf-saved-grid">
                    {desktopListings.map((listing) => (
                      <ListingCard key={listing.id} {...listing} proEnabled={proEnabled} categoryContext={cat.id} returnToDashboard />
                    ))}
                  </div>
                  {cat.listings.length > 4 && (
                    <div className="hidden sm:flex items-center justify-end mt-4">
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
