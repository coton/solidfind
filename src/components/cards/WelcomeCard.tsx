import Link from "next/link";
import Image from "next/image";

export function WelcomeCard() {
  return (
    <Link href="/about" className="block">
      <div className="relative w-[210px] h-[230px] bg-[#f8f8f8] rounded-[6px] overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]">
        {/* Orange gradient top section */}
        <div
          className="absolute top-0 left-0 right-0 h-[120px] rounded-[6px] flex items-end p-[10px]"
          style={{
            background: "linear-gradient(to left, #f14110, #e9a28e)"
          }}
        >
          {/* Logo */}
          <div className="flex items-baseline h-[13px]">
            <Image src="/images/logo-solid-white.svg" alt="SOLID" width={54} height={13} className="h-[13px] w-auto" />
            <Image src="/images/logo-find-white.svg" alt="FIND" width={40} height={13} className="h-[13px] w-auto" />
            <Image src="/images/logo-id-white.svg" alt=".id" width={22} height={13} className="h-[11px] w-auto" />
          </div>
        </div>
      </div>
    </Link>
  );
}
