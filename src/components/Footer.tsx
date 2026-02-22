import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="relative h-[170px] sm:h-[190px] rounded-t-[6px] overflow-hidden">
      {/* Gradient: E9A28E → F14110 (both mobile & desktop) */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to right, #E9A28E, #F14110)"
        }}
      />
      {/* Mobile Layout - Right-aligned like desktop */}
      <div className="sm:hidden absolute inset-0 flex items-center justify-end p-5 z-10">
        <div className="flex flex-col items-end gap-4">
          {/* Description - Break after "clarity," */}
          <div className="text-right max-w-[280px]">
            <p className="text-[#f8f8f8] text-[9px] leading-[12px] font-medium tracking-[0.18px]">
              <span className="font-bold">SOLIDFIND.ID</span>
              {" is an independent platform built to bring clarity,"}
              <br />
              {"trust, and perspective to the places we live in."}
            </p>
          </div>

          {/* Social Icons & About */}
          <div className="flex items-center gap-5">
            <Link href="#" className="hover:opacity-80 transition-opacity">
              <Image src="/images/footer-ig.svg" alt="Instagram" width={20} height={20} />
            </Link>
            <Link href="#" className="hover:opacity-80 transition-opacity">
              <Image src="/images/footer-account.svg" alt="Account" width={19} height={20} />
            </Link>
            <Link href="#" className="hover:opacity-80 transition-opacity">
              <Image src="/images/footer-mail.svg" alt="Email" width={24} height={19} />
            </Link>
            <Link
              href="/about"
              className="text-[#e4e4e4] font-semibold text-[18px] tracking-[0.36px] hover:opacity-80 transition-opacity ml-2"
            >
              ABOUT
            </Link>
          </div>

          {/* Bottom Links */}
          <div className="flex items-center gap-5 text-[#f8f8f8]">
            <Link href="/terms" className="text-[8px] font-bold tracking-[0.4px] underline hover:opacity-80">
              Terms & Conditions.
            </Link>
            <span className="text-[10px] font-bold tracking-[2.5px] uppercase">
              SOLIDFIND.ID © 2026
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex absolute inset-0 items-center justify-end px-10 z-10">
        <div className="flex flex-col items-end gap-4">
          {/* Description */}
          <div className="text-right max-w-[426px]">
            <p className="text-[#f8f8f8] text-[12px] leading-[18px] tracking-[0.24px]">
              <span className="font-semibold text-[13px] leading-[17px]">SOLIDFIND</span>
              <span className="font-semibold text-[13px] leading-[17px]">.id </span>
              <span className="font-normal">is an independent platform built to bring clarity, trust, and perspective to the places we live in.</span>
            </p>
          </div>

          {/* Social Icons & About */}
          <div className="flex items-center gap-5">
            <Link href="#" className="hover:opacity-80 transition-opacity">
              <Image src="/images/footer-ig.svg" alt="Instagram" width={20} height={20} />
            </Link>
            <Link href="#" className="hover:opacity-80 transition-opacity">
              <Image src="/images/footer-account.svg" alt="Account" width={19} height={20} />
            </Link>
            <Link href="#" className="hover:opacity-80 transition-opacity">
              <Image src="/images/footer-mail.svg" alt="Email" width={24} height={19} />
            </Link>
            <Link
              href="/about"
              className="text-[#e4e4e4] font-semibold text-[18px] tracking-[0.36px] hover:opacity-80 transition-opacity ml-2"
            >
              ABOUT
            </Link>
          </div>

          {/* Bottom Links */}
          <div className="flex items-center gap-5 text-[#f8f8f8]">
            <Link href="/terms" className="text-[8px] font-bold tracking-[0.4px] underline hover:opacity-80">
              Terms & Conditions.
            </Link>
            <span className="text-[10px] font-bold tracking-[2.5px] uppercase">
              SOLIDFIND.ID © 2026
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
