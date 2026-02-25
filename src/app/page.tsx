"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add email notification logic (Convex/API)
    console.log("Email submitted:", email);
    setIsSubmitted(true);
    setTimeout(() => {
      setEmail("");
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#E4E4E4] flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute right-0 top-0 w-full h-full">
        <Image
          src="/coming-soon/bg-blocks.png"
          alt="Construction blocks background"
          fill
          className="object-cover object-right"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10 px-8 md:px-16 max-w-7xl w-full flex items-center min-h-screen">
        <div className="w-full md:w-1/2 space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg width="175" height="19" viewBox="0 0 175 19" fill="none">
              <text
                x="0"
                y="15"
                fontFamily="Sora"
                fontWeight="600"
                fontSize="18"
                fill="#333"
                letterSpacing="0.5"
              >
                SOLIDFIND.id
              </text>
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-[#F14110] font-semibold text-lg uppercase tracking-[0.36px]">
            COMING SOON!
          </h1>

          {/* Description */}
          <p className="text-[#333] text-[10px] leading-relaxed max-w-[450px] font-normal">
            A curated platform connecting individuals and professionals across construction, 
            renovation, and real estate. <span className="font-bold">SolidFind</span> helps 
            you discover reliable partners and connect with them easily.
          </p>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="email" 
                className="block text-[#333] text-[11px] font-medium mb-2 tracking-[2px] uppercase"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full max-w-[210px] h-[58px] px-4 bg-[#F8F8F8] rounded-md text-sm text-[#333] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F14110]/30"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitted}
              className="w-[140px] h-[40px] rounded-full border border-[#F14110] text-[#F14110] text-[11px] font-medium tracking-wide hover:bg-[#F14110] hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitted ? "✓ Notified!" : "Notify me"}
            </button>
          </form>

          {/* Footer */}
          <div className="absolute bottom-8 right-8 text-right space-y-1">
            <Link
              href="/terms"
              className="text-[#333] text-[8px] font-bold underline hover:text-[#F14110] transition-colors"
            >
              Terms &amp; Conditions.
            </Link>
            <p className="text-[#333] text-[10px] font-bold tracking-[2.5px] uppercase">
              SOLIDFIND.ID © 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
