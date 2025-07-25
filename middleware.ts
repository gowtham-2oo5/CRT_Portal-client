import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check if the request is for a protected route
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    // Check for the cookie with the correct name (access_token as per your backend)
    const accessToken = request.cookies.get("jwt_token");

    console.log("[Middleware] Checking access_token cookie:", !!accessToken);

    if (!accessToken) {
      console.log(
        "[Middleware] No access_token cookie found, redirecting to login"
      );
      return NextResponse.redirect(new URL("/", request.url));
    }

    console.log(
      "[Middleware] Access token found, allowing access to dashboard"
    );
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: ["/dashboard/:path*"],
};
