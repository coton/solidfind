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
      className="bg-[#E4E4E4] overflow-y-auto md:overflow-hidden"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        padding: 0,
        width: '100vw',
        minHeight: '100vh'
      }}
    >
      {/* Background Image - responsive */}
      <div className="fixed md:absolute inset-0 md:right-0 md:top-0 md:left-auto md:bottom-auto md:w-[1420px] md:h-[1005px]">
        <Image
          src="/coming-soon/bg-blocks.png"
          alt="Construction blocks background"
          fill
          className="object-cover object-right-bottom md:object-right"
          priority
        />
      </div>

      {/* Content Container - responsive */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 py-12 md:py-0 md:px-0 md:block md:ml-[270px] md:mt-[326px]">
        <div className="max-w-[450px] space-y-4 md:space-y-6">
          {/* Logo */}
          <div className="text-[#333] font-semibold text-lg md:text-base tracking-wide">
            SOLIDFIND.id
          </div>

          {/* Title */}
          <h1 className="text-[#F14110] font-semibold text-2xl md:text-lg uppercase tracking-[0.36px]">
            COMING SOON!
          </h1>

          {/* Description */}
          <p className="text-[#333] text-sm md:text-[10px] leading-relaxed md:leading-[1.6] font-normal">
            A curated platform connecting individuals and professionals across construction, 
            renovation, and real estate. <span className="font-bold">SolidFind</span> helps 
            you discover reliable partners and connect with them easily.
          </p>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email Label */}
            <label 
              htmlFor="email" 
              className="block text-[#333] text-xs md:text-[11px] font-medium tracking-[2px] uppercase"
            >
              E-mail
            </label>

            {/* Input + Button */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
              {/* Email Input */}
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full md:w-[210px] h-[50px] md:h-[58px] px-4 bg-[#F8F8F8] rounded-md text-sm text-[#333] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F14110]/30"
              />

              {/* Notify Button */}
              <button
                type="submit"
                disabled={isSubmitted}
                className="w-full md:w-[140px] h-[50px] md:h-[40px] rounded-full border border-[#F14110] text-[#F14110] text-xs md:text-[11px] font-medium hover:bg-[#F14110] hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>

      {/* Footer - responsive positioning */}
      <div className="relative md:absolute bottom-0 right-0 md:bottom-8 md:right-8 p-6 md:p-0 flex flex-col md:flex-row items-center md:items-baseline gap-2 md:gap-4 text-center md:text-right z-10">
        <Link
          href="/terms-preview"
          className="text-[#333] text-xs md:text-[8px] font-bold underline hover:text-[#F14110] transition-colors whitespace-nowrap order-2 md:order-1"
        >
          Terms &amp; Conditions.
        </Link>
        <p className="text-[#333] text-xs md:text-[10px] font-bold tracking-[2px] md:tracking-[2.5px] uppercase whitespace-nowrap order-1 md:order-2">
          SOLIDFIND.ID © 2026
        </p>
      </div>
    </div>
  );
}
