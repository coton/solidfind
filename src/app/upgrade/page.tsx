"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { api } from "../../../convex/_generated/api";
import { useSiteLanguage } from "@/components/LanguageProvider";
import { ProSubscriptionModal, parseRupiahAmount } from "@/components/ProSubscriptionModal";

const PRICE_DEFAULTS = {
  launch: { monthly: "450000", yearly: "5000000" },
  standard: { monthly: "650000", yearly: "7000000" },
};

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
  const monthlyAmount = parseRupiahAmount(monthlyPrice);
  const yearlyAmount = parseRupiahAmount(yearlyPrice);
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
        <ProSubscriptionModal
          billingCycle={billingCycle}
          monthlyAmount={monthlyAmount}
          yearlyAmount={yearlyAmount}
          onBillingCycleChange={setBillingCycle}
          onClose={() => setShowProModal(false)}
        />
      )}
    </div>
  );
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
