"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bookmark } from "lucide-react";

interface ListingCardProps {
  id: string;
  name: string;
  description: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  projects?: number;
  team?: number;
  address?: string;
  isPro?: boolean;
  isFeatured?: boolean;
  isSaved?: boolean;
  imageUrl?: string;
  projectImageIds?: string[];
  onBookmark?: () => void;
}

export function ListingCard({
  id,
  name,
  description,
  rating = 4.5,
  reviewCount = 23,
  projects = 75,
  team = 25,
  address = "Jl. Imam Bonjol No.198/249, Pemecutan Klod, Kec. Denpasar Bar., Kota Denpasar, Bali 80119",
  isPro = false,
  isFeatured = false,
  isSaved = false,
  imageUrl,
  projectImageIds = [],
  onBookmark,
}: ListingCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getInitials = (companyName: string) => {
    return companyName
      .split(/\s+/)
      .map(word => word[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Whether to show the thumbnail + pro row
  const hasProRow = isPro || (projectImageIds && projectImageIds.length > 0);

  return (
    <Link href={`/profile/${id}`} className="block">
      <div
        className={`relative w-[210px] h-[230px] rounded-[6px] overflow-hidden cursor-pointer transition-all ${
          isHovered ? 'bg-[#333]' : 'bg-[#f8f8f8]'
        } ${isFeatured ? 'ring-2 ring-[#f14110]' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ===== Normal State ===== */}
        <div className={`absolute inset-0 p-[10px] flex flex-col transition-opacity duration-200 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
          {/* Row 1: Logo + Rating + Bookmark */}
          <div className="flex items-start">
            {/* Logo */}
            <div className="w-[50px] h-[50px] bg-[#d8d8d8] rounded-[6px] overflow-hidden flex-shrink-0">
              {imageUrl && !imageError ? (
                <Image
                  src={imageUrl}
                  alt={name}
                  width={50}
                  height={50}
                  className="object-cover w-full h-full"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#f14110] to-[#e9a28e] flex items-center justify-center">
                  <span className="text-white text-[16px] font-bold">{getInitials(name)}</span>
                </div>
              )}
            </div>

            {/* Rating — centered in gap */}
            <div className="flex-1 flex items-center justify-center pt-[4px]">
              <div className="flex items-center gap-[4px]">
                <Image src="/images/icon-star.svg" alt="" width={18} height={18} />
                <span className="text-[13px] font-semibold text-[#d8d8d8] leading-[17px]">{rating}</span>
              </div>
            </div>

            {/* Bookmark — far right */}
            <button
              className="hover:opacity-70 transition-opacity flex-shrink-0 pt-[2px]"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBookmark?.();
              }}
            >
              <Bookmark
                className={`w-[18px] h-[24px] ${isSaved ? 'fill-[#f14110] text-[#f14110]' : 'fill-none text-[#d8d8d8]'}`}
              />
            </button>
          </div>

          {/* Row 2: Thumbnails + Pro Account (only if isPro or has images) */}
          {hasProRow && (
            <div className="flex items-center gap-[4px] mt-[6px]">
              {/* Thumbnail images */}
              {projectImageIds && projectImageIds.slice(0, 4).map((_, idx) => (
                <div key={idx} className="w-[22px] h-[22px] rounded-[4px] bg-[#d8d8d8] overflow-hidden flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-[#c0c0c0] to-[#a0a0a0]" />
                </div>
              ))}

              {/* Pro Account badge */}
              {isPro && (
                <div className="flex items-center gap-[4px] ml-auto">
                  <span className="text-[9px] text-[#333]/35 font-medium leading-[12px]">Pro Account</span>
                  <Image src="/images/icon-sponsored.svg" alt="" width={18} height={18} />
                </div>
              )}
            </div>
          )}

          {/* Company Name */}
          <div className={`${hasProRow ? 'mt-[8px]' : 'mt-[10px]'} flex-1`}>
            <h3 className="font-semibold text-[16px] leading-[16px] tracking-[0.32px] text-[#333] uppercase line-clamp-4">
              {name}
            </h3>
          </div>

          {/* Description — pinned to bottom */}
          <div className="mt-auto">
            <p className="text-[10px] leading-[14px] tracking-[0.2px] text-[#333]/50 line-clamp-4">
              {description}
            </p>
          </div>
        </div>

        {/* ===== Hover State ===== */}
        <div className={`absolute inset-0 p-[10px] flex flex-col transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {/* Top Icons: Share + Bookmark */}
          <div className="flex items-start justify-between">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="text-[#d8d8d8] hover:text-white transition-colors"
            >
              <svg width="17" height="22" viewBox="0 0 17 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.5 1V14M8.5 1L4 5.5M8.5 1L13 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 11V19C1 19.5523 1.44772 20 2 20H15C15.5523 20 16 19.5523 16 19V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onBookmark?.(); }}
              className="hover:opacity-80 transition-opacity"
            >
              <Bookmark
                className={`w-[16px] h-[22px] ${isSaved ? 'fill-[#f14110] text-[#f14110]' : 'fill-none text-[#d8d8d8]'}`}
              />
            </button>
          </div>

          {/* Facts: Projects + Team */}
          <div className="flex flex-col gap-[10px] mt-[16px]">
            <div className="flex items-center justify-between border-b border-[#d8d8d8]/20 pb-[4px]">
              <span className="text-[10px] text-[#d8d8d8] tracking-[0.2px] leading-[18px]">Projects</span>
              <span className="text-[16px] font-semibold text-[#d8d8d8] tracking-[0.32px] leading-[18px]">+{projects}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#d8d8d8]/20 pb-[4px]">
              <span className="text-[10px] text-[#d8d8d8] tracking-[0.2px] leading-[18px]">Team</span>
              <span className="text-[16px] font-semibold text-[#d8d8d8] tracking-[0.32px] leading-[18px]">+{team}</span>
            </div>
          </div>

          {/* Address */}
          <div className="mt-[8px] flex-1">
            <p className="text-[10px] text-[#d8d8d8]/75 leading-[18px] tracking-[0.2px]">
              {address}
            </p>
          </div>

          {/* Bottom Row: Rating + Arrow */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-[7px]">
              <Image src="/images/icon-star.svg" alt="" width={18} height={18} />
              <span className="text-[13px] font-semibold text-[#d8d8d8] leading-[17px]">{rating}</span>
              <span className="text-[14px] text-[#d8d8d8]/50 tracking-[-0.7px] leading-[12px]">({reviewCount})</span>
            </div>
            <div className="w-[36px] h-[36px] border-2 border-[#e4e4e4] rounded-[6px] flex items-center justify-center">
              <span className="text-[#d8d8d8] text-[24px] leading-none">→</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
