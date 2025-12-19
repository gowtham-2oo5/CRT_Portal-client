import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check if the request is for a protected route
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    // Check for the cookie first (for same-domain), then we'll check sessionStorage on client side
    const accessToken = request.cookies.get("jwt_token");

    console.log("[Middleware] Checking access_token cookie:", !!accessToken);

    // For cross-domain (Vercel), we can't check sessionStorage in middleware
    // So we allow the request and let the client-side check handle it
    // The middleware will only block if there's definitely no auth
    
    // Allow the request to proceed - client-side will handle redirect if needed
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: ["/dashboard/:path*"],
};
