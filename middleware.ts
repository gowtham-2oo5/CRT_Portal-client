import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// Define the JWT payload type
interface TokenPayload {
  role: "ADMIN" | "FACULTY";
  [key: string]: any;
}

type UserRole = TokenPayload["role"];

// Define protected routes and their required roles
const protectedRoutes: Record<string, UserRole[]> = {
  '/dashboard': ['ADMIN', 'FACULTY'],
  '/admin': ['ADMIN'],
} as const;

const publicRoutes = [
  '/',
  '/forgot-password',
  '/unauthorized',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("[Middleware] Checking path:", pathname);

  // Allow public routes
  if (publicRoutes.some(route => pathname === route)) {
    console.log("[Middleware] Public route, allowing access");
    return NextResponse.next();
  }

  // Get auth token from cookies
  const token = request.cookies.get('auth-token')?.value;
  console.log("[Middleware] Token present:", !!token);

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    console.log("[Middleware] No token, redirecting to login");
    const url = new URL('/', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  try {
    // Decode token to get user role
    const decoded = jwtDecode<TokenPayload>(token);
    const userRole = decoded.role;
    console.log("[Middleware] User role:", userRole);

    // Check if route requires specific role
    for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(userRole)) {
          console.log("[Middleware] Unauthorized role, redirecting to unauthorized");
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
        console.log("[Middleware] Role authorized for route");
        break;
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("[Middleware] Token decode error:", error);
    // If token is invalid, redirect to login
    const url = new URL('/', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
