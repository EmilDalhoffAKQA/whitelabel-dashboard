import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email");
  const connection = url.searchParams.get("connection") || "email";
  const sendParam = url.searchParams.get("send") || "link";
  const organization = url.searchParams.get("organization") || undefined;

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const issuer =
    process.env.AUTH0_ISSUER_BASE_URL ||
    (process.env.AUTH0_DOMAIN
      ? `https://${process.env.AUTH0_DOMAIN}`
      : undefined);
  const clientId = process.env.AUTH0_CLIENT_ID;
  const clientSecret = process.env.AUTH0_CLIENT_SECRET;

  if (!issuer || !clientId || !clientSecret) {
    // If DEBUG_AUTH0=1 is set in the environment we return which values are missing
    // (do NOT return secrets). This is helpful for debugging deployment/env issues.
    if (process.env.DEBUG_AUTH0 === "1") {
      const missing: string[] = [];
      if (!issuer) missing.push("AUTH0_ISSUER_BASE_URL or AUTH0_DOMAIN");
      if (!clientId) missing.push("AUTH0_CLIENT_ID");
      if (!clientSecret) missing.push("AUTH0_CLIENT_SECRET");
      return NextResponse.json(
        {
          error: "Server misconfiguration: missing AUTH0 settings",
          missing,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Server misconfiguration: missing AUTH0 settings" },
      { status: 500 }
    );
  }

  const baseUrl =
    process.env.AUTH0_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";
  const redirectUri = `${baseUrl.replace(/\/$/, "")}/api/auth/callback`;

  const payload: any = {
    client_id: clientId,
    connection,
    email,
    send: sendParam, // "link" or "code"
    authParams: {
      redirect_uri: redirectUri,
      scope: "openid profile email",
      ...(organization ? { organization } : {}),
    },
  };

  const res = await fetch(`${issuer.replace(/\/$/, "")}/passwordless/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Basic " +
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  try {
    return NextResponse.json(JSON.parse(text), { status: res.status });
  } catch (err) {
    return new NextResponse(text, { status: res.status });
  }
}
