import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Build the Auth0 logout URL with returnTo pointing to /login
  const logoutUrl = new URL(`https://${process.env.AUTH0_DOMAIN}/v2/logout`);
  logoutUrl.searchParams.set("client_id", process.env.AUTH0_CLIENT_ID!);
  
  // Construct the return URL (should be /login)
  const returnUrl = new URL("/login", process.env.NEXTAUTH_URL || req.url);
  logoutUrl.searchParams.set("returnTo", returnUrl.toString());

  const response = NextResponse.redirect(logoutUrl.toString());
  
  // Clear all auth cookies
  response.cookies.set("auth_token", "", { 
    maxAge: 0, 
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
  response.cookies.set("user_info", "", { 
    maxAge: 0, 
    path: "/",
    sameSite: "lax"
  });
  response.cookies.set("current_workspace", "", { 
    maxAge: 0, 
    path: "/",
    sameSite: "lax"
  });
  
  return response;
}
