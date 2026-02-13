import Image from "next/image";

interface AdBannerProps {
  imageSrc?: string;
  alt?: string;
}

export function AdBanner({
  imageSrc,
  alt = "Advertisement"
}: AdBannerProps) {
  return (
    <div className="relative w-[730px] h-[158px] mx-auto rounded-[10px] overflow-hidden bg-[#d8d8d8]">
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[#999] text-sm">
          Ad Space - 730 x 158
        </div>
      )}
    </div>
  );
}
