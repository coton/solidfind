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
  return hostname === "www.solidfind.id";
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
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!api|trpc|_next|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$).*)",
  ],
};
