"use client";

import Image from "next/image";

export function MagicLinkLoadingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div className="fixed inset-[10px] overflow-hidden rounded-[6px]">
        <Image
          src="/coming-soon/bg-photo.jpg"
          alt="Construction blocks background"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-[420px] rounded-[6px] border border-[#e4e4e4] bg-[#f8f8f8]/95 px-6 py-6 text-center backdrop-blur-sm">
          <h1 className="text-[18px] font-semibold tracking-[0.36px] text-[#333]">
            Setting up your Account
          </h1>
          <p className="mt-3 text-[12px] leading-[18px] text-[#333]/70">
            Loading your company access...
          </p>
        </div>
      </div>
    </div>
  );
}
