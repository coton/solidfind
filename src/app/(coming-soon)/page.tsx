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

  // Shared content block (used in both layouts)
  const ContentBlock = ({ inputId }: { inputId: string }) => (
    <>
      {/* Logo */}
      <img src="/images/logo-full.svg" alt="SOLIDFIND.id" width={175} height={19} />

      {/* Spacer: 40px — logo → COMING SOON! */}
      <div style={{ height: '40px', flexShrink: 0 }} />

      <h1 style={{ color: '#F14110', fontWeight: 600, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.36px' }}>
        COMING SOON!
      </h1>

      {/* Spacer: 20px — COMING SOON! → description */}
      <div style={{ height: '20px', flexShrink: 0 }} />

      <p style={{ color: '#333', fontSize: '10px', lineHeight: 1.6, fontWeight: 400 }}>
        A curated platform connecting individuals and professionals across construction,{' '}
        renovation, and real estate. <strong>SolidFind</strong> helps you discover reliable
        partners and connect with them easily.
      </p>

      {/* Spacer: 20px — description → form */}
      <div style={{ height: '20px', flexShrink: 0 }} />

      <form onSubmit={handleSubmit}>
        <label
          htmlFor={inputId}
          style={{ display: 'block', color: '#333', fontSize: '11px', fontWeight: 500, letterSpacing: '2px', marginBottom: '8px' }}
        >
          E-mail
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Wrapper gives background + border-radius; input is offset 10px from left */}
          <div style={{ position: 'relative', flex: 1, height: '40px', backgroundColor: '#F8F8F8', borderRadius: '6px' }}>
            <input
              id={inputId}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="_"
              required
              style={{
                position: 'absolute',
                left: '10px',
                right: '10px',
                top: 0,
                bottom: 0,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                color: '#333',
                width: 'calc(100% - 20px)',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitted}
            style={{
              width: '130px',
              height: '40px',
              borderRadius: '20px',
              border: '1px solid #F14110',
              backgroundColor: 'transparent',
              color: '#F14110',
              fontSize: '11px',
              fontWeight: 500,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {isSubmitted ? '✓ Notified!' : 'Notify me'}
          </button>
        </div>

        {error && (
          <p style={{ color: '#F14110', fontSize: '12px', marginTop: '8px' }}>{error}</p>
        )}
      </form>
    </>
  );

  return (
    <>
      {/* ── DESKTOP ── */}
      <div className="hidden md:block" style={{ position: 'fixed', inset: 0, backgroundColor: 'white' }}>

        {/* Background image: 10px white border + 6px rounded corners */}
        <div style={{ position: 'absolute', inset: '10px', borderRadius: '6px', overflow: 'hidden' }}>
          <Image
            src="/coming-soon/bg-photo.jpg"
            alt="Construction blocks background"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Content: vertically centered on page, at left-[270px] */}
        <div
          style={{
            position: 'absolute',
            left: '270px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: '450px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ContentBlock inputId="email-desktop" />
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: '32px', right: '32px', zIndex: 10, display: 'flex', alignItems: 'baseline', gap: '16px' }}>
          <Link href="/terms-preview" style={{ color: '#333', fontSize: '8px', fontWeight: 700, textDecoration: 'underline' }}>
            Terms &amp; Conditions.
          </Link>
          <p style={{ color: '#333', fontSize: '10px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase' }}>
            SOLIDFIND.ID © 2026
          </p>
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="md:hidden" style={{ position: 'fixed', inset: 0, backgroundColor: 'white' }}>

        {/* Background image: 10px white border + 6px rounded corners */}
        <div style={{ position: 'absolute', inset: '10px', borderRadius: '6px', overflow: 'hidden' }}>
          <Image
            src="/coming-soon/bg-photo.jpg"
            alt="Construction blocks background"
            fill
            className="object-cover object-right-bottom"
            priority
          />
        </div>

        {/* Content: center of block at the 1/3 vertical mark, 20px from L/R */}
        <div
          style={{
            position: 'absolute',
            left: '20px',
            right: '20px',
            top: 'calc(33vh / 2)',
            transform: 'translateY(-50%)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ContentBlock inputId="email-mobile" />
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: '24px', right: '24px', zIndex: 10, display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <Link href="/terms-preview" style={{ color: '#333', fontSize: '8px', fontWeight: 700, textDecoration: 'underline' }}>
            Terms &amp; Conditions.
          </Link>
          <p style={{ color: '#333', fontSize: '10px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase' }}>
            SOLIDFIND.ID © 2026
          </p>
        </div>
      </div>
    </>
  );
}
