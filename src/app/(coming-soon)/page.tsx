"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  
  const addToWaitlist = useMutation(api.waitlist.addToWaitlist);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await addToWaitlist({ email });
      
      if (result.alreadyExists) {
        setError("You're already on the waitlist!");
      } else {
        setIsSubmitted(true);
        setTimeout(() => {
          setEmail("");
          setIsSubmitted(false);
        }, 3000);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error("Waitlist error:", err);
    }
  };

  return (
    <div 
      className="bg-[#E4E4E4] overflow-hidden"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        padding: 0,
        width: '100vw',
        height: '100vh'
      }}
    >
      {/* Background Image - Desktop: right side, Mobile: bottom */}
      <div className="hidden md:block absolute right-0 top-0 w-[1420px] h-[1005px]">
        <Image
          src="/coming-soon/bg-blocks.png"
          alt="Construction blocks background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Mobile Background - positioned at bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[45vh] w-full">
        <Image
          src="/coming-soon/bg-blocks.png"
          alt="Construction blocks background"
          fill
          className="object-cover object-center-bottom"
          priority
        />
      </div>

      {/* Content - Desktop: fixed position, Mobile: flex layout */}
      <div className="relative z-10 h-full flex flex-col md:block">
        {/* Desktop positioning */}
        <div className="hidden md:block absolute left-[270px] top-[326px]">
          <div className="w-[450px] space-y-6">
            {/* Logo */}
            <div className="text-[#333] font-semibold text-base tracking-wide">
              SOLIDFIND.id
            </div>

            {/* Title */}
            <h1 className="text-[#F14110] font-semibold text-lg uppercase tracking-[0.36px]">
              COMING SOON!
            </h1>

            {/* Description */}
            <p className="text-[#333] text-[10px] leading-[1.6] font-normal">
              A curated platform connecting individuals and professionals across construction, 
              renovation, and real estate. <span className="font-bold">SolidFind</span> helps 
              you discover reliable partners and connect with them easily.
            </p>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <label 
                htmlFor="email-desktop" 
                className="block text-[#333] text-[11px] font-medium tracking-[2px] uppercase"
              >
                E-mail
              </label>

              <div className="flex items-center gap-4">
                <input
                  id="email-desktop"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-[210px] h-[58px] px-4 bg-[#F8F8F8] rounded-md text-sm text-[#333] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F14110]/30"
                />

                <button
                  type="submit"
                  disabled={isSubmitted}
                  className="w-[140px] h-[40px] rounded-full border border-[#F14110] text-[#F14110] text-[11px] font-medium hover:bg-[#F14110] hover:text-white transition-colors duration-200 disabled:opacity-50"
                >
                  {isSubmitted ? "✓ Notified!" : "Notify me"}
                </button>
              </div>

              {error && (
                <p className="text-[#F14110] text-xs font-medium">{error}</p>
              )}
            </form>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="md:hidden flex-1 flex flex-col justify-start pt-16 px-6 pb-6">
          <div className="space-y-6 max-w-md">
            {/* Logo */}
            <div className="text-[#333] font-semibold text-xl tracking-wide">
              SOLIDFIND.id
            </div>

            {/* Title */}
            <h1 className="text-[#F14110] font-semibold text-3xl uppercase tracking-wide">
              COMING SOON!
            </h1>

            {/* Description */}
            <p className="text-[#333] text-base leading-relaxed">
              A curated platform connecting individuals and professionals across construction, 
              renovation, and real estate. <span className="font-bold">SolidFind</span> helps 
              you discover reliable partners and connect with them easily.
            </p>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <label 
                htmlFor="email-mobile" 
                className="block text-[#333] text-sm font-medium tracking-widest uppercase"
              >
                E-mail
              </label>

              <div className="space-y-3">
                <input
                  id="email-mobile"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full h-[56px] px-4 bg-white/90 backdrop-blur-sm rounded-lg text-base text-[#333] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F14110]/30 shadow-sm"
                />

                <button
                  type="submit"
                  disabled={isSubmitted}
                  className="w-full h-[56px] rounded-full bg-[#F14110] text-white text-base font-medium hover:bg-[#d63a0e] transition-colors duration-200 disabled:opacity-50 shadow-lg"
                >
                  {isSubmitted ? "✓ Notified!" : "Notify me"}
                </button>
              </div>

              {error && (
                <p className="text-[#F14110] text-sm font-medium">{error}</p>
              )}
            </form>
          </div>
        </div>

        {/* Footer - Mobile: at bottom, Desktop: fixed position */}
        <div className="md:hidden relative bg-gradient-to-t from-[#E4E4E4] to-transparent py-6 px-6 text-center space-y-2">
          <Link
            href="/terms-preview"
            className="block text-[#333] text-sm font-bold underline hover:text-[#F14110] transition-colors"
          >
            Terms &amp; Conditions.
          </Link>
          <p className="text-[#333] text-xs font-bold tracking-widest uppercase">
            SOLIDFIND.ID © 2026
          </p>
        </div>
      </div>

      {/* Desktop Footer */}
      <div className="hidden md:flex absolute bottom-8 right-8 items-baseline gap-4">
        <Link
          href="/terms-preview"
          className="text-[#333] text-[8px] font-bold underline hover:text-[#F14110] transition-colors whitespace-nowrap"
        >
          Terms &amp; Conditions.
        </Link>
        <p className="text-[#333] text-[10px] font-bold tracking-[2.5px] uppercase whitespace-nowrap">
          SOLIDFIND.ID © 2026
        </p>
      </div>
    </div>
  );
}
