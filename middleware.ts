import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // Redirect non-www to www, but EXCLUDE API routes to prevent OAuth issues
  if (
    hostname === "emildalhoff.dk" &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/_next/")
  ) {
    const wwwUrl = new URL(request.url);
    wwwUrl.host = "www.emildalhoff.dk";
    return NextResponse.redirect(wwwUrl, 308);
  }

  const token = request.cookies.get("auth_token");

  // Protect all /[workspaceId]/* routes and /workspaces
  const isProtectedRoute =
    /^\/[^/]+\//.test(pathname) || pathname.startsWith("/workspaces");

  // Redirect to login if accessing protected route without token
  if (!token && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to workspaces if accessing login with token
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/workspaces", request.url));
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
