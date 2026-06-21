import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes
  const isPublic =
    pathname.startsWith("/signin") ||
    pathname.startsWith("/api/auth");

  if (!req.auth && !isPublic) {
    const signInUrl = new URL("/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Run on all routes except static files and _next internals.
  // Note: extension list must include json/geojson so static files under public/
  // (e.g. /geo/ksa-regions.json) are served directly, not routed through auth.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json|geojson|ico|txt|woff|woff2)$).*)",
  ],
};
