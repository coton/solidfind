import Link from "next/link";
import Image from "next/image";

export function WelcomeCard() {
  return (
    <Link href="/about" className="block">
      <div className="relative w-[210px] h-[220px] bg-[#f8f8f8] rounded-[6px] overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]">
        {/* Orange gradient top section - rounded top, square bottom */}
        <div
          className="absolute top-0 left-0 right-0 h-[120px] rounded-t-[6px] flex items-end p-[10px]"
          style={{
            background: "linear-gradient(to left, #f14110, #e9a28e)"
          }}
        >
          {/* Logo */}
          <div className="flex items-baseline h-[13px]">
            <Image src="/images/logo-full-white.svg" alt="SolidFind.id" width={120} height={13} className="h-[13px] w-auto" />
          </div>
        </div>

        {/* Text bottom section - 11px font size, 4 lines max, 20px from gradient */}
        <div className="absolute top-[140px] left-[10px] right-[10px] bottom-[20px]">
          <p className="text-[11px] leading-[15px] tracking-[0.22px] text-[#333] font-bold line-clamp-4" style={{ fontFamily: "'Sora', sans-serif" }}>
            We help you find trusted professionals to build, renovate, design and shape the places you live in.
          </p>
        </div>
      </div>
    </Link>
  );
}
