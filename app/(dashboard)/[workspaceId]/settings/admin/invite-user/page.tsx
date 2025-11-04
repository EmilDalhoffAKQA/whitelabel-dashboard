"use client";
import { useState, useEffect } from "react";

export default function AdminInviteUserPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [role, setRole] = useState("analyst");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    // Get current workspace from cookie
    const ws = document.cookie
      .split("; ")
      .find((row) => row.startsWith("current_workspace="))
      ?.split("=")[1];
    if (ws) setWorkspaceId(decodeURIComponent(ws));
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    if (!workspaceId) {
      setStatus("No current workspace found. Please select a workspace first.");
      return;
    }
    const res = await fetch("/api/user/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, workspaceId, role }),
    });
    if (res.ok) {
      setStatus("User invited successfully!");
      setEmail("");
      setName("");
    } else {
      const err = await res.json();
      setStatus("Error: " + (err.error || "Unknown error"));
    }
  }

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "2rem auto",
        padding: 24,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 8px #0001",
      }}
    >
      <h2>Invite User</h2>
      <form onSubmit={handleInvite}>
        <label>
          Email
          <br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </label>
        <br />
        <br />
        <label>
          Name
          <br />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%" }}
          />
        </label>
        <br />
        <br />
        {/* Workspace ID is now set automatically from cookie */}
        <input type="hidden" value={workspaceId} />
        <label>
          Role
          <br />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ width: "100%" }}
          >
            <option value="analyst">Analyst</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <br />
        <br />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: 12,
            background: "#2563eb",
            color: "#fff",
            border: 0,
            borderRadius: 6,
          }}
        >
          Invite
        </button>
      </form>
      {status && <p style={{ marginTop: 16 }}>{status}</p>}
    </div>
  );
}
