import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const logoutUrl = new URL(`https://${process.env.AUTH0_DOMAIN}/v2/logout`);
  logoutUrl.searchParams.set("client_id", process.env.AUTH0_CLIENT_ID!);
  logoutUrl.searchParams.set("returnTo", process.env.NEXTAUTH_URL!);

  const response = NextResponse.redirect(logoutUrl.toString());
  // Remove cookies by setting them with maxAge 0
  response.cookies.set("auth_token", "", { maxAge: 0, path: "/" });
  response.cookies.set("user_info", "", { maxAge: 0, path: "/" });
  response.cookies.set("current_workspace", "", { maxAge: 0, path: "/" });
  return response;
}
