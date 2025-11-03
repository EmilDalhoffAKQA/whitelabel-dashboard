"use client";
import { useEffect, useState } from "react";

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkspaces() {
      setLoading(true);
      setError(null);
      try {
        // Fetch user info from cookie
        const userInfo = JSON.parse(
          decodeURIComponent(
            document.cookie
              .split("; ")
              .find((row) => row.startsWith("user_info="))
              ?.split("=")[1] || "{}"
          )
        );
        if (!userInfo?.email) {
          setError("Not logged in");
          setLoading(false);
          return;
        }
        // Fetch workspaces for this user
        const res = await fetch(
          `/api/user/${encodeURIComponent(userInfo.email)}/workspaces`
        );
        if (!res.ok) throw new Error("Failed to fetch workspaces");
        const data = await res.json();
        setWorkspaces(data.workspaces || []);
      } catch (e: any) {
        setError(e.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchWorkspaces();
  }, []);

  function handleSelectWorkspace(ws: any) {
    document.cookie = `current_workspace=${encodeURIComponent(
      ws.id
    )}; path=/; max-age=${60 * 60 * 24 * 7}`;
    window.location.href = `/admin/invite-user`;
  }

  function handleLogout() {
    // Remove cookies for testing
    document.cookie = "auth_token=; Max-Age=0; path=/";
    document.cookie = "user_info=; Max-Age=0; path=/";
    document.cookie = "current_workspace=; Max-Age=0; path=/";
    window.location.href = "/login";
  }

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        padding: 24,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 8px #0001",
      }}
    >
      <h2>Your Workspaces</h2>
      <button
        onClick={handleLogout}
        style={{
          float: "right",
          marginTop: -32,
          marginRight: -16,
          background: "#eee",
          border: 0,
          borderRadius: 6,
          padding: "6px 12px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && workspaces.length === 0 && (
        <p>No workspaces found.</p>
      )}
      <ul>
        {workspaces.map((ws) => (
          <li key={ws.id} style={{ margin: "1rem 0" }}>
            <strong>{ws.name}</strong> (role: {ws.role})
            <button
              style={{ marginLeft: 16 }}
              onClick={() => handleSelectWorkspace(ws)}
            >
              Select
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
