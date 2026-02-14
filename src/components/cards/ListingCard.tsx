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

  return (
    <Link href={`/profile/${id}`} className="block">
      <div
        className={`relative w-[210px] h-[230px] rounded-[6px] overflow-hidden cursor-pointer transition-all ${
          isHovered ? 'bg-[#333]' : 'bg-[#f8f8f8]'
        } ${isFeatured ? 'ring-2 ring-[#f14110]' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Normal State */}
        <div className={`absolute inset-0 transition-opacity duration-200 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
          {/* Top Row */}
          <div className="absolute top-[10px] left-[10px] right-[10px] flex items-start justify-between">
            {/* Left: Logo */}
            <div className="w-[50px] h-[50px] bg-[#d8d8d8] rounded-[6px] overflow-hidden">
              <Image
                src={imageUrl || "/images/card-sample.png"}
                alt=""
                width={50}
                height={50}
                className="object-cover w-full h-full"
              />
            </div>

            {/* Right: Rating and Bookmark */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Image src="/images/icon-star.svg" alt="" width={18} height={18} />
                <span className="text-[13px] font-semibold text-[#d8d8d8]">{rating}</span>
              </div>
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
          </div>

          {/* Pro Account Badge */}
          {isPro && (
            <div className="absolute top-[40px] right-[8px] flex items-center gap-1">
              <Image src="/images/icon-sponsored.svg" alt="" width={20} height={20} />
              <div className="bg-[#e4e4e4] rounded-[10px] px-2 py-0.5">
                <span className="text-[9px] text-[#333]/35 font-medium">Pro Account</span>
              </div>
            </div>
          )}

          {/* Colored dots */}
          <div className="absolute top-[40px] left-[70px] flex gap-1">
            <div className="w-4 h-4 rounded-full bg-[#f14110]" />
            <div className="w-4 h-4 rounded-full bg-[#e9a28e]" />
            <div className="w-4 h-4 rounded-full bg-[#f4c542]" />
          </div>

          {/* Company Name */}
          <div className="absolute top-[70px] left-[10px] right-[10px]">
            <h3 className="font-semibold text-[16px] leading-[16px] tracking-[0.32px] text-[#333] uppercase line-clamp-3">
              {name}
            </h3>
          </div>

          {/* Description */}
          <div className="absolute bottom-[10px] left-[10px] right-[10px]">
            <p className="text-[10px] leading-[14px] tracking-[0.2px] text-[#333]/50 line-clamp-3">
              {description}
            </p>
          </div>
        </div>

        {/* Hover State */}
        <div className={`absolute inset-0 p-4 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {/* Top Icons */}
          <div className="flex items-start justify-between mb-4">
            {/* Share Icon */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="text-[#d8d8d8] hover:text-white transition-colors"
            >
              <svg width="20" height="22" viewBox="0 0 17 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.5 1V14M8.5 1L4 5.5M8.5 1L13 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 11V19C1 19.5523 1.44772 20 2 20H15C15.5523 20 16 19.5523 16 19V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Bookmark Icon */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBookmark?.();
              }}
              className="hover:opacity-80 transition-opacity"
            >
              <Bookmark
                className={`w-[16px] h-[22px] ${isSaved ? 'fill-[#f14110] text-[#f14110]' : 'fill-none text-[#d8d8d8]'}`}
              />
            </button>
          </div>

          {/* Projects */}
          <div className="flex items-center justify-between border-b border-[#d8d8d8]/20 py-2">
            <span className="text-[12px] text-[#f8f8f8] tracking-[0.24px]">Projects</span>
            <span className="text-[18px] font-bold text-[#f8f8f8]">+{projects}</span>
          </div>

          {/* Team */}
          <div className="flex items-center justify-between border-b border-[#d8d8d8]/20 py-2">
            <span className="text-[12px] text-[#f8f8f8] tracking-[0.24px]">Team</span>
            <span className="text-[18px] font-bold text-[#f8f8f8]">+{team}</span>
          </div>

          {/* Address */}
          <div className="py-2">
            <p className="text-[10px] text-[#d8d8d8]/80 leading-[14px] tracking-[0.2px]">
              {address}
            </p>
          </div>

          {/* Bottom Row - Rating and Arrow */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            {/* Rating */}
            <div className="flex items-center gap-1">
              <Image src="/images/icon-star.svg" alt="" width={20} height={20} />
              <span className="text-[14px] font-semibold text-[#f8f8f8]">{rating}</span>
              <span className="text-[12px] text-[#d8d8d8]/60">({reviewCount})</span>
            </div>

            {/* Arrow Button */}
            <div className="w-10 h-10 bg-[#f8f8f8] rounded-[6px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8H13M13 8L8 3M13 8L8 13" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
