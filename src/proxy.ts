import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/company-dashboard(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Only run middleware on protected routes + API routes
    // Skip all public pages to avoid Clerk latency on every request
    "/dashboard(.*)",
    "/company-dashboard(.*)",
    "/(api|trpc)(.*)",
  ],
};
