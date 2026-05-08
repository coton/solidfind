import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useProEnabled(): boolean {
  const value = useQuery(api.platformSettings.get, { key: "pro_enabled" });
  return value === "true";
}
