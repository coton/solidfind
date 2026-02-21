import Link from "next/link";
import Image from "next/image";

export function WelcomeCard() {
  return (
    <Link href="/about" className="block">
      <div className="relative w-[210px] h-[230px] bg-[#f8f8f8] rounded-[6px] overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]">
        {/* Logo thumbnail - 60x60 at top-left */}
        <div
          className="absolute top-[10px] left-[10px] w-[60px] h-[60px] rounded-[6px] flex items-center justify-center p-[8px]"
          style={{
            background: "linear-gradient(to left, #f14110, #e9a28e)"
          }}
        >
          <Image src="/images/logo-full-white.svg" alt="SolidFind.id" width={44} height={8} className="w-auto h-auto max-w-full max-h-full" />
        </div>

        {/* Title below thumbnail */}
        <div className="absolute top-[80px] left-[10px] right-[10px]">
          <h3 className="font-semibold text-[16px] leading-[16px] tracking-[0.32px] text-[#333] uppercase mb-[10px]">
            SOLIDFIND .id
          </h3>
        </div>

        {/* Description text - with 20px bottom padding */}
        <div className="absolute top-[117px] left-[10px] right-[10px] bottom-[20px]">
          <p className="text-[10px] leading-[14px] tracking-[0.2px] text-[#333]/50 line-clamp-6" style={{ fontFamily: "'Sora', sans-serif" }}>
            We help you find trusted professionals to build, renovate, design and shape the places you live in.
          </p>
        </div>
      </div>
    </Link>
  );
}
