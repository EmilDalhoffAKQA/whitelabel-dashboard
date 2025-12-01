import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Create response that redirects to login
  const loginUrl = new URL("/login", req.url);
  const response = NextResponse.redirect(loginUrl);

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
