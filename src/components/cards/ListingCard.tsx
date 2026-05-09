"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
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
  logoId,
  onBookmark,
}: ListingCardProps) {
  const logoUrl = useQuery(api.files.getUrl, logoId ? { storageId: logoId as Id<"_storage"> } : "skip");
  const resolvedImageUrl = logoUrl ?? imageUrl;
  const [isHovered, setIsHovered] = useState(false);
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
  
  // Debug logging
  if (typeof window !== 'undefined' && resolvedImageUrl) {
    console.log(`[ListingCard] ${name} imageUrl:`, resolvedImageUrl);
  }

  const getInitials = (companyName: string) => {
    return companyName
      .split(/\s+/)
      .map(word => word[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Format name with forced line break after first word
  const formatNameWithBreak = (fullName: string) => {
    const words = fullName.trim().split(/\s+/);
    if (words.length <= 1) return fullName;
    
    const firstWord = words[0];
    const rest = words.slice(1).join(' ');
    
    return (
      <>
        {firstWord}
        <br />
        {rest}
      </>
    );
  };

  return (
    <Link href={buildCompanyProfilePath({ _id: id, name }, categoryContext ? { from: categoryContext } : {})} className="block">
      <div
        className={`relative w-[210px] h-[220px] rounded-[6px] overflow-hidden cursor-pointer transition-all ${
          isHovered ? 'bg-[#333]' : 'bg-[#f8f8f8]'
        } ${isFeatured ? 'ring-2 ring-[#f14110]' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ===== Normal State ===== */}
        <div className={`absolute inset-0 transition-opacity duration-200 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
          {/* Logo — 70x70 at (10, 10) */}
          <div className="absolute top-[10px] left-[10px] w-[70px] h-[70px] bg-[#d8d8d8] rounded-[6px] overflow-hidden">
            {resolvedImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolvedImageUrl}
                alt={name}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-[#d8d8d8] flex items-center justify-center">
                <span className="text-[#333] text-[20px] font-bold">{getInitials(name)}</span>
              </div>
            )}
          </div>

          {/* Pro Account badge — min-width 80px, decreased padding */}
          {isPro && proEnabled && (
            <div className="absolute top-[45px] right-[10px]">
              <div className="bg-[#E4E4E4] rounded-[10px] h-[16px] px-[8px] flex items-center min-w-[80px] justify-center">
                <span className="font-bam text-[9px] text-[#333]/35 leading-[12px]">Pro Account</span>
              </div>
            </div>
          )}

          {/* Rating: Number first, then star — star at right-[50px] */}
          {shouldShowRating && <div className="absolute top-[12px] right-[50px] flex items-center gap-[4px]">
            <span className="font-bam text-[11px] font-bold leading-[15px] tracking-[-0.2em] text-right" style={{ color: starColor(rating) }}>{rating}</span>
            <svg width="16" height="15" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.93511 0.71955C8.31202 -0.239851 9.68798 -0.23985 10.0649 0.719551L11.6204 4.67914C11.7825 5.09161 12.1742 5.37238 12.6219 5.39695L16.9196 5.63291C17.9609 5.69008 18.3861 6.98113 17.5777 7.63124L14.2414 10.3144C13.8938 10.5939 13.7442 11.0481 13.8589 11.4758L14.9595 15.5812C15.2262 16.576 14.113 17.3739 13.2364 16.8163L9.61892 14.5149C9.24208 14.2752 8.75792 14.2752 8.38108 14.5149L4.76355 16.8163C3.88703 17.3739 2.77385 16.576 3.04053 15.5812L4.14114 11.4758C4.25579 11.0481 4.10618 10.5939 3.75863 10.3144L0.422255 7.63124C-0.386142 6.98113 0.0390565 5.69008 1.08039 5.63291L5.37814 5.39695C5.82584 5.37238 6.21753 5.09161 6.37957 4.67914L7.93511 0.71955Z" fill={starColor(rating)}/>
            </svg>
          </div>}

          {/* Bookmark — top-right, D8D8D8 static */}
          <button
            className="absolute top-[10px] right-[10px] origin-top-right scale-90 hover:opacity-70 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBookmark?.();
            }}
          >
            <svg width="16" height="21" viewBox="0 0 17 22.625" fill={isSaved ? '#f14110' : 'none'} xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1H16V21.625L8.5 16L1 21.625V1Z" stroke={isSaved ? '#f14110' : '#D8D8D8'} strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Company Name — 2 lines max, 20px gap from thumbnail (starts at 100px) */}
          <div className="absolute top-[100px] left-[10px] right-[10px]">
            <h3 
              className="font-semibold text-[16px] leading-[16px] tracking-[0.32px] text-[#333] uppercase overflow-hidden"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                maxHeight: '32px' // 16px * 2 lines
              }}
            >
              {formatNameWithBreak(name)}
            </h3>
          </div>

          {/* Description — 20px gap from title (starts at 152px), 20px from bottom, max 4 lines */}
          <div className="absolute top-[152px] left-[10px] right-[10px] bottom-[20px]">
            <p className="text-[10px] leading-[14px] tracking-[0.2px] text-[#333]/50 line-clamp-4" style={{ fontFamily: "'Sora', sans-serif" }}>
              {description}
            </p>
          </div>
        </div>

        {/* ===== Hover State ===== */}
        <div className={`absolute inset-0 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {/* Share — top-left (10, 10) - orange on hover */}
          <button
            className="absolute top-[10px] left-[10px] hover:opacity-80 transition-opacity"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <svg width="17" height="22" viewBox="0 0 17 22.4" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.68 8.933H14.34c.44 0 .862.175 1.174.487.311.311.486.734.486 1.175v9.143c0 .441-.175.864-.486 1.175a1.659 1.659 0 01-1.174.487H2.66a1.659 1.659 0 01-1.174-.487A1.664 1.664 0 011 19.738v-9.143c0-.441.175-.863.486-1.175a1.659 1.659 0 011.174-.487h1.659M11.819 4.323L8.5 1m0 0L5.181 4.323M8.5 1v14.131" stroke="#f14110" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Bookmark — top-right - orange on hover */}
          <button
            className="absolute top-[10px] right-[10px] origin-top-right scale-90 hover:opacity-80 transition-opacity"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onBookmark?.(); }}
          >
            <svg width="16" height="21" viewBox="0 0 17 22.625" fill={isSaved ? '#f14110' : 'none'} xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1H16V21.625L8.5 16L1 21.625V1Z" stroke="#f14110" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Facts: Projects + Team — starting at top:49px */}
          <div className="absolute top-[49px] left-[10px] right-[10px] flex flex-col gap-[10px]">
            {projects > 0 && <div className="flex items-center justify-between border-b border-[#d8d8d8]/20 pb-[4px]">
              <span className="font-bam text-[11px] text-[#d8d8d8] tracking-[0.2px] leading-[18px]">Projects</span>
              <span className="text-[16px] font-semibold text-[#d8d8d8] tracking-[0.32px] leading-[18px] text-right">+{projects}</span>
            </div>}
            {team > 0 && <div className="flex items-center justify-between border-b border-[#d8d8d8]/20 pb-[4px]">
              <span className="font-bam text-[11px] text-[#d8d8d8] tracking-[0.2px] leading-[18px]">Team</span>
              <span className="text-[16px] font-semibold text-[#d8d8d8] tracking-[0.32px] leading-[18px] text-right">+{team}</span>
            </div>}
          </div>

          {/* Services location */}
          <div className="absolute top-[130px] left-[10px] right-[10px] bottom-[16px]">
            <p className="font-bam text-[11px] text-[#d8d8d8] leading-[18px] tracking-[0.2px] mb-[6px]">
              Services Location:
            </p>
            <p className="text-[16px] font-semibold text-[#d8d8d8] leading-[22px] tracking-[0.32px] uppercase line-clamp-2">
              {serviceLocations}
            </p>
          </div>
        </div>
      </div>
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
