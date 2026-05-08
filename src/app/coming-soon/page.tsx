import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/ComingSoonPage";

export const metadata: Metadata = {
  title: "Coming Soon",
  description: "SolidFind Indonesia is coming soon. Join the waitlist for launch updates.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ComingSoonRoute() {
  return <ComingSoonPage />;
}
