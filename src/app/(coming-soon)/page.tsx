"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

// ── ContentBlock is defined OUTSIDE the parent so React never remounts it on re-render
interface ContentBlockProps {
  inputId: string;
  email: string;
  isSubmitted: boolean;
  isButtonHovered: boolean;
  error: string;
  onEmailChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onButtonEnter: () => void;
  onButtonLeave: () => void;
}

function ContentBlock({
  inputId,
  email,
  isSubmitted,
  isButtonHovered,
  error,
  onEmailChange,
  onSubmit,
  onButtonEnter,
  onButtonLeave,
}: ContentBlockProps) {
  return (
    <>
      {/* Logo */}
      <img src="/images/logo-full.svg" alt="SOLIDFIND.id" width={175} height={19} />

      {/* Spacer: 40px — logo → COMING SOON! */}
      <div style={{ height: '40px', flexShrink: 0 }} />

      <h1 style={{ color: '#F14110', fontWeight: 600, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.36px', margin: 0 }}>
        COMING SOON!
      </h1>

      {/* Spacer: 20px — COMING SOON! → description */}
      <div style={{ height: '20px', flexShrink: 0 }} />

      <p style={{ color: '#333', fontSize: '10px', lineHeight: 1.6, fontWeight: 400, margin: 0 }}>
        A curated platform connecting individuals and professionals across construction,{' '}
        renovation, and real estate. <strong>SolidFind</strong> helps you discover reliable
        partners and connect with them easily.
      </p>

      {/* Spacer: 20px — description → form */}
      <div style={{ height: '20px', flexShrink: 0 }} />

      <form onSubmit={onSubmit}>
        <label
          htmlFor={inputId}
          style={{ display: 'block', color: '#333', fontSize: '11px', fontWeight: 500, letterSpacing: '2px', marginBottom: '8px' }}
        >
          E-mail
        </label>

        {isSubmitted ? (
          <div>
            <p style={{ color: '#F14110', fontSize: '18px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.36px', margin: 0 }}>
              THANK YOU!
            </p>
            <p style={{ color: '#888', fontSize: '10px', fontWeight: 400, marginTop: '6px' }}>
              We will notify you when ready!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Wrapper gives bg + border-radius; input offset 10px from left */}
            <div style={{ position: 'relative', flex: 1, height: '40px', backgroundColor: '#F8F8F8', borderRadius: '6px' }}>
              <input
                id={inputId}
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
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
              onMouseEnter={onButtonEnter}
              onMouseLeave={onButtonLeave}
              style={{
                width: '130px',
                height: '40px',
                borderRadius: '20px',
                border: isButtonHovered ? 'none' : '1px solid #F14110',
                background: isButtonHovered
                  ? 'linear-gradient(to right, #E9A28E, #F14110)'
                  : 'transparent',
                color: isButtonHovered ? '#fff' : '#F14110',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s ease',
              }}
            >
              Notify me
            </button>
          </div>
        )}

        {error && (
          <p style={{ color: '#F14110', fontSize: '12px', marginTop: '8px' }}>{error}</p>
        )}
      </form>
    </>
  );
}

// ── Main page component
export default function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isButtonHovered, setIsButtonHovered] = useState(false);

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
        }, 4000);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error("Waitlist error:", err);
    }
  };

  const sharedProps: Omit<ContentBlockProps, 'inputId'> = {
    email,
    isSubmitted,
    isButtonHovered,
    error,
    onEmailChange: setEmail,
    onSubmit: handleSubmit,
    onButtonEnter: () => setIsButtonHovered(true),
    onButtonLeave: () => setIsButtonHovered(false),
  };

  return (
    <>
      {/* ── DESKTOP ── */}
      <div className="hidden md:block" style={{ position: 'fixed', inset: 0, backgroundColor: 'white' }}>

        <div style={{ position: 'absolute', inset: '10px', borderRadius: '6px', overflow: 'hidden' }}>
          <Image src="/coming-soon/bg-photo.jpg" alt="Construction blocks background" fill className="object-cover object-center" priority />
        </div>

        <div style={{ position: 'absolute', left: '270px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '450px', display: 'flex', flexDirection: 'column' }}>
          <ContentBlock inputId="email-desktop" {...sharedProps} />
        </div>

        <div style={{ position: 'absolute', bottom: '32px', right: '32px', zIndex: 10, display: 'flex', alignItems: 'baseline', gap: '16px' }}>
          <Link href="/terms-preview" style={{ color: '#333', fontSize: '8px', fontWeight: 700, textDecoration: 'underline' }}>Terms &amp; Conditions.</Link>
          <p style={{ color: '#333', fontSize: '10px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', margin: 0 }}>SOLIDFIND.ID © 2026</p>
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="md:hidden" style={{ position: 'fixed', inset: 0, backgroundColor: 'white' }}>

        <div style={{ position: 'absolute', inset: '10px', borderRadius: '6px', overflow: 'hidden' }}>
          <Image src="/coming-soon/bg-photo.jpg" alt="Construction blocks background" fill className="object-cover object-right-bottom" priority />
        </div>

        <div style={{ position: 'absolute', left: '20px', right: '20px', top: 'calc(33vh / 2)', transform: 'translateY(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column' }}>
          <ContentBlock inputId="email-mobile" {...sharedProps} />
        </div>

        <div style={{ position: 'absolute', bottom: '24px', right: '24px', zIndex: 10, display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <Link href="/terms-preview" style={{ color: '#333', fontSize: '8px', fontWeight: 700, textDecoration: 'underline' }}>Terms &amp; Conditions.</Link>
          <p style={{ color: '#333', fontSize: '10px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', margin: 0 }}>SOLIDFIND.ID © 2026</p>
        </div>
      </div>
    </>
  );
}
