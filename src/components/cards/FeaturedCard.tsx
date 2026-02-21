import Link from "next/link";
import Image from "next/image";

interface FeaturedCardProps {
  id?: string;
  href?: string;
  image: string;
  title: string;
}

export function FeaturedCard({
  id,
  href,
  image,
  title,
}: FeaturedCardProps) {
  const linkHref = href ?? (id ? `/profile/${id}` : "/about");

  return (
    <Link href={linkHref} className="block">
      <div className="relative w-[210px] h-[220px] bg-[#f8f8f8] rounded-[6px] overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]">
        {/* Image - top half */}
        <div className="relative h-[120px] w-full">
          <Image
            src={image}
            alt={title}
            fill
            sizes="210px"
            loading="eager"
            className="object-cover rounded-t-[6px]"
          />
        </div>

        {/* Content - bottom half */}
        <div className="p-[10px] pt-3">
          <h3 className="font-semibold text-[16px] leading-[16px] tracking-[0.32px] text-[#333] uppercase">
            {title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
