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
  returnToDashboard = false,
  onBookmark,
}: ListingCardProps) {
  const coverUrl = "/assets/company-cover-fallback.jpg";
  const showReviews = reviewsEnabled;
  const shouldShowRating = showReviews && reviewCount > 0;
  const reviewLabel = reviewCount === 1 ? "1 review" : `${reviewCount} reviews`;
  const serviceLocations = getServiceLocations({
    category: categoryContext ?? category,
    fallbackLocation: location,
    constructionLocations,
    renovationLocations,
    architectureLocations,
    interiorLocations,
    realEstateLocations,
  });
  const primaryLocation = getPrimaryLocation(serviceLocations, location);
  const serviceLabel = [
    getCategoryLabel(categoryContext ?? category),
    primaryLocation,
  ].filter(Boolean).join(" · ");

  return (
    <Link
      href={buildCompanyProfilePath(
        { _id: id, name },
        { ...(categoryContext ? { from: categoryContext } : {}), ...(returnToDashboard ? { returnTo: "dashboard" } : {}) }
      )}
      className="block min-w-0"
    >
      <article className={`sf-pro-card ${isFeatured ? "sf-pro-card-featured" : ""}`}>
        <div className="sf-pro-photo">
          {/* Browse cards use neutral cover imagery; company logos remain for profile pages. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverUrl} alt="" />
          {isPro && proEnabled && (
            <span className="sf-pro-badge">
              <span className="d" />
              Pro Account
            </span>
          )}
          <div className="sf-pro-actions">
            <button
              className="sf-pro-iconbtn"
              aria-label={`Share ${name}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
              </svg>
            </button>
          <button
              className={`sf-pro-iconbtn sf-bookmark ${isSaved ? "is-marked" : ""}`}
              aria-label={isSaved ? `Remove ${name} from saved listings` : `Save ${name}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBookmark?.();
            }}
          >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          </div>
        </div>
        <div className="sf-pro-body">
          <div className="sf-pro-head">
            <h3 className="sf-pro-name">{name}</h3>
            {shouldShowRating && (
              <span className="sf-pro-rating" style={{ color: starColor(rating) }}>
                <svg width="12" height="12" viewBox="0 0 18 17" fill="currentColor" aria-hidden="true">
                  <path d="M7.93511 0.71955C8.31202 -0.239851 9.68798 -0.23985 10.0649 0.719551L11.6204 4.67914C11.7825 5.09161 12.1742 5.37238 12.6219 5.39695L16.9196 5.63291C17.9609 5.69008 18.3861 6.98113 17.5777 7.63124L14.2414 10.3144C13.8938 10.5939 13.7442 11.0481 13.8589 11.4758L14.9595 15.5812C15.2262 16.576 14.113 17.3739 13.2364 16.8163L9.61892 14.5149C9.24208 14.2752 8.75792 14.2752 8.38108 14.5149L4.76355 16.8163C3.88703 17.3739 2.77385 16.576 3.04053 15.5812L4.14114 11.4758C4.25579 11.0481 4.10618 10.5939 3.75863 10.3144L0.422255 7.63124C-0.386142 6.98113 0.0390565 5.69008 1.08039 5.63291L5.37814 5.39695C5.82584 5.37238 6.21753 5.09161 6.37957 4.67914L7.93511 0.71955Z" />
                </svg>
                {rating.toFixed(1)}
              </span>
            )}
          </div>
          <p className="sf-pro-meta">{serviceLabel}</p>
          <p className="sf-pro-desc">{description}</p>
          <div className="sf-pro-foot">
            <span className="sf-tag-mono">{shouldShowRating ? reviewLabel : primaryLocation || (projects > 0 ? `${projects}+ projects` : team > 0 ? `${team}+ team` : serviceLocations)}</span>
            <span className="sf-pri-link">View →</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function getCategoryLabel(category?: string) {
  const labels: Record<string, string> = {
    construction: "Construction",
    renovation: "Home renovation",
    architecture: "Architecture",
    interior: "Interior",
    "real-estate": "Real estate",
  };
  return category ? labels[category] ?? toTitleCase(category.replace(/-/g, " ")) : "Professional";
}

function getPrimaryLocation(serviceLocations?: string, fallbackLocation?: string) {
  const raw = (serviceLocations || fallbackLocation || "").split(",")[0]?.trim();
  if (!raw || raw.toLowerCase() === "bali") return undefined;
  return toTitleCase(raw);
}

function toTitleCase(value: string) {
  return value
    .replace(/-/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
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
