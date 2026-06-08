export const PROJECT_BUDGET_TIERS_PLATFORM_KEY = "project_budget_tiers";

export const DEFAULT_PROJECT_BUDGET_TIERS = [
  { value: 150_000, label: "< Rp 250rb" },
  { value: 250_000, label: "Rp 250rb" },
  { value: 500_000, label: "Rp 500rb - 1jt" },
  { value: 1_000_000, label: "Rp 1jt - 2,5jt" },
  { value: 2_500_000, label: "Rp 2,5jt - 5jt" },
  { value: 5_000_000, label: "Rp 5jt - 10jt" },
  { value: 10_000_000, label: "Rp 10jt - 25jt" },
  { value: 25_000_000, label: "Rp 25jt - 50jt" },
  { value: 50_000_000, label: "Rp 50jt - 100jt" },
  { value: 100_000_000, label: "Rp 100jt - 250jt" },
  { value: 250_000_000, label: "Rp 250jt - 500jt" },
  { value: 500_000_000, label: "Rp 500jt - 750jt" },
  { value: 750_000_000, label: "Rp 750jt - 1M" },
  { value: 1_000_000_000, label: "Rp 1M - 2M" },
  { value: 2_000_000_000, label: "Rp 2M - 3,5M" },
  { value: 3_500_000_000, label: "Rp 3,5M - 5M" },
  { value: 5_000_000_000, label: "Rp 5M - 7,5M" },
  { value: 7_500_000_000, label: "Rp 7,5M - 10M" },
  { value: 10_000_000_000, label: "Rp 10M - 15M" },
  { value: 15_000_000_000, label: "Rp 15M - 20M" },
  { value: 20_000_000_000, label: "Rp 20M - 50M+" },
  { value: 50_000_000_000, label: "Rp 50M+", openTop: true },
];

export function parseProjectBudgetTiers(value) {
  if (!value || typeof value !== "string") return DEFAULT_PROJECT_BUDGET_TIERS;
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return DEFAULT_PROJECT_BUDGET_TIERS;
    const normalized = parsed
      .map((tier) => ({
        value: Number(tier?.value),
        label: String(tier?.label ?? "").trim(),
        openTop: Boolean(tier?.openTop),
      }))
      .map((tier) => tier.value === 150_000 && tier.label === "< Rp 500rb"
        ? { ...tier, label: "< Rp 250rb" }
        : tier
      )
      .filter((tier) => Number.isFinite(tier.value) && tier.value > 0 && tier.label);
    if (normalized.some((tier) => tier.value === 150_000) && !normalized.some((tier) => tier.value === 250_000)) {
      const firstIndex = normalized.findIndex((tier) => tier.value === 150_000);
      normalized.splice(firstIndex + 1, 0, { value: 250_000, label: "Rp 250rb", openTop: false });
    }
    return normalized.length >= 2 ? normalized : DEFAULT_PROJECT_BUDGET_TIERS;
  } catch {
    return DEFAULT_PROJECT_BUDGET_TIERS;
  }
}

export function formatProjectBudgetRange(minValue, maxValue, tiers = DEFAULT_PROJECT_BUDGET_TIERS) {
  const minTier = tiers.find((tier) => tier.value === minValue);
  const maxTier = tiers.find((tier) => tier.value === maxValue);
  if (!minTier || !maxTier) return "";
  if (minTier.value === maxTier.value) return minTier.label;
  return `${minTier.label.split(" - ")[0]} - ${maxTier.label.split(" - ").at(-1)}`;
}
