import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/company-dashboard(.*)",
  // /admin has its own custom auth (cookie + admin email), skip Clerk here
]);

function normalizeHostname(value: string | null | undefined) {
  return (value ?? "")
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();
}

function shouldServeComingSoon(hostname: string) {
  return hostname === "solidfind.id" || hostname === "www.solidfind.id";
}

export default clerkMiddleware(async (auth, req) => {
  const hostname = normalizeHostname(
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? req.nextUrl.hostname
  );
  const { pathname } = req.nextUrl;

  if (shouldServeComingSoon(hostname) && pathname !== "/coming-soon") {
    const url = req.nextUrl.clone();
    url.pathname = "/coming-soon";
    url.search = "";
    return NextResponse.rewrite(url);
  }

  if (isProtectedRoute(req)) {
    const { userId } = await auth();

    if (!userId) {
      const url = req.nextUrl.clone();
      const nextPath = `${req.nextUrl.pathname}${req.nextUrl.search}`;
      url.pathname = "/sign-in";
      url.search = "";
      url.searchParams.set("next", nextPath);
      return NextResponse.redirect(url);
    }
  }
});

export const config = {
  matcher: [
    "/api/company/(.*)",
    "/api/set-account-type",
    "/api/admin/export",
    "/api/admin/cleanup-test-users",
    "/api/admin/me",
    "/((?!api|trpc|_next|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$).*)",
  ],
};
