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

    await syncUserToSupabase(userInfo);

    const response = NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/workspaces` // workspace picker page
    );

    response.cookies.set("auth_token", tokens.id_token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      domain: process.env.NODE_ENV === "production" ? ".emildalhoff.dk" : undefined,
    });

    response.cookies.set("user_info", JSON.stringify(userInfo), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      domain: process.env.NODE_ENV === "production" ? ".emildalhoff.dk" : undefined,
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
    throw new Error("Supabase admin client is not initialized");
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

  if (userError || !user) {
    throw new Error("Failed to sync user");
  }
  // No workspace logic here; just ensure user exists.
}
