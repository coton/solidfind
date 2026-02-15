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
        <div className={`absolute inset-0 transition-opacity duration-200 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
          {/* Logo — top-left 10,10 — 50x50 */}
          <div className="absolute top-[10px] left-[10px] w-[50px] h-[50px] bg-[#d8d8d8] rounded-[6px] overflow-hidden">
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

          {/* Rating — left:70px top:12px */}
          <div className="absolute top-[12px] left-[70px] flex items-center gap-[4px]">
            <Image src="/images/icon-star.svg" alt="" width={18} height={18} />
            <span className="text-[13px] font-semibold text-[#d8d8d8] leading-[17px]">{rating}</span>
          </div>

          {/* Bookmark — top-right corner */}
          <div className="absolute top-[10px] right-[10px]">
            <button
              className="hover:opacity-70 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBookmark?.();
              }}
            >
              <Bookmark
                className={`w-[16px] h-[22px] ${isSaved ? 'fill-[#f14110] text-[#f14110]' : 'fill-none text-[#d8d8d8]'}`}
              />
            </button>
          </div>

          {/* Pro Account Badge — below logo area */}
          {isPro && (
            <div className="absolute top-[40px] right-[8px] flex items-center gap-1">
              <Image src="/images/icon-sponsored.svg" alt="" width={20} height={20} />
              <div className="bg-[#e4e4e4] rounded-[10px] px-2 py-0.5">
                <span className="text-[9px] text-[#333]/35 font-medium leading-[12px]" style={{ fontFamily: "'Basically A Mono', monospace" }}>Pro Account</span>
              </div>
            </div>
          )}

          {/* Company Name — top:70px */}
          <div className="absolute top-[70px] left-[10px] right-[10px] bottom-[80px]">
            <h3 className="font-semibold text-[16px] leading-[16px] tracking-[0.32px] text-[#333] uppercase line-clamp-4">
              {name}
            </h3>
          </div>

          {/* Description — bottom area starting ~63.9% from top */}
          <div className="absolute top-[147px] left-[11px] right-[10px] bottom-0">
            <p className="text-[10px] leading-[14px] tracking-[0.2px] text-[#333]/50 line-clamp-4">
              {description}
            </p>
          </div>
        </div>

        {/* ===== Hover State ===== */}
        <div className={`absolute inset-0 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {/* Share — top-left */}
          <div className="absolute top-[10px] left-[10px]">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="text-[#d8d8d8] hover:text-white transition-colors"
            >
              <svg width="17" height="22" viewBox="0 0 17 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.5 1V14M8.5 1L4 5.5M8.5 1L13 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 11V19C1 19.5523 1.44772 20 2 20H15C15.5523 20 16 19.5523 16 19V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Bookmark — top-right (same position as normal state) */}
          <div className="absolute top-[10px] right-[10px]">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onBookmark?.(); }}
              className="hover:opacity-80 transition-opacity"
            >
              <Bookmark
                className={`w-[16px] h-[22px] ${isSaved ? 'fill-[#f14110] text-[#f14110]' : 'fill-none text-[#d8d8d8]'}`}
              />
            </button>
          </div>

          {/* Facts: Projects + Team — starting at ~21% from top */}
          <div className="absolute top-[49px] left-[10px] right-[10px] flex flex-col gap-[10px]">
            {/* Projects */}
            <div className="flex items-center justify-between border-b border-[#d8d8d8]/20 pb-[4px]">
              <span className="text-[10px] text-[#d8d8d8] tracking-[0.2px] leading-[18px]">Projects</span>
              <span className="text-[16px] font-semibold text-[#d8d8d8] tracking-[0.32px] leading-[18px]">+{projects}</span>
            </div>
            {/* Team */}
            <div className="flex items-center justify-between border-b border-[#d8d8d8]/20 pb-[4px]">
              <span className="text-[10px] text-[#d8d8d8] tracking-[0.2px] leading-[18px]">Team</span>
              <span className="text-[16px] font-semibold text-[#d8d8d8] tracking-[0.32px] leading-[18px]">+{team}</span>
            </div>
          </div>

          {/* Address — middle area */}
          <div className="absolute top-[104px] left-[10px] w-[190px] h-[75px] flex items-center">
            <p className="text-[10px] text-[#d8d8d8]/75 leading-[18px] tracking-[0.2px]">
              {address}
            </p>
          </div>

          {/* Bottom Row: Rating + Arrow */}
          <div className="absolute bottom-[10px] left-[10px] right-[10px] flex items-center justify-between">
            <div className="flex items-center gap-[7px]">
              <Image src="/images/icon-star.svg" alt="" width={18} height={18} />
              <span className="text-[13px] font-semibold text-[#d8d8d8] leading-[17px]">{rating}</span>
              <span className="text-[14px] text-[#d8d8d8]/50 tracking-[-0.7px] leading-[12px]" style={{ fontFamily: "'Basically A Mono', monospace" }}>({reviewCount})</span>
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
