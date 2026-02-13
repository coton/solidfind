import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight } from "lucide-react";

interface StatsCardProps {
  id?: string;
  projects?: number;
  team?: number;
  address?: string;
  rating?: number;
  reviewCount?: number;
}

export function StatsCard({
  id = "stats",
  projects = 75,
  team = 25,
  address = "Jl. Imam Bonjol No.198/249, Pemecutan Klod, Kec. Denpasar Bar., Kota Denpasar, Bali 80119",
  rating = 4.5,
  reviewCount = 23,
}: StatsCardProps) {
  return (
    <Link href={`/profile/${id}`} className="block">
      <div className="relative w-[210px] h-[230px] bg-[#333] rounded-[6px] overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]">
        {/* Action Buttons */}
        <div className="absolute top-[10px] left-[10px] right-[10px] flex justify-between">
          {/* Share icon */}
          <button
            className="hover:opacity-70 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <svg width="17" height="22" viewBox="0 0 17 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.5 1V14M8.5 1L4 5.5M8.5 1L13 5.5" stroke="#d8d8d8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 11V19C1 19.5523 1.44772 20 2 20H15C15.5523 20 16 19.5523 16 19V11" stroke="#d8d8d8" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          {/* Bookmark icon */}
          <button
            className="hover:opacity-70 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Image src="/images/icon-bookmark.svg" alt="Save" width={16} height={22} className="opacity-60" />
          </button>
        </div>

        {/* Stats */}
        <div className="absolute top-[49px] left-[10px] right-[10px] space-y-0">
          <div className="flex justify-between items-center border-b border-[#d8d8d8]/20 py-[6px]">
            <span className="text-[10px] text-[#d8d8d8] tracking-[0.2px]">Projects</span>
            <span className="font-semibold text-[16px] text-[#d8d8d8] tracking-[0.32px]">+{projects}</span>
          </div>
          <div className="flex justify-between items-center border-b border-[#d8d8d8]/20 py-[6px]">
            <span className="text-[10px] text-[#d8d8d8] tracking-[0.2px]">Team</span>
            <span className="font-semibold text-[16px] text-[#d8d8d8] tracking-[0.32px]">+{team}</span>
          </div>
        </div>

        {/* Address */}
        <div className="absolute top-[120px] left-[10px] right-[10px]">
          <p className="text-[10px] leading-[18px] tracking-[0.2px] text-[#d8d8d8]/75 line-clamp-4">
            {address}
          </p>
        </div>

        {/* Rating and Arrow */}
        <div className="absolute bottom-[10px] left-[10px] right-[10px] flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-[18px] h-[18px] fill-[#f4c542] text-[#f4c542]" />
            <span className="text-[13px] font-semibold text-[#d8d8d8]">{rating}</span>
            <span className="text-[14px] text-[#d8d8d8]/50 tracking-[-0.7px]">({reviewCount})</span>
          </div>
          <div className="w-[36px] h-[36px] rounded-[6px] border-2 border-[#e4e4e4] flex items-center justify-center hover:bg-white/5 transition-colors">
            <ArrowRight className="w-5 h-5 text-[#d8d8d8]" />
          </div>
        </div>
      </div>
    </Link>
  );
}
