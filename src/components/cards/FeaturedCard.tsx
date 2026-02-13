import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight } from "lucide-react";

interface FeaturedCardProps {
  id?: string;
  image: string;
  title: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
}

export function FeaturedCard({
  id = "featured",
  image,
  title,
  address,
  rating = 4.5,
  reviewCount = 23,
}: FeaturedCardProps) {
  return (
    <Link href={`/profile/${id}`} className="block">
      <div className="relative w-[210px] h-[230px] bg-[#f8f8f8] rounded-[6px] overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]">
        {/* Image - top half */}
        <div className="relative h-[120px] w-full">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover rounded-t-[6px]"
          />
        </div>

        {/* Content - bottom half */}
        <div className="p-[10px] pt-3">
          <h3 className="font-semibold text-[16px] leading-[16px] tracking-[0.32px] text-[#333] uppercase mb-2">
            {title}
          </h3>
          {address && (
            <p className="text-[9px] text-[#333]/70 leading-[12px] mb-3 line-clamp-2">
              {address}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-[#f4c542] text-[#f4c542]" />
              <span className="text-[11px] font-medium text-[#333]">{rating}</span>
              <span className="text-[11px] text-[#333]/50">({reviewCount})</span>
            </div>
            <div className="w-[24px] h-[24px] rounded-full border border-[#333]/20 flex items-center justify-center hover:bg-[#333]/5 transition-colors">
              <ArrowRight className="w-3 h-3 text-[#333]" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
