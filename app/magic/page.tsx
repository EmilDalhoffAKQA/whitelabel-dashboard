"use client";

import { useState } from "react";

export default function Magic() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<null | {
    type: "success" | "error";
    message: string;
  }>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"code" | "link">("code"); // Changed default to "code"
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState<null | { access_token?: string }>(
    null
  );
  const [verifying, setVerifying] = useState(false);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    if (!email)
      return setStatus({ type: "error", message: "Please enter an email." });
    setLoading(true);
    try {
      const params = new URLSearchParams({
        email,
        send: mode === "code" ? "code" : "link",
      });
      const res = await fetch(
        `/api/auth/passwordless/start?${params.toString()}`
      );
      const text = await res.text();
      let body: any = text;
      try {
        body = JSON.parse(text);
      } catch {}
      if (!res.ok) {
        setStatus({
          type: "error",
          message:
            body?.error ||
            body?.description ||
            text ||
            `Request failed (${res.status})`,
        });
      } else {
        setStatus({
          type: "success",
          message:
            body?.message ||
            body?.status ||
            (mode === "code"
              ? "Code sent to your email. Check your inbox!"
              : "Magic link sent (check your email)."),
        });
      }
    } catch (err: any) {
      setStatus({ type: "error", message: err?.message || String(err) });
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e?: React.FormEvent) {
    e?.preventDefault();
    setStatus(null);
    if (!email) return setStatus({ type: "error", message: "Missing email." });
    if (!otp)
      return setStatus({
        type: "error",
        message: "Enter the code from email.",
      });
    setVerifying(true);
    try {
      const res = await fetch(`/api/auth/passwordless/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const text = await res.text();
      let body: any = text;
      try {
        body = JSON.parse(text);
      } catch {}
      if (!res.ok) {
        setStatus({
          type: "error",
          message: body?.error || text || `Verify failed (${res.status})`,
        });
      } else {
        setVerified(body);
        setStatus({
          type: "success",
          message: "✓ Verified — you are signed in!",
        });
      }
    } catch (err: any) {
      setStatus({ type: "error", message: err?.message || String(err) });
    } finally {
      setVerifying(false);
    }
  }

  return (
    <main style={{ maxWidth: 560, margin: "48px auto", padding: 16 }}>
      <h1>Sign in with passwordless authentication</h1>
      <form onSubmit={sendMagicLink}>
        <p style={{ marginTop: 0 }}>
          Choose method:{" "}
          <label style={{ fontWeight: 600, marginLeft: 6 }}>
            <input
              type="radio"
              checked={mode === "code"}
              onChange={() => setMode("code")}
            />{" "}
            Email code (recommended)
          </label>
          <label style={{ fontWeight: 600, marginLeft: 12 }}>
            <input
              type="radio"
              checked={mode === "link"}
              onChange={() => setMode("link")}
            />{" "}
            Magic link
          </label>
        </p>

        {mode === "link" && (
          <div
            style={{
              padding: 12,
              background: "#fff3cd",
              border: "1px solid #ffc107",
              borderRadius: 6,
              marginBottom: 12,
              fontSize: 14,
            }}
          >
            ⚠️ Magic links may fail if opened in a different browser. Use "Email
            code" instead for better reliability.
          </div>
        )}

        <label style={{ display: "block", marginBottom: 8 }}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              padding: 8,
              marginTop: 6,
            }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: "8px 12px" }}
        >
          {loading
            ? "Sending…"
            : mode === "code"
            ? "Send code"
            : "Send magic link"}
        </button>
      </form>

      {mode === "code" && (
        <form onSubmit={verifyOtp} style={{ marginTop: 16 }}>
          <label style={{ display: "block", marginBottom: 8 }}>
            Code from email
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              style={{
                display: "block",
                width: "100%",
                padding: 8,
                marginTop: 6,
              }}
            />
          </label>
          <div>
            <button
              type="submit"
              disabled={verifying}
              style={{ padding: "8px 12px" }}
            >
              {verifying ? "Verifying…" : "Verify code"}
            </button>
          </div>
        </form>
      )}

      {verified && (
        <div
          style={{
            marginTop: 18,
            background: "#f6fffa",
            padding: 12,
            borderRadius: 6,
          }}
        >
          <strong>✓ Authentication successful!</strong>
          <pre style={{ whiteSpace: "pre-wrap", marginTop: 8, fontSize: 12 }}>
            {JSON.stringify(verified, null, 2)}
          </pre>
        </div>
      )}

      {status && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 6,
            color: status.type === "error" ? "#721c24" : "#155724",
            background: status.type === "error" ? "#f8d7da" : "#d4edda",
            border:
              status.type === "error"
                ? "1px solid #f5c6cb"
                : "1px solid #c3e6cb",
          }}
        >
          {status.message}
        </div>
      )}
    </main>
  );
}
