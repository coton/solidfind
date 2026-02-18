import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (token === "authenticated") return true;

  try {
    const { userId } = await auth();
    if (userId) {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase().trim();
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase().trim();
      if (userEmail && adminEmail && userEmail === adminEmail) return true;
    }
  } catch {
    // Clerk auth failed
  }

  return false;
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsvRow(values: (string | number | boolean | undefined | null)[]): string {
  return values.map((v) => {
    if (v === undefined || v === null) return "";
    if (typeof v === "boolean") return v ? "true" : "false";
    if (typeof v === "number") return String(v);
    return escapeCsv(String(v));
  }).join(",");
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type");

  if (type === "companies") {
    const companies = await fetchQuery(api.companies.listAll);
    const headers = ["Name", "Category", "Location", "IsPro", "IsFeatured", "Rating", "ReviewCount", "CreatedAt"];
    const rows = companies.map((c) =>
      toCsvRow([
        c.name,
        c.category,
        c.location,
        c.isPro,
        (c as any).isFeatured ?? false,
        c.rating,
        c.reviewCount,
        new Date(c.createdAt).toISOString(),
      ])
    );
    const csv = [headers.join(","), ...rows].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=companies-${Date.now()}.csv`,
      },
    });
  }

  if (type === "users") {
    const users = await fetchQuery(api.users.listAll);
    const headers = ["Name", "Email", "AccountType", "CreatedAt"];
    const rows = users.map((u) =>
      toCsvRow([
        u.name,
        u.email,
        u.accountType,
        new Date(u.createdAt).toISOString(),
      ])
    );
    const csv = [headers.join(","), ...rows].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=users-${Date.now()}.csv`,
      },
    });
  }

  if (type === "reviews") {
    const reviews = await fetchQuery(api.reviews.listAll);
    const headers = ["CompanyName", "UserName", "Rating", "Content", "Flagged", "CreatedAt"];
    const rows = reviews.map((r) =>
      toCsvRow([
        r.companyName,
        r.userName,
        r.rating,
        r.content,
        r.flagged,
        new Date(r.createdAt).toISOString(),
      ])
    );
    const csv = [headers.join(","), ...rows].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=reviews-${Date.now()}.csv`,
      },
    });
  }

  return NextResponse.json({ error: "Invalid type. Use companies, users, or reviews." }, { status: 400 });
}
