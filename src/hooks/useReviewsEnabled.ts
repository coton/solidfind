import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useReviewsEnabled(): boolean {
  const value = useQuery(api.platformSettings.get, { key: "reviews_enabled" });
  return value === "true";
}
