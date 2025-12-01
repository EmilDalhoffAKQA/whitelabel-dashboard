import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Clear all auth cookies first
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  
  // Build the Auth0 logout URL - use base URL which is already whitelisted
  const logoutUrl = new URL(`https://${process.env.AUTH0_DOMAIN}/v2/logout`);
  logoutUrl.searchParams.set("client_id", process.env.AUTH0_CLIENT_ID!);
  logoutUrl.searchParams.set("returnTo", baseUrl);

  const response = NextResponse.redirect(logoutUrl.toString());

  // Clear all auth cookies
  response.cookies.set("auth_token", "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  response.cookies.set("user_info", "", {
    maxAge: 0,
    path: "/",
    sameSite: "lax",
  });
  response.cookies.set("current_workspace", "", {
    maxAge: 0,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
