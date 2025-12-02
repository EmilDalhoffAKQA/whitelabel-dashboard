import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // Skip middleware for API routes entirely to avoid interfering with auth flow
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token");

  // Allow public routes without token check
  const publicRoutes = ["/login", "/welcome", "/onboarding"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect root path to login if no token (handles Auth0 logout redirect)
  if (pathname === "/" && !token) {
    const loginUrl = new URL("/login", request.url);
    if (hostname.startsWith("www.")) {
      loginUrl.host = hostname;
    }
    return NextResponse.redirect(loginUrl);
  }

  // Redirect root path to workspaces if has token
  if (pathname === "/" && token) {
    const workspacesUrl = new URL("/workspaces", request.url);
    if (hostname.startsWith("www.")) {
      workspacesUrl.host = hostname;
    }
    return NextResponse.redirect(workspacesUrl);
  }

  // Check auth FIRST before doing www redirect
  // Protect all /[workspaceId]/* routes and /workspaces
  const isProtectedRoute =
    /^\/[^/]+\//.test(pathname) || pathname.startsWith("/workspaces");

  // Allow access if coming from auth callback (referer check)
  const referer = request.headers.get("referer") || "";
  const isFromAuthCallback = referer.includes("/api/auth/callback");

  // Redirect to login if accessing protected route without token
  if (!token && isProtectedRoute && !isFromAuthCallback) {
    const loginUrl = new URL("/login", request.url);
    // Preserve www in the redirect
    if (hostname.startsWith("www.")) {
      loginUrl.host = hostname;
    }
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to workspaces if accessing public routes with valid token (except login during logout)
  // Check for logout parameter to allow login page during logout flow
  const isLogoutFlow = request.nextUrl.searchParams.get("logout") === "true";

  if (token && isPublicRoute && !isLogoutFlow) {
    const workspacesUrl = new URL("/workspaces", request.url);
    // Preserve www in the redirect
    if (hostname.startsWith("www.")) {
      workspacesUrl.host = hostname;
    }
    return NextResponse.redirect(workspacesUrl);
  }

  // Allow /login during logout flow even with token
  if (pathname === "/login" && isLogoutFlow) {
    // Let it through - cookies will be cleared on client side
    return NextResponse.next();
  }

  // Redirect non-www to www AFTER auth checks, but EXCLUDE API routes
  if (
    hostname === "emildalhoff.dk" &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/_next/")
  ) {
    const wwwUrl = new URL(request.url);
    wwwUrl.host = "www.emildalhoff.dk";
    return NextResponse.redirect(wwwUrl, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
