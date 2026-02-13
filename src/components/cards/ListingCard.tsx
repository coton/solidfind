import Link from "next/link";
import Image from "next/image";

interface ListingCardProps {
  id: string;
  name: string;
  description: string;
  rating?: number;
  isPro?: boolean;
  isFeatured?: boolean;
  isSaved?: boolean;
}

export function ListingCard({
  id,
  name,
  description,
  rating = 4.5,
  isPro = false,
  isFeatured = false,
  isSaved = false,
}: ListingCardProps) {
  return (
    <Link href={`/profile/${id}`} className="block">
      <div className={`relative w-[210px] h-[230px] bg-[#f8f8f8] rounded-[6px] overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${isFeatured ? 'ring-2 ring-[#f14110]' : ''}`}>
        {/* Top Row */}
        <div className="absolute top-[10px] left-[10px] right-[10px] flex items-start justify-between">
          {/* Left: Logo */}
          <div className="w-[50px] h-[50px] bg-[#d8d8d8] rounded-[6px] overflow-hidden">
            <Image
              src="/images/card-sample.png"
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
                // Toggle save logic here
              }}
            >
              <Image
                src="/images/icon-bookmark.svg"
                alt="Save"
                width={16}
                height={22}
                className={isSaved ? 'opacity-100' : 'opacity-40'}
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

        {/* Colored dots (shown when featured) */}
        {isFeatured && (
          <div className="absolute top-[40px] left-[70px] flex gap-1">
            <div className="w-4 h-4 rounded-full bg-[#f14110]" />
            <div className="w-4 h-4 rounded-full bg-[#e9a28e]" />
            <div className="w-4 h-4 rounded-full bg-[#f4c542]" />
          </div>
        )}

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
    </Link>
  );
}
