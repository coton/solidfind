"use client";

import Image from "next/image";

function ContentBlock() {
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
    </>
  );
}

export default function ComingSoonPage() {
  return (
    <>
      {/* ── DESKTOP ── */}
      <div className="hidden md:block" style={{ position: 'fixed', inset: 0, backgroundColor: 'white' }}>

        <div style={{ position: 'absolute', inset: '10px', borderRadius: '6px', overflow: 'hidden' }}>
          <Image src="/coming-soon/bg-photo.jpg" alt="Construction blocks background" fill className="object-cover object-center" priority />
        </div>

        <div style={{ position: 'absolute', left: '270px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '450px', display: 'flex', flexDirection: 'column' }}>
          <ContentBlock />
        </div>

        <div style={{ position: 'absolute', bottom: '32px', right: '32px', zIndex: 10, display: 'flex', alignItems: 'baseline', gap: '16px' }}>
          <p style={{ color: '#333', fontSize: '10px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', margin: 0 }}>SOLIDFIND.ID © 2026</p>
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="md:hidden" style={{ position: 'fixed', inset: 0, backgroundColor: 'white' }}>

        <div style={{ position: 'absolute', inset: '10px', borderRadius: '6px', overflow: 'hidden' }}>
          <Image src="/coming-soon/bg-photo.jpg" alt="Construction blocks background" fill className="object-cover object-right-bottom" priority />
        </div>

        <div style={{ position: 'absolute', left: '20px', right: '20px', top: 'calc(33vh / 2)', transform: 'translateY(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column' }}>
          <ContentBlock />
        </div>

        <div style={{ position: 'absolute', bottom: '24px', right: '24px', zIndex: 10, display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <p style={{ color: '#333', fontSize: '10px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', margin: 0 }}>SOLIDFIND.ID © 2026</p>
        </div>
      </div>
    </>
  );
}
