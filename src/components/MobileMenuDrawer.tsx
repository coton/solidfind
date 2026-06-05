"use client";

import Link from "next/link";
import { useState } from "react";
import { useSiteLanguage } from "./LanguageProvider";

const sections = [
  {
    id: "cat",
    label: "Categories",
    items: [
      { label: "01 · Construction", href: "/?category=construction" },
      { label: "02 · Renovation", href: "/?category=renovation" },
      { label: "03 · Architecture", href: "/?category=architecture" },
      { label: "04 · Interior", href: "/?category=interior" },
      { label: "05 · Real Estate", href: "/?category=real-estate" },
    ],
  },
  {
    id: "build",
    label: "Build",
    items: [
      { label: "For individuals", href: "/dashboard" },
      { label: "For professionals", href: "/company-dashboard" },
      { label: "List your services", href: "/register-business" },
      { label: "Pro guidelines", href: "/upgrade" },
    ],
  },
  {
    id: "solid",
    label: "Solid",
    items: [
      { label: "About", href: "/about" },
      { label: "Terms and Conditions", href: "/terms" },
      { label: "Contact", href: "mailto:hello@solidfind.id" },
    ],
  },
];

export function MobileMenuButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="m-iconbtn sf-static-menu-btn" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(true)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
      </button>
      {open && <MobileMenuDrawer onClose={() => setOpen(false)} />}
    </>
  );
}

function MobileMenuDrawer({ onClose }: { onClose: () => void }) {
  const [openSection, setOpenSection] = useState("cat");
  const { language, setLanguage } = useSiteLanguage();
  const toggleLanguage = () => setLanguage(language === "en" ? "id" : "en");

  return (
    <div className="m-overlay">
      <div className="m-scrim" onClick={onClose} />
      <div className="m-drawer" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="m-drawer-top">
          <div className="m-drawer-head">
            <span className="m-drawer-mark" aria-hidden="true">
              <svg viewBox="0 0 83.88 83.88" width="36" height="36" fill="currentColor"><path d="M65.19,0H18.69c-2.4,0-4.69.95-6.39,2.65L2.65,12.3c-1.69,1.69-2.65,3.99-2.65,6.39v46.5c0,2.4.95,4.69,2.65,6.39l9.66,9.66c1.69,1.69,3.99,2.65,6.39,2.65h48.61c1.04,0,2.04-.41,2.78-1.15h0c1.53-1.53,1.53-4.02,0-5.55l-8.98-8.98c-1.23-1.23-3.14-1.54-4.65-.68-5.01,2.85-10.79,4.19-16.77,3.74-6.16-.46-12.06-2.89-16.76-6.9-13.2-11.25-13.78-31.18-1.76-43.2,5.55-5.55,12.93-8.61,20.79-8.61s15.23,3.06,20.79,8.61h0c9.58,9.58,11.15,24.17,4.71,35.4-.87,1.52-.59,3.44.65,4.69l8.96,8.96c1.53,1.53,4.02,1.53,5.55,0l.12-.12c.74-.74,1.15-1.74,1.15-2.78V18.69c0-2.4-.95-4.69-2.65-6.39l-9.66-9.66c-1.69-1.69-3.99-2.65-6.39-2.65Z"/><path d="M41.94,23.25c-4.79,0-9.58,1.82-13.22,5.47-7.29,7.29-7.29,19.15,0,26.44,7.29,7.29,19.15,7.29,26.44,0,7.29-7.29,7.29-19.15,0-26.44-3.64-3.65-8.43-5.47-13.22-5.47Z"/></svg>
            </span>
            <span className="m-topbar-sp" />
            <button type="button" className="sf-lang m-drawer-lang" onClick={toggleLanguage} aria-label={`Switch language to ${language === "en" ? "Indonesian" : "English"}`}>
              <span className={language === "en" ? "on" : ""}>EN</span>
              <span className={language === "id" ? "on" : ""}>ID</span>
            </button>
            <button className="m-iconbtn m-drawer-close" aria-label="Close menu" onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
          </div>
        </div>

        <div className="m-drawer-nav">
          {sections.map((section) => (
            <div key={section.id} className={`m-acc ${openSection === section.id ? "open" : ""}`}>
              <button className="m-acc-head" type="button" onClick={() => setOpenSection(openSection === section.id ? "" : section.id)}>
                <span className="lbl">{section.label}</span><span>⌄</span>
              </button>
              {openSection === section.id && (
                <div className="m-acc-body">
                  {section.items.map((item) => (
                    <Link key={item.label} href={item.href} onClick={onClose}>{item.label}</Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="m-drawer-foot">
          <Link className="m-btn m-btn-pri m-btn-block" href="/register-business" onClick={onClose}>List your services</Link>
          <Link className="m-btn m-btn-ghost m-btn-block" href="/dashboard" onClick={onClose}>Log in</Link>
        </div>
        <div className="m-drawer-divide" />
        <div className="m-drawer-legal">
          <span className="cc">© 2026 SolidFind.id</span>
          <a href="https://instagram.com/solidfind.id" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
      </div>
    </div>
  );
}
