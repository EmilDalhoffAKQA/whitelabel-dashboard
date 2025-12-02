import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      console.error("Auth0 callback error:", error);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/login?error=${error}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/login?error=missing_params`
      );
    }

    const tokenResponse = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          code,
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error("Token exchange error:", error);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/login?error=auth_failed`
      );
    }

    const tokens = await tokenResponse.json();

    const userResponse = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    const userInfo = await userResponse.json();

    // Try to sync to Supabase, but don't fail auth if it doesn't work
    try {
      await syncUserToSupabase(userInfo);
    } catch (syncError) {
      console.error(
        "[Callback] Failed to sync to Supabase (non-fatal):",
        syncError
      );
      // Continue anyway - don't block authentication
    }

    // Determine the correct hostname to redirect to
    const hostname = req.headers.get("host") || "";
    const protocol =
      req.headers.get("x-forwarded-proto") ||
      req.nextUrl.protocol.replace(":", "");
    const isLocalhost =
      hostname.includes("localhost") || hostname.includes("127.0.0.1");
    const isSecure = protocol === "https";

    const baseUrl = isLocalhost
      ? `http://${hostname}`
      : `https://www.emildalhoff.dk`; // Always redirect to www in production

    const response = NextResponse.redirect(`${baseUrl}/workspaces`);

    // Only set secure flag if we're actually using HTTPS
    const shouldBeSecure = isSecure && !isLocalhost;
    const cookieDomain = isLocalhost ? undefined : ".emildalhoff.dk";

    // Set auth token cookie
    response.cookies.set("auth_token", tokens.id_token, {
      httpOnly: false,
      secure: shouldBeSecure,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      domain: cookieDomain,
    });

    // Set user info cookie
    response.cookies.set("user_info", JSON.stringify(userInfo), {
      httpOnly: false,
      secure: shouldBeSecure,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      domain: cookieDomain,
    });

    return response;
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/login?error=callback_failed`
    );
  }
}

async function syncUserToSupabase(auth0User: any) {
  const client = supabaseAdmin;
  if (!client) {
    console.warn(
      "[Supabase] Admin client not initialized - skipping user sync"
    );
    return; // Don't throw, just return
  }

  const { data: user, error: userError } = await client
    .from("users")
    .upsert(
      {
        email: auth0User.email,
        name: auth0User.name || auth0User.email,
        auth0_id: auth0User.sub,
      },
      { onConflict: "auth0_id" }
    )
    .select()
    .single();

  if (userError) {
    console.error("[Supabase] Error syncing user:", userError);
    throw new Error(`Failed to sync user: ${userError.message}`);
  }

  if (!user) {
    throw new Error("Failed to sync user: No user returned");
  }
}
