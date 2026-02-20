"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

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
        <div className={`absolute inset-0 transition-opacity duration-200 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
          {/* Logo — 50x50 at (10, 10) */}
          <div className="absolute top-[10px] left-[10px] w-[50px] h-[50px] bg-[#d8d8d8] rounded-[6px] overflow-hidden">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={name}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#f14110] to-[#e9a28e] flex items-center justify-center">
                <span className="text-white text-[16px] font-bold">{getInitials(name)}</span>
              </div>
            )}
          </div>

          {/* Star + Rating — 18x18 star at (70, 12), text at (92, ~14) */}
          <div className="absolute top-[12px] left-[70px] flex items-center gap-[4px]">
            {/* Figma star SVG — 18x18, filled #d8d8d8 */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.438 3.067C7.578 1.022 8.148 0 9 0c.852 0 1.422 1.022 2.562 3.067l.295.53c.324.581.486.872.738 1.063.252.192.567.263 1.197.405l.572.13c2.214.5 3.32.75 3.584 1.598.263.846-.491 1.729-2 3.494l-.39.456c-.429.501-.644.752-.74 1.062-.096.31-.064.645.001 1.314l.06.609c.227 2.355.342 3.533-.348 4.055-.689.523-1.726.046-3.798-0.908l-.537-.247c-.589-.272-.883-.407-1.195-.407-.312 0-.607.135-1.195.407l-.537.247c-2.072.954-3.109 1.431-3.798.909-.69-.524-.576-1.701-.348-4.056l.06-.608c.064-.67.097-1.005 0-1.314-.096-.31-.311-.562-.739-1.062l-.39-.457c-1.51-1.764-2.264-2.647-2-3.494.262-.846 1.37-1.097 3.584-1.598l.573-.13c.63-.142.944-.213 1.196-.405.253-.192.414-.482.738-1.063l.296-.53z" fill="#d8d8d8"/>
            </svg>
            <span className="text-[13px] font-semibold text-[#d8d8d8] leading-[17px]">{rating}</span>
          </div>

          {/* Bookmark — 17x22.6 at right:10px, top ~10px */}
          <button
            className="absolute top-[10px] right-[10px] hover:opacity-70 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBookmark?.();
            }}
          >
            <svg width="17" height="23" viewBox="0 0 17 22.625" fill={isSaved ? '#f14110' : 'none'} xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1H16V21.625L8.5 16L1 21.625V1Z" stroke={isSaved ? '#f14110' : '#D8D8D8'} strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Pro Account badge — icon at (182, 40), pill at (86, 42) w=91 h=16 */}
          {isPro && (
            <div className="absolute top-[40px] right-[8px] flex items-center gap-[4px]">
              <div className="bg-[#e4e4e4] rounded-[10px] h-[16px] px-[8px] flex items-center">
                <span className="text-[9px] text-[#333]/35 font-medium leading-[12px]">Pro Account</span>
              </div>
              <Image src="/images/icon-sponsored.svg" alt="" width={20} height={20} />
            </div>
          )}

          {/* Company Name — from ~30% to ~35% of height = top:70px */}
          <div className="absolute top-[70px] left-[10px] right-[10px] bottom-[80px]">
            <h3 className="font-semibold text-[16px] leading-[16px] tracking-[0.32px] text-[#333] uppercase line-clamp-4">
              {name}
            </h3>
          </div>

          {/* Description — from ~64% of height = top:147px */}
          <div className="absolute top-[147px] left-[10px] right-[10px] bottom-[4px]">
            <p className="text-[10px] leading-[14px] tracking-[0.2px] text-[#333]/50 line-clamp-4" style={{ fontFamily: "'Sora', sans-serif" }}>
              {description}
            </p>
          </div>
        </div>

        {/* ===== Hover State ===== */}
        <div className={`absolute inset-0 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {/* Share — top-left (10, 10) */}
          <button
            className="absolute top-[10px] left-[10px] hover:opacity-80 transition-opacity"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <svg width="17" height="22" viewBox="0 0 17 22.4" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.68 8.933H14.34c.44 0 .862.175 1.174.487.311.311.486.734.486 1.175v9.143c0 .441-.175.864-.486 1.175a1.659 1.659 0 01-1.174.487H2.66a1.659 1.659 0 01-1.174-.487A1.664 1.664 0 011 19.738v-9.143c0-.441.175-.863.486-1.175a1.659 1.659 0 011.174-.487h1.659M11.819 4.323L8.5 1m0 0L5.181 4.323M8.5 1v14.131" stroke="#D8D8D8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Bookmark — top-right */}
          <button
            className="absolute top-[10px] right-[10px] hover:opacity-80 transition-opacity"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onBookmark?.(); }}
          >
            <svg width="17" height="23" viewBox="0 0 17 22.625" fill={isSaved ? '#f14110' : 'none'} xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1H16V21.625L8.5 16L1 21.625V1Z" stroke={isSaved ? '#f14110' : '#D8D8D8'} strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Facts: Projects + Team — starting at top:49px */}
          <div className="absolute top-[49px] left-[10px] right-[10px] flex flex-col gap-[10px]">
            <div className="flex items-center justify-between border-b border-[#d8d8d8]/20 pb-[4px]">
              <span className="text-[10px] text-[#d8d8d8] tracking-[0.2px] leading-[18px]">Projects</span>
              <span className="text-[16px] font-semibold text-[#d8d8d8] tracking-[0.32px] leading-[18px] text-right">+{projects}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#d8d8d8]/20 pb-[4px]">
              <span className="text-[10px] text-[#d8d8d8] tracking-[0.2px] leading-[18px]">Team</span>
              <span className="text-[16px] font-semibold text-[#d8d8d8] tracking-[0.32px] leading-[18px] text-right">+{team}</span>
            </div>
          </div>

          {/* Address — at top:104px, 190px wide, 75px tall */}
          <div className="absolute top-[104px] left-[10px] w-[190px] h-[75px] flex items-center">
            <p className="text-[10px] text-[#d8d8d8]/75 leading-[18px] tracking-[0.2px]">
              {address}
            </p>
          </div>

          {/* Bottom: Rating + Arrow — at bottom:10px */}
          <div className="absolute bottom-[10px] left-[10px] right-[10px] flex items-center justify-between">
            <div className="flex items-center gap-[7px]">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.438 3.067C7.578 1.022 8.148 0 9 0c.852 0 1.422 1.022 2.562 3.067l.295.53c.324.581.486.872.738 1.063.252.192.567.263 1.197.405l.572.13c2.214.5 3.32.75 3.584 1.598.263.846-.491 1.729-2 3.494l-.39.456c-.429.501-.644.752-.74 1.062-.096.31-.064.645.001 1.314l.06.609c.227 2.355.342 3.533-.348 4.055-.689.523-1.726.046-3.798-0.908l-.537-.247c-.589-.272-.883-.407-1.195-.407-.312 0-.607.135-1.195.407l-.537.247c-2.072.954-3.109 1.431-3.798.909-.69-.524-.576-1.701-.348-4.056l.06-.608c.064-.67.097-1.005 0-1.314-.096-.31-.311-.562-.739-1.062l-.39-.457c-1.51-1.764-2.264-2.647-2-3.494.262-.846 1.37-1.097 3.584-1.598l.573-.13c.63-.142.944-.213 1.196-.405.253-.192.414-.482.738-1.063l.296-.53z" fill="#d8d8d8"/>
              </svg>
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
