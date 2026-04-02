"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AuthModal } from "./AuthModal";

export function Footer() {
  const igUrl = useQuery(api.platformSettings.get, { key: "ig_url" });
  const igVisible = useQuery(api.platformSettings.get, { key: "ig_visible" });
  const contactUrl = useQuery(api.platformSettings.get, { key: "contact_url" });

  const igHref = igUrl || "#";
  const mailHref = contactUrl || "#";
  const showIg = igVisible !== "false";
  const { user } = useUser();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // If user is logged in, they should be redirected based on account type
  // If not logged in, open AuthModal for sign-in

  // Footer Account button behavior:
  // - If logged in as individual: link to /dashboard
  // - If logged in as company: link to /company-dashboard
  // - If not logged in: open AuthModal

  return (
    <footer className="relative h-[150px] sm:h-[190px] rounded-t-[6px] overflow-hidden z-0">
      {/* AuthModal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="login"
        initialAccountType="individual"
      />
      
      {/* Gradient: E9A28E → F14110 (both mobile & desktop) */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to right, #E9A28E, #F14110)"
        }}
      />
      {/* Mobile Layout - Right-aligned */}
      <div className="sm:hidden absolute inset-0 flex items-center justify-end p-5 z-10">
        <div className="flex flex-col items-end gap-3">
          {/* Description */}
          <div className="text-right max-w-[320px]">
            <p className="text-[#E4E4E4] text-[9px] leading-[12px] font-medium tracking-[0.18px]">
              <span className="font-bold">SOLIDFIND.ID</span>
              {" is an independent platform built to bring clarity,"}
              <br />
              {"trust, and perspective to the places we live in."}
            </p>
          </div>

          {/* Social Icons & About */}
          <div className="flex items-center gap-5">
            {showIg && (
              <a href={igHref} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Image src="/images/footer-ig.svg" alt="Instagram" width={20} height={20} />
              </a>
            )}
            {/* Footer Account button - same behavior as header */}
            {user ? (
              <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
                <Image src="/images/footer-account.svg" alt="Account" width={19} height={20} />
              </Link>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="hover:opacity-80 transition-opacity"
              >
                <Image src="/images/footer-account.svg" alt="Account" width={19} height={20} />
              </button>
            )}
            <a href={`mailto:${mailHref}`} className="hover:opacity-80 transition-opacity">
              <Image src="/images/footer-mail.svg" alt="Email" width={25} height={20} />
            </a>
            <Link
              href="/about"
              className="text-[#E4E4E4] font-semibold text-[18px] tracking-[0.36px] hover:opacity-80 transition-opacity ml-2"
            >
              ABOUT
            </Link>
          </div>

          {/* Bottom Links */}
          <div className="flex items-center gap-5 text-[#E4E4E4]">
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
            <p className="text-[#E4E4E4] text-[12px] leading-[18px] tracking-[0.24px]">
              <span className="font-semibold text-[13px] leading-[17px]">SOLIDFIND</span>
              <span className="font-semibold text-[13px] leading-[17px]">.id </span>
              <span className="font-normal">is an independent platform built to bring clarity, trust, and perspective to the places we live in.</span>
            </p>
          </div>

          {/* Social Icons & About */}
          <div className="flex items-center gap-5">
            {showIg && (
              <a href={igHref} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Image src="/images/footer-ig.svg" alt="Instagram" width={20} height={20} />
              </a>
            )}
            {/* Footer Account button - same behavior as header */}
            {user ? (
              <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
                <Image src="/images/footer-account.svg" alt="Account" width={19} height={20} />
              </Link>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="hover:opacity-80 transition-opacity"
              >
                <Image src="/images/footer-account.svg" alt="Account" width={19} height={20} />
              </button>
            )}
            <a href={`mailto:${mailHref}`} className="hover:opacity-80 transition-opacity">
              <Image src="/images/footer-mail.svg" alt="Email" width={25} height={20} />
            </a>
            <Link
              href="/about"
              className="text-[#E4E4E4] font-semibold text-[18px] tracking-[0.36px] hover:opacity-80 transition-opacity ml-2"
            >
              ABOUT
            </Link>
          </div>

          {/* Bottom Links */}
          <div className="flex items-center gap-5 text-[#E4E4E4]">
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
