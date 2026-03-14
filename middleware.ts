import { NextRequest, NextResponse } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/choose-plan",
  "/planner",
  "/search",
  "/wishlist",
  "/itinerary",
  "/collaboration",
  "/proposal",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  if (!isProtected) {
    return NextResponse.next();
  }

  // Better Auth stores session in a cookie named "better-auth.session_token"
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  if (!sessionToken) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/choose-plan/:path*",
    "/planner/:path*",
    "/search/:path*",
    "/wishlist/:path*",
    "/itinerary/:path*",
    "/collaboration/:path*",
    "/proposal/:path*",
  ],
};
