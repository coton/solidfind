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
      {/* Background Image - positioned right */}
      <div 
        className="absolute"
        style={{
          right: 0,
          top: 0,
          width: '1420px',
          height: '1005px'
        }}
      >
        <Image
          src="/coming-soon/bg-blocks.png"
          alt="Construction blocks background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content Container - positioned at x:270, y:326 per design */}
      <div className="absolute left-[270px] top-[326px] z-10 space-y-6">
        {/* Logo - 175x19px */}
        <div className="text-[#333] font-semibold text-base tracking-wide">
          SOLIDFIND.id
        </div>

        {/* Title - Sora SemiBold 18px, color #F14110, letter-spacing 0.36px */}
        <h1 className="text-[#F14110] font-semibold text-lg uppercase tracking-[0.36px]">
          COMING SOON!
        </h1>

        {/* Description - Sora Regular 10px, width 450px */}
        <p className="text-[#333] text-[10px] leading-[1.6] w-[450px] font-normal">
          A curated platform connecting individuals and professionals across construction, 
          renovation, and real estate. <span className="font-bold">SolidFind</span> helps 
          you discover reliable partners and connect with them easily.
        </p>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Email Label - Sora Medium 11px */}
          <label 
            htmlFor="email" 
            className="block text-[#333] text-[11px] font-medium tracking-[2px] uppercase mb-2"
          >
            E-mail
          </label>

          {/* Input + Button Row */}
          <div className="flex items-center gap-4">
            {/* Email Input - 210x58px, bg #F8F8F8, rounded 6px */}
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-[210px] h-[58px] px-4 bg-[#F8F8F8] rounded-md text-sm text-[#333] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F14110]/30"
            />

            {/* Notify Button - 140x40px, rounded full, border #F14110, text Sora Medium 11px */}
            <button
              type="submit"
              disabled={isSubmitted}
              className="w-[140px] h-[40px] rounded-full border border-[#F14110] text-[#F14110] text-[11px] font-medium hover:bg-[#F14110] hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitted ? "✓ Notified!" : "Notify me"}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-[#F14110] text-xs font-medium">{error}</p>
          )}
        </form>
      </div>

      {/* Footer - bottom-right positioned, horizontal layout matching Figma */}
      <div className="absolute bottom-8 right-8 flex items-baseline gap-4">
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
