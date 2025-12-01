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

  // Debug logging
  console.log("[Middleware]", {
    pathname,
    hostname,
    hasToken: !!token,
    cookies: request.cookies.getAll().map((c) => c.name),
  });

  // Allow public routes without token check
  const publicRoutes = ["/login", "/welcome", "/onboarding", "/link-workspace"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

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
    console.log("[Middleware] Redirecting to login - no token");
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to workspaces if accessing public routes with valid token
  if (token && isPublicRoute) {
    const workspacesUrl = new URL("/workspaces", request.url);
    // Preserve www in the redirect
    if (hostname.startsWith("www.")) {
      workspacesUrl.host = hostname;
    }
    return NextResponse.redirect(workspacesUrl);
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
