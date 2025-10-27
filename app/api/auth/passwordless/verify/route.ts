import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body?.email;
    const otp = body?.otp || body?.verification_code;

    if (!email || !otp) {
      return NextResponse.json({ error: "Missing email or otp" }, { status: 400 });
    }

    const issuer = process.env.AUTH0_ISSUER_BASE_URL;
    const clientId = process.env.AUTH0_CLIENT_ID;
    const clientSecret = process.env.AUTH0_CLIENT_SECRET;

    if (!issuer || !clientId || !clientSecret) {
      return NextResponse.json(
        { error: "Server misconfiguration: missing AUTH0 settings" },
        { status: 500 }
      );
    }

    const tokenRes = await fetch(`${issuer.replace(/\/$/, "")}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "http://auth0.com/oauth/grant-type/passwordless/otp",
        client_id: clientId,
        client_secret: clientSecret,
        username: email,
        otp,
        realm: "email",
        scope: "openid profile email",
      }),
    });

    const text = await tokenRes.text();
    try {
      return NextResponse.json(JSON.parse(text), { status: tokenRes.status });
    } catch (err) {
      return new NextResponse(text, { status: tokenRes.status });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
