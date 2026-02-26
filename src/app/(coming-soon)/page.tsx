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
    <>
      {/* Desktop Layout */}
      {/* White background = 10px white border frame around the background image */}
      <div className="hidden md:block fixed inset-0 bg-white">

        {/* Background Image: inset-[10px] = 10px white border on all sides, rounded-[6px] = 6px corners */}
        <div className="absolute inset-[10px] rounded-[6px] overflow-hidden">
          <Image
            src="/coming-soon/bg-photo.jpg"
            alt="Construction blocks background"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Content — vertically centered, horizontally at left-[270px] */}
        <div className="absolute left-[270px] top-1/2 -translate-y-1/2 z-10 w-[450px]">
          {/* Logo SVG */}
          <img
            src="/images/logo-full.svg"
            alt="SOLIDFIND.id"
            width={175}
            height={19}
          />

          {/* 40px spacing: logo → COMING SOON! */}
          <h1 style={{ marginTop: '40px' }} className="text-[#F14110] font-semibold text-lg uppercase tracking-[0.36px]">
            COMING SOON!
          </h1>

          {/* 20px spacing: COMING SOON! → description */}
          <p style={{ marginTop: '20px' }} className="text-[#333] text-[10px] leading-[1.6] font-normal">
            A curated platform connecting individuals and professionals across construction, 
            renovation, and real estate. <span className="font-bold">SolidFind</span> helps 
            you discover reliable partners and connect with them easily.
          </p>

          {/* 20px spacing: description → form */}
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            {/* E-mail label — sentence case */}
            <label 
              htmlFor="email-desktop" 
              className="block text-[#333] text-[11px] font-medium tracking-[2px] mb-2"
            >
              E-mail
            </label>

            <div className="flex items-center gap-4">
              {/* Input: 40px height, 10px left/right padding, placeholder _ */}
              <input
                id="email-desktop"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="_"
                required
                style={{ paddingLeft: '10px', paddingRight: '10px' }}
                className="w-[210px] h-[40px] bg-[#F8F8F8] rounded-md text-sm text-[#333] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F14110]/30"
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
              <p className="mt-2 text-[#F14110] text-xs font-medium">{error}</p>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 right-8 z-10 flex items-baseline gap-4">
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

      {/* Mobile Layout */}
      {/* White background = 10px white border frame */}
      <div className="md:hidden fixed inset-0 bg-white">

        {/* Background Image: inset-[10px] = 10px white border, rounded-[6px] = 6px corners, full opacity */}
        <div className="absolute inset-[10px] rounded-[6px] overflow-hidden">
          <Image
            src="/coming-soon/bg-photo.jpg"
            alt="Construction blocks background"
            fill
            className="object-cover object-right-bottom"
            priority
          />
        </div>

        {/* Content: left-aligned, 20px L/R padding, vertically centered within top 1/3 */}
        <div
          className="absolute left-0 right-0 top-0 z-10 flex flex-col justify-center"
          style={{ height: '33vh', paddingLeft: '20px', paddingRight: '20px' }}
        >
          {/* Logo */}
          <img
            src="/images/logo-full.svg"
            alt="SOLIDFIND.id"
            width={175}
            height={19}
          />

          {/* 40px spacing: logo → COMING SOON! */}
          <h1 style={{ marginTop: '40px' }} className="text-[#F14110] font-semibold text-lg uppercase tracking-[0.36px]">
            COMING SOON!
          </h1>

          {/* 20px spacing: COMING SOON! → description */}
          <p style={{ marginTop: '20px' }} className="text-[#333] text-[10px] leading-[1.6] font-normal">
            A curated platform connecting individuals and professionals across construction, 
            renovation, and real estate. <span className="font-bold">SolidFind</span> helps 
            you discover reliable partners and connect with them easily.
          </p>

          {/* 20px spacing: description → form */}
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <label
              htmlFor="email-mobile"
              className="block text-[#333] text-[11px] font-medium tracking-[2px] mb-2"
            >
              E-mail
            </label>

            <div className="flex items-center gap-4">
              <input
                id="email-mobile"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="_"
                required
                style={{ paddingLeft: '10px', paddingRight: '10px' }}
                className="flex-1 h-[40px] bg-[#F8F8F8] rounded-md text-sm text-[#333] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F14110]/30"
              />

              <button
                type="submit"
                disabled={isSubmitted}
                className="w-[120px] h-[40px] rounded-full border border-[#F14110] text-[#F14110] text-[11px] font-medium hover:bg-[#F14110] hover:text-white transition-colors duration-200 disabled:opacity-50 shrink-0"
              >
                {isSubmitted ? "✓ Notified!" : "Notify me"}
              </button>
            </div>

            {error && (
              <p className="mt-2 text-[#F14110] text-xs font-medium">{error}</p>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 right-6 z-10 flex items-baseline gap-3">
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
    </>
  );
}
