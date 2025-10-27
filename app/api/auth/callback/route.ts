import { NextResponse } from "next/server";

async function exchangeTicket(
  issuer: string,
  clientId: string,
  clientSecret: string,
  ticket: string
) {
  const tokenRes = await fetch(`${issuer.replace(/\/$/, "")}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "http://auth0.com/oauth/grant-type/passwordless/otp",
      client_id: clientId,
      client_secret: clientSecret,
      ticket,
      scope: "openid profile email",
    }),
  });
  const text = await tokenRes.text();
  try {
    return { ok: tokenRes.ok, status: tokenRes.status, body: JSON.parse(text) };
  } catch {
    return { ok: tokenRes.ok, status: tokenRes.status, body: text };
  }
}

async function exchangeVerificationCode(
  issuer: string,
  clientId: string,
  clientSecret: string,
  email: string,
  verification_code: string
) {
  const tokenRes = await fetch(`${issuer.replace(/\/$/, "")}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "http://auth0.com/oauth/grant-type/passwordless/otp",
      client_id: clientId,
      client_secret: clientSecret,
      username: email,
      otp: verification_code,
      realm: "email",
      scope: "openid profile email",
    }),
  });
  const text = await tokenRes.text();
  try {
    return { ok: tokenRes.ok, status: tokenRes.status, body: JSON.parse(text) };
  } catch {
    return { ok: tokenRes.ok, status: tokenRes.status, body: text };
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const params: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // Log server-side for debugging
    // eslint-disable-next-line no-console
    console.log("/api/auth/callback received query:", params);

    const issuer = process.env.AUTH0_ISSUER_BASE_URL;
    const clientId = process.env.AUTH0_CLIENT_ID;
    const clientSecret = process.env.AUTH0_CLIENT_SECRET;

    // Quick debug page when no actionable params are present
    const hasTicket = !!params["ticket"];
    const hasVerificationCode =
      !!params["verification_code"] || !!params["verificationCode"];
    const hasError = !!params["error"];

    if (!hasTicket && !hasVerificationCode) {
      const entries = Object.entries(params);
      const listHtml = entries.length
        ? entries
            .map(
              ([k, v]) =>
                `<li><strong>${String(k)}</strong>: <code>${String(
                  v
                )}</code></li>`
            )
            .join("\n")
        : "<li>(no query parameters)</li>";

      const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Auth0 passwordless callback</title>
    <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:24px}code{background:#f4f4f4;padding:2px 6px;border-radius:4px}</style>
  </head>
  <body>
    <h1>Auth0 passwordless callback received</h1>
    <p>This page displays the query parameters Auth0 included when redirecting you here.</p>
    <ul>
      ${listHtml}
    </ul>
    <p>If you see an <code>error</code> param that mentions same-device, Auth0 enforced same-browser verification. Use the OTP flow instead (send=code).</p>
  </body>
</html>`;

      return new NextResponse(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (!issuer || !clientId || !clientSecret) {
      // eslint-disable-next-line no-console
      console.error("Missing AUTH0 config for callback exchange");
      return NextResponse.json(
        { error: "Server misconfiguration: missing AUTH0 settings" },
        { status: 500 }
      );
    }

    // Prefer ticket exchange (magic-link flow)
    if (hasTicket) {
      const ticket = params["ticket"];
      const result = await exchangeTicket(
        issuer,
        clientId,
        clientSecret,
        ticket
      );
      if (!result.ok) {
        // Show debug page with error
        return NextResponse.json(
          { error: "Token exchange failed", detail: result.body },
          { status: result.status || 500 }
        );
      }

      const tokenBody: any = result.body;
      // Set a cookie with token details (httpOnly)
      const cookieValue = encodeURIComponent(
        JSON.stringify({
          id_token: tokenBody.id_token,
          access_token: tokenBody.access_token,
        })
      );
      const maxAge = tokenBody.expires_in || 3600;
      const secure = process.env.NODE_ENV === "production";
      const cookie = `auth=${cookieValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${
        secure ? "; Secure" : ""
      }`;

      const redirectTo =
        (
          process.env.AUTH0_BASE_URL ||
          process.env.NEXT_PUBLIC_BASE_URL ||
          "/"
        ).replace(/\/$/, "") + "/";
      const res = NextResponse.redirect(redirectTo);
      res.headers.append("Set-Cookie", cookie);
      return res;
    }

    // If we have verification_code (alternative flow) try exchanging
    if (hasVerificationCode) {
      const verification_code =
        params["verification_code"] || params["verificationCode"];
      const email = params["email"] || params["username"];
      if (!email) {
        return NextResponse.json(
          { error: "Missing email to exchange verification_code" },
          { status: 400 }
        );
      }

      const result = await exchangeVerificationCode(
        issuer,
        clientId,
        clientSecret,
        email,
        verification_code as string
      );
      if (!result.ok) {
        return NextResponse.json(
          { error: "Token exchange failed", detail: result.body },
          { status: result.status || 500 }
        );
      }

      const tokenBody: any = result.body;
      const cookieValue = encodeURIComponent(
        JSON.stringify({
          id_token: tokenBody.id_token,
          access_token: tokenBody.access_token,
        })
      );
      const maxAge = tokenBody.expires_in || 3600;
      const secure = process.env.NODE_ENV === "production";
      const cookie = `auth=${cookieValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${
        secure ? "; Secure" : ""
      }`;

      const redirectTo =
        (
          process.env.AUTH0_BASE_URL ||
          process.env.NEXT_PUBLIC_BASE_URL ||
          "/"
        ).replace(/\/$/, "") + "/";
      const res = NextResponse.redirect(redirectTo);
      res.headers.append("Set-Cookie", cookie);
      return res;
    }

    return NextResponse.json(
      { error: "Unhandled callback parameters", params },
      { status: 400 }
    );
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("Error in /api/auth/callback:", err?.stack || err);
    return NextResponse.json(
      { error: "Callback handler error" },
      { status: 500 }
    );
  }
}
