import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import ProfilePageClient from "./ProfilePageClient";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const company = await fetchQuery(api.companies.getById, {
      id: id as Id<"companies">,
    });

    if (!company) {
      return {
        title: "Company Not Found",
      };
    }

    const title = company.name;
    const description = company.description
      ? company.description.slice(0, 160)
      : `${company.name} — ${company.category} professional on SOLIDFIND.ID. View projects, reviews, and contact information.`;

    return {
      title,
      description,
      openGraph: {
        title: `${company.name} | SOLIDFIND.ID`,
        description,
        url: `https://solidfind.vercel.app/profile/${id}`,
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

export default function ProfilePage() {
  return <ProfilePageClient />;
}
