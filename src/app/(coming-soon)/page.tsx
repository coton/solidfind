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

        {/* Content */}
        <div className="absolute left-[270px] top-[326px] z-10 space-y-6 w-[450px]">
          <div className="text-[#333] font-semibold text-base tracking-wide">
            SOLIDFIND.id
          </div>

          <h1 className="text-[#F14110] font-semibold text-lg uppercase tracking-[0.36px]">
            COMING SOON!
          </h1>

          <p className="text-[#333] text-[10px] leading-[1.6] font-normal">
            A curated platform connecting individuals and professionals across construction, 
            renovation, and real estate. <span className="font-bold">SolidFind</span> helps 
            you discover reliable partners and connect with them easily.
          </p>

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
      <div className="md:hidden min-h-screen bg-white relative overflow-hidden">
        {/* Background Image: inset-[10px] = 10px white border, rounded-[6px] = 6px corners */}
        <div className="fixed inset-[10px] rounded-[6px] overflow-hidden opacity-30">
          <Image
            src="/coming-soon/bg-photo.jpg"
            alt="Construction blocks background"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Content Container - centered */}
        <div className="relative z-10 min-h-screen flex flex-col justify-between p-6">
          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-6">
              {/* Logo */}
              <div className="text-center">
                <h2 className="text-[#333] font-bold text-2xl tracking-wide">
                  SOLIDFIND.id
                </h2>
              </div>

              {/* Title */}
              <div className="text-center">
                <h1 className="text-[#F14110] font-bold text-4xl uppercase tracking-wide">
                  COMING SOON!
                </h1>
              </div>

              {/* Description */}
              <p className="text-[#333] text-center text-base leading-relaxed">
                A curated platform connecting individuals and professionals across construction, 
                renovation, and real estate. <span className="font-bold">SolidFind</span> helps 
                you discover reliable partners and connect with them easily.
              </p>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label 
                    htmlFor="email-mobile" 
                    className="block text-[#333] text-sm font-semibold tracking-wider uppercase"
                  >
                    E-mail
                  </label>
                  <input
                    id="email-mobile"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full h-14 px-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-base text-[#333] placeholder:text-gray-400 focus:outline-none focus:border-[#F14110] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitted}
                  className="w-full h-14 rounded-full bg-[#F14110] text-white text-lg font-semibold hover:bg-[#d63a0e] active:scale-95 transition-all duration-200 disabled:opacity-50 shadow-lg"
                >
                  {isSubmitted ? "✓ You're on the list!" : "Notify me"}
                </button>

                {error && (
                  <p className="text-[#F14110] text-sm font-medium text-center">{error}</p>
                )}
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2 pb-4">
            <Link
              href="/terms-preview"
              className="block text-[#333] text-sm font-bold underline hover:text-[#F14110] transition-colors"
            >
              Terms &amp; Conditions
            </Link>
            <p className="text-[#333] text-xs font-bold tracking-wider uppercase">
              SOLIDFIND.ID © 2026
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
