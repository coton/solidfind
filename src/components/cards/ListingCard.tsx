"use client";

import Link from "next/link";
import { starColor } from "@/lib/starColors";
import { buildCompanyProfilePath } from "@/lib/company-profile-url.mjs";

interface ListingCardProps {
  id: string;
  name: string;
  description: string;
  category?: string;
  categoryContext?: string;
  rating?: number;
  reviewCount?: number;
  projects?: number;
  team?: number;
  address?: string;
  location?: string;
  constructionLocations?: string[];
  renovationLocations?: string[];
  architectureLocations?: string[];
  interiorLocations?: string[];
  realEstateLocations?: string[];
  isPro?: boolean;
  proEnabled?: boolean;
  reviewsEnabled?: boolean;
  isFeatured?: boolean;
  isSaved?: boolean;
  imageUrl?: string;
  logoId?: string;
  projectImageIds?: string[];
  returnToDashboard?: boolean;
  onBookmark?: () => void;
}

export function ListingCard({
  id,
  name,
  description,
  category,
  categoryContext,
  rating = 4.5,
  reviewCount = 0,
  projects = 75,
  team = 25,
  location,
  constructionLocations = [],
  renovationLocations = [],
  architectureLocations = [],
  interiorLocations = [],
  realEstateLocations = [],
  isPro = false,
  proEnabled = true,
  reviewsEnabled = false,
  isFeatured = false,
  isSaved = false,
  imageUrl,
  returnToDashboard = false,
  onBookmark,
}: ListingCardProps) {
  const shouldShowRating = reviewsEnabled && reviewCount > 0;
  const serviceLocations = getServiceLocations({
    category: categoryContext ?? category,
    fallbackLocation: location,
    constructionLocations,
    renovationLocations,
    architectureLocations,
    interiorLocations,
    realEstateLocations,
  });
  const getInitials = (companyName: string) => {
    return companyName
      .split(/\s+/)
      .map(word => word[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };
  const safeImageUrl = imageUrl && !/\/\/lh3\.googleusercontent\.com\/sitesv\//i.test(imageUrl) ? imageUrl : undefined;

  return (
    <Link
      href={buildCompanyProfilePath(
        { _id: id, name },
        { ...(categoryContext ? { from: categoryContext } : {}), ...(returnToDashboard ? { returnTo: "dashboard" } : {}) }
      )}
      className="block"
    >
      <article className={`group relative flex h-[320px] w-[210px] flex-col overflow-hidden rounded-[var(--sf-radius-lg)] border border-[var(--sf-border-1)] bg-[var(--sf-bg-surface)] shadow-[var(--sf-shadow-1)] transition duration-[var(--sf-dur-base)] ease-[var(--sf-ease-out)] hover:-translate-y-0.5 hover:shadow-[var(--sf-shadow-2)] ${isFeatured ? "ring-2 ring-[var(--sf-orange)]" : ""}`}>
        <div className="relative h-[120px] bg-[var(--sf-bg-muted)]">
          {safeImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={safeImageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--sf-stone-300)]">
              <span className="text-[32px] font-semibold text-[var(--sf-fg-2)]">{getInitials(name)}</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/45 to-transparent" />
          {isPro && proEnabled && <span className="sf-pro-pill absolute left-3 top-3">Pro</span>}
          <button
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-[var(--sf-shadow-1)]"
            aria-label={isSaved ? "Remove from shortlist" : "Save to shortlist"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBookmark?.();
            }}
          >
            <svg width="14" height="18" viewBox="0 0 17 22.625" fill={isSaved ? "var(--sf-orange)" : "none"} xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1H16V21.625L8.5 16L1 21.625V1Z" stroke={isSaved ? "var(--sf-orange)" : "var(--sf-ink)"} strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <p className="sf-tag-mono mb-1">{categoryContext ?? category ?? "Company"}</p>
              <h3 className="line-clamp-2 text-[17px] font-semibold leading-[var(--sf-lh-heading)] text-[var(--sf-fg-1)]">{name}</h3>
            </div>
            {shouldShowRating && (
              <span className="font-bam flex shrink-0 items-center gap-1 text-[12px] font-semibold" style={{ color: starColor(rating) }}>
                {rating}
                <svg width="13" height="12" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.93511 0.71955C8.31202 -0.239851 9.68798 -0.23985 10.0649 0.719551L11.6204 4.67914C11.7825 5.09161 12.1742 5.37238 12.6219 5.39695L16.9196 5.63291C17.9609 5.69008 18.3861 6.98113 17.5777 7.63124L14.2414 10.3144C13.8938 10.5939 13.7442 11.0481 13.8589 11.4758L14.9595 15.5812C15.2262 16.576 14.113 17.3739 13.2364 16.8163L9.61892 14.5149C9.24208 14.2752 8.75792 14.2752 8.38108 14.5149L4.76355 16.8163C3.88703 17.3739 2.77385 16.576 3.04053 15.5812L4.14114 11.4758C4.25579 11.0481 4.10618 10.5939 3.75863 10.3144L0.422255 7.63124C-0.386142 6.98113 0.0390565 5.69008 1.08039 5.63291L5.37814 5.39695C5.82584 5.37238 6.21753 5.09161 6.37957 4.67914L7.93511 0.71955Z" fill={starColor(rating)}/>
                </svg>
              </span>
            )}
          </div>
          <p className="mb-4 line-clamp-4 text-[13px] leading-[var(--sf-lh-body)] text-[var(--sf-fg-3)]">{description}</p>
          <div className="mt-auto border-t border-[var(--sf-border-1)] pt-3">
            <div className="flex items-center justify-between gap-3 text-[12px] text-[var(--sf-fg-2)]">
              <span className="line-clamp-1">{serviceLocations}</span>
              <span className="font-bam shrink-0 text-[11px] text-[var(--sf-fg-3)]">{shouldShowRating ? `${reviewCount} reviews` : `${projects || team || 0} projects`}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

function getServiceLocations({
  category,
  fallbackLocation,
  constructionLocations,
  renovationLocations,
  architectureLocations,
  interiorLocations,
  realEstateLocations,
}: {
  category?: string;
  fallbackLocation?: string;
  constructionLocations: string[];
  renovationLocations: string[];
  architectureLocations: string[];
  interiorLocations: string[];
  realEstateLocations: string[];
}) {
  const locationsByCategory: Record<string, string[]> = {
    construction: constructionLocations,
    renovation: renovationLocations,
    architecture: architectureLocations,
    interior: interiorLocations,
    "real-estate": realEstateLocations,
  };

  const categoryLocations = category ? locationsByCategory[category] : undefined;
  const locations = categoryLocations?.length ? categoryLocations : fallbackLocation ? [fallbackLocation] : ["bali"];

  return locations
    .map((item) => item.replace(/-/g, " ").trim())
    .filter(Boolean)
    .map((item) => item.toUpperCase())
    .join(", ");
}
