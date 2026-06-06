"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { api } from "../../../convex/_generated/api";
import { useSiteLanguage } from "@/components/LanguageProvider";

const PRICE_DEFAULTS = {
  launch: { monthly: "450000", yearly: "5000000" },
  standard: { monthly: "650000", yearly: "7000000" },
};

const proBenefits = [
  {
    title: "Priority placement in search",
    description: "Your listing ranks above non-Pro companies within your category, so clients see you sooner when searching your area.",
  },
  {
    title: "Visibility analytics",
    description: "A dashboard of profile views, where viewers found you, and the regions driving the most interest.",
  },
  {
    title: "Up to 12 photos or videos",
    description: "Show four times more work than a free account: full projects, walkthroughs, and detail shots.",
  },
  {
    title: "Ad placements across the platform",
    description: "Eligible for sponsored slots on category pages and search results, subject to available inventory.",
  },
  {
    title: "AI-ready profile formatting",
    description: "Structured fields optimized for AI-assisted search, so your studio surfaces in the right results.",
  },
];

const guidelines = [
  {
    title: "Profile accuracy",
    body: "Keep your public details, service coverage, photos, and contact links accurate. SolidFind may pause visibility for profiles that contain misleading or outdated information.",
  },
  {
    title: "Portfolio quality",
    body: "Use real project references, clear captions, and relevant imagery. Logos stay as profile pictures; project or placeholder imagery should be used for covers.",
  },
  {
    title: "Reviews",
    body: "Testimonials must come from real client experiences. Companies may not create, buy, or pressure users into inaccurate reviews.",
  },
  {
    title: "Sponsored placements",
    body: "Ads and sponsored positions remain subject to availability, relevance, and platform moderation.",
  },
  {
    title: "Billing",
    body: "Pro subscriptions use Indonesian rupiah pricing and are processed securely via Midtrans. Changes apply to the next billing cycle unless otherwise stated.",
  },
];

export default function UpgradePage() {
  const [showProModal, setShowProModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const { language } = useSiteLanguage();
  const platformSettings = useQuery(api.platformSettings.getAll);
  const platformMap = useMemo(() => new Map((platformSettings ?? []).map((setting) => [setting.key, setting.value])), [platformSettings]);
  const pricingPhase = platformMap.get("pricing_phase") === "standard" ? "standard" : "launch";
  const monthlyPrice = platformMap.get(`monthly_price_${pricingPhase}`) ?? PRICE_DEFAULTS[pricingPhase].monthly;
  const yearlyPrice = platformMap.get(`yearly_price_${pricingPhase}`) ?? PRICE_DEFAULTS[pricingPhase].yearly;
  const monthlyAmount = parseRupiah(monthlyPrice);
  const yearlyAmount = parseRupiah(yearlyPrice);
  const yearlySavings = Math.max(0, monthlyAmount * 12 - yearlyAmount);
  const suffix = language === "id" ? "Id" : "";
  const proTitle = platformMap.get(`proGuidelinesTitle${suffix}`)?.trim() || "More visibility.\nSame standards.";
  const proIntro = platformMap.get(`proGuidelinesIntro${suffix}`)?.trim()
    || "Pro helps verified professionals present richer profiles and appear in stronger discovery positions. The same listing standards still apply to every account.";
  const localizedGuidelines = parseGuidelines(platformMap.get(`proGuidelinesItems${suffix}`), guidelines);

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      <Header />

      <main className="sf-pro-guidelines">
        <Link className="sf-about-back" href="/company-dashboard">← Back to dashboard</Link>

        <section className="sf-pro-guide-hero">
          <span className="sf-tag-mono">Pro guidelines</span>
          <h1>{proTitle.split(/\n+/).map((line, index) => <span key={`${line}-${index}`}>{index > 0 && <br />}{line}</span>)}</h1>
          <p>{proIntro}</p>
          <button type="button" className="sf-btn sf-btn-pri sf-pro-guide-cta" onClick={() => setShowProModal(true)}>
            Get Pro →
          </button>
        </section>

        <section className="sf-pro-guide-grid" aria-label="Pro guidelines">
          {localizedGuidelines.map((item, index) => (
            <article className="sf-about-card" key={item.title}>
              <span className="sf-about-card-n">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <span className="sf-tag-mono">{item.title}</span>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </section>
      </main>

      <Footer />

      {showProModal && (
        <div className="sf-modal-scrim open" onClick={() => setShowProModal(false)}>
          <div className="sf-modal sf-pro-sub-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="sf-modal-x" onClick={() => setShowProModal(false)} aria-label="Close">×</button>
            <span className="sf-tag-mono sf-pro-sub-k">Pro subscription</span>
            <h2>Get Pro</h2>
            <p className="sf-pro-sub-lead">Everything in a free profile, plus the visibility tools companies use to be found and chosen.</p>

            <div className="sf-pro-sub-list">
              {proBenefits.map((feature) => (
                <div className="sf-pro-sub-benefit" key={feature.title}>
                  <span className="sf-pro-sub-check">✓</span>
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <span className="sf-tag-mono sf-pro-sub-plan-k">Choose your plan</span>
            <div className="sf-pro-plan-grid">
              <button
                type="button"
                className={`sf-pro-plan ${billingCycle === "monthly" ? "on" : ""}`}
                onClick={() => setBillingCycle("monthly")}
              >
                <span className="sf-pro-plan-top">
                  <b>Monthly</b>
                  <span className="sf-pro-switch" aria-hidden="true"><i /></span>
                </span>
                <strong>{formatRupiah(monthlyAmount)}</strong>
                <span>per month</span>
                <small>Billed every month</small>
              </button>
              <button
                type="button"
                className={`sf-pro-plan ${billingCycle === "yearly" ? "on" : ""}`}
                onClick={() => setBillingCycle("yearly")}
              >
                <span className="sf-pro-plan-top">
                  <b>Yearly</b>
                  <span className="sf-pro-switch" aria-hidden="true"><i /></span>
                </span>
                <strong>{formatRupiahCompact(yearlyAmount)}</strong>
                <span>per year</span>
                {yearlySavings > 0 && <small className="save">Save {formatRupiah(yearlySavings)} a year</small>}
              </button>
            </div>

            <button type="button" className="sf-btn sf-btn-pri sf-pro-buy">
              Buy now →
            </button>
            <p className="sf-pro-sub-note">
              Secure payment via Midtrans. By subscribing you agree to the <Link href="/terms?doc=pro">Pro Terms of Service</Link>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function parseRupiah(value: string | null | undefined) {
  const amount = Number.parseInt(String(value ?? "0").replace(/[^\d]/g, ""), 10);
  return Number.isFinite(amount) ? amount : 0;
}

function formatRupiah(amount: number) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(amount)}`;
}

function formatRupiahCompact(amount: number) {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    const formatted = Number.isInteger(millions)
      ? String(millions)
      : millions.toLocaleString("id-ID", { maximumFractionDigits: 1 });
    return `Rp ${formatted}jt`;
  }
  return formatRupiah(amount);
}

function parseGuidelines(value: string | undefined, fallback: typeof guidelines) {
  if (!value?.trim()) return fallback;
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return fallback;
    const normalized = parsed
      .map((item) => ({
        title: String(item?.title ?? "").trim(),
        body: String(item?.body ?? "").trim(),
      }))
      .filter((item) => item.title && item.body);
    return normalized.length ? normalized : fallback;
  } catch {
    return fallback;
  }
}
