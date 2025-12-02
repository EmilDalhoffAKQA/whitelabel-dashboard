import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Determine hostname and cookie domain
  const hostname = req.headers.get("host") || "";
  const isLocalhost =
    hostname.includes("localhost") || hostname.includes("127.0.0.1");
  const cookieDomain = isLocalhost ? undefined : ".emildalhoff.dk";

  // Build the Auth0 logout URL
  const auth0Domain =
    process.env.AUTH0_DOMAIN || "dev-5pkmczfntibnqqfu.us.auth0.com";
  const baseUrl = process.env.NEXTAUTH_URL || req.nextUrl.origin;
  const returnToUrl = `${baseUrl}/login?logout=true`;

  const auth0LogoutUrl = new URL(`https://${auth0Domain}/v2/logout`);
  auth0LogoutUrl.searchParams.set(
    "client_id",
    process.env.AUTH0_CLIENT_ID || "ev0QQqC5UH9gZXLQslLRaWAEHX0qJRxE"
  );
  auth0LogoutUrl.searchParams.set("returnTo", returnToUrl);

  const response = NextResponse.redirect(auth0LogoutUrl.toString());

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
