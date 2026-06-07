"use client";

import Link from "next/link";

type BillingCycle = "monthly" | "yearly";

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

export function parseRupiahAmount(value: string | number | null | undefined) {
  const amount = Number.parseInt(String(value ?? "0").replace(/[^\d]/g, ""), 10);
  return Number.isFinite(amount) ? amount : 0;
}

export function ProSubscriptionModal({
  billingCycle,
  monthlyAmount,
  yearlyAmount,
  isSubmitting = false,
  error = "",
  onBillingCycleChange,
  onBuy,
  onClose,
}: {
  billingCycle: BillingCycle;
  monthlyAmount: number;
  yearlyAmount: number;
  isSubmitting?: boolean;
  error?: string;
  onBillingCycleChange: (cycle: BillingCycle) => void;
  onBuy?: () => void;
  onClose: () => void;
}) {
  const yearlySavings = Math.max(0, monthlyAmount * 12 - yearlyAmount);

  return (
    <div className="sf-modal-scrim open" onClick={onClose}>
      <div className="sf-modal sf-pro-sub-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="sf-modal-x" onClick={onClose} aria-label="Close">×</button>
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
            onClick={() => onBillingCycleChange("monthly")}
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
            onClick={() => onBillingCycleChange("yearly")}
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

        {error && <p className="sf-pro-sub-error">{error}</p>}

        <button type="button" className="sf-btn sf-btn-pri sf-pro-buy" onClick={onBuy} disabled={isSubmitting || !onBuy}>
          {isSubmitting ? "Creating link..." : "Buy now →"}
        </button>
        <p className="sf-pro-sub-note">
          Secure payment via Midtrans. By subscribing you agree to the <Link href="/terms?doc=pro">Pro Terms of Service</Link>.
        </p>
      </div>
    </div>
  );
}
