import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Create response that redirects to login with logout flag
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("logout", "true");

  const response = NextResponse.redirect(loginUrl);

  // Determine hostname and cookie domain
  const hostname = req.headers.get("host") || "";
  const isLocalhost =
    hostname.includes("localhost") || hostname.includes("127.0.0.1");
  const cookieDomain = isLocalhost ? undefined : ".emildalhoff.dk";

  // Clear all auth cookies on server side - must match the domain used when setting them
  response.cookies.set("auth_token", "", {
    maxAge: 0,
    path: "/",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production" && !isLocalhost,
    sameSite: "lax",
    domain: cookieDomain,
  });
  response.cookies.set("user_info", "", {
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    domain: cookieDomain,
  });
  response.cookies.set("current_workspace", "", {
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    domain: cookieDomain,
  });

  return response;
}
