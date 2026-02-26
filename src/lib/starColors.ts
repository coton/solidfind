/**
 * Star color scale — each position has a dedicated color.
 * Index 0 = star 1 (lightest), index 4 = star 5 (brand orange).
 */
export const STAR_COLORS = [
  "#F0C5B9", // 1 star
  "#E9A28E", // 2 stars
  "#F7896A", // 3 stars
  "#F36D48", // 4 stars
  "#F14110", // 5 stars
] as const;

/**
 * Returns the color for a single-star rating display
 * (rounds to nearest integer, clamped 1–5).
 */
export function starColor(rating: number): string {
  const idx = Math.min(Math.max(Math.round(rating), 1), 5) - 1;
  return STAR_COLORS[idx];
}

/**
 * Returns the fill color for the i-th star (0-indexed) given a rating.
 * Stars at index < rating get their positional color; others get grey.
 */
export function starFillColor(index: number, rating: number): string {
  return index < rating ? STAR_COLORS[index] : "#E4E4E4";
}
