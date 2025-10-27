"use client";

import { useState } from "react";

export default function Magic() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<null | {
    type: "success" | "error";
    message: string;
  }>(null);
  const [loading, setLoading] = useState(false);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    if (!email)
      return setStatus({ type: "error", message: "Please enter an email." });
    setLoading(true);
    try {
      const params = new URLSearchParams({ email });
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
            "Magic link sent (check your email).",
        });
      }
    } catch (err: any) {
      setStatus({ type: "error", message: err?.message || String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 560, margin: "48px auto", padding: 16 }}>
      <h1>Sign in with a magic link</h1>
      <form onSubmit={sendMagicLink}>
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
          {loading ? "Sending…" : "Send magic link"}
        </button>
      </form>

      {status && (
        <div
          style={{
            marginTop: 16,
            color: status.type === "error" ? "#a00" : "#080",
          }}
        >
          {status.message}
        </div>
      )}
    </main>
  );
}
