"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { api } from "../../../convex/_generated/api";
import { useSiteLanguage } from "@/components/LanguageProvider";
import { ProSubscriptionModal, parseRupiahAmount } from "@/components/ProSubscriptionModal";
import { getDefaultProGuidelines, parseProGuidelinesItems } from "@/lib/pro-guidelines-content.mjs";

type GuidelineItem = { title: string; body: string };

const PRICE_DEFAULTS = {
  launch: { monthly: "450000", yearly: "5000000" },
  standard: { monthly: "650000", yearly: "7000000" },
};

export default function UpgradePage() {
  const [showProModal, setShowProModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const { language, t } = useSiteLanguage();
  const platformSettings = useQuery(api.platformSettings.getAll);
  const platformMap = useMemo(() => new Map((platformSettings ?? []).map((setting) => [setting.key, setting.value])), [platformSettings]);
  const pricingPhase = platformMap.get("pricing_phase") === "standard" ? "standard" : "launch";
  const monthlyPrice = platformMap.get(`monthly_price_${pricingPhase}`) ?? PRICE_DEFAULTS[pricingPhase].monthly;
  const yearlyPrice = platformMap.get(`yearly_price_${pricingPhase}`) ?? PRICE_DEFAULTS[pricingPhase].yearly;
  const monthlyAmount = parseRupiahAmount(monthlyPrice);
  const yearlyAmount = parseRupiahAmount(yearlyPrice);
  const suffix = language === "id" ? "Id" : "";
  const defaults = getDefaultProGuidelines(language);
  const proTitle = platformMap.get(`proGuidelinesTitle${suffix}`)?.trim() || defaults.title;
  const proIntro = platformMap.get(`proGuidelinesIntro${suffix}`)?.trim() || defaults.intro;
  const localizedGuidelines: GuidelineItem[] = parseProGuidelinesItems(
    platformMap.get(`proGuidelinesItems${suffix}`),
    defaults.items,
  );

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      <Header />

      <main className="sf-pro-guidelines">
        <Link className="sf-about-back" href="/company-dashboard">{t("← Back to dashboard", "← Kembali ke dasbor")}</Link>

        <section className="sf-pro-guide-hero">
          <span className="sf-tag-mono">{t("Pro guidelines")}</span>
          <h1>{proTitle.split(/\n+/).map((line, index) => <span key={`${line}-${index}`}>{index > 0 && <br />}{line}</span>)}</h1>
          <p>{proIntro}</p>
          <button type="button" className="sf-btn sf-btn-pri sf-pro-guide-cta" onClick={() => setShowProModal(true)}>
            {t("Get Pro →")}
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
