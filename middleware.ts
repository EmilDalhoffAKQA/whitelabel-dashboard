import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get("auth_token");

  // Check auth FIRST before doing www redirect
  // Protect all /[workspaceId]/* routes and /workspaces
  const isProtectedRoute =
    /^\/[^/]+\//.test(pathname) || pathname.startsWith("/workspaces");

  // Redirect to login if accessing protected route without token
  if (!token && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    // Preserve www in the redirect
    if (hostname.startsWith("www.")) {
      loginUrl.host = hostname;
    }
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to workspaces if accessing login with token
  if (token && pathname === "/login") {
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
