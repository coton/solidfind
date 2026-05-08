import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import { buildCompanyProfilePath } from "@/lib/company-profile-url.mjs";
import ProfilePageClient from "../profile/[id]/ProfilePageClient";

type Props = {
  params: Promise<{ companySlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { companySlug } = await params;

  try {
    const company = await fetchQuery(api.companies.getByPublicIdentifier, {
      identifier: companySlug,
    });

    if (!company) {
      return {
        title: "Company Not Found",
      };
    }

    const title = company.name;
    const description = company.description
      ? company.description.slice(0, 160)
      : `${company.name} — ${company.category} professional on SOLIDFIND.ID. View projects, testimonials, and contact information.`;

    return {
      title,
      description,
      openGraph: {
        title: `${company.name} | SOLIDFIND.ID`,
        description,
        url: `https://solidfind.id${buildCompanyProfilePath(company)}`,
        siteName: "SOLIDFIND.ID",
        type: "profile",
      },
      twitter: {
        card: "summary",
        title: `${company.name} | SOLIDFIND.ID`,
        description,
      },
    };
  } catch {
    return {
      title: "Company Profile",
    };
  }
}

export default function CompanySlugPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#e4e4e4]" />}>
      <ProfilePageClient />
    </Suspense>
  );
}
