"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Plus } from "lucide-react";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface Workspace {
  theme_config: {
    primaryColor: string;
    secondaryColor: string;
  } | null;
}

export default function UsersPage() {
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteStatus(null);

    try {
      const res = await fetch("/api/user/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteForm.email,
          name: inviteForm.name,
          workspaceId: workspaceId,
          role: inviteForm.role,
        }),
      });

      if (res.ok) {
        setInviteStatus(
          "User invited successfully! They will receive an email."
        );
        setInviteForm({ email: "", name: "", role: "editor" });
        setShowInvite(false);
        loadData(); // Refresh the list
      } else {
        const err = await res.json();
        setInviteStatus("Error: " + (err.error || "Unknown error"));
      }
    } catch (error) {
      setInviteStatus("Error sending invite");
    } finally {
      setInviteLoading(false);
    }
  };
  const params = useParams();
  const workspaceId = params?.workspaceId as string;
  const [users, setUsers] = useState<User[]>([]);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    name: "",
    role: "editor",
  });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  const loadData = async () => {
    try {
      // Fetch workspace theme
      const { data: workspaceData } = await supabase
        .from("workspaces")
        .select("theme_config")
        .eq("id", workspaceId)
        .single();

      if (workspaceData) {
        setWorkspace(workspaceData);
      }

      // Fetch users in this workspace
      const { data: userWorkspaces, error } = await supabase
        .from("user_workspaces")
        .select(
          `
          role,
          users (
            id,
            email,
            name
          )
        `
        )
        .eq("workspace_id", workspaceId);

      if (error) throw error;

      const formattedUsers =
        userWorkspaces?.map((uw: any) => ({
          id: uw.users.id,
          email: uw.users.email,
          name: uw.users.name,
          role: uw.role,
        })) || [];

      setUsers(formattedUsers);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const primaryColor = workspace?.theme_config?.primaryColor || "#3B82F6";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">
            Manage workspace members and their permissions
          </p>
        </div>
        <Button
          onClick={() => setShowInvite(!showInvite)}
          className="text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* Status Message */}
      {inviteStatus && (
        <div
          className={`p-4 rounded-xl ${
            inviteStatus.includes("Error")
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          {inviteStatus}
        </div>
      )}

      {/* Invite Form */}
      {showInvite && (
        <Card>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input
                    value={inviteForm.name}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, name: e.target.value })
                    }
                    placeholder="Your Full Name"
                    required
                    className="border border-gray-200 rounded-lg focus:ring-2  focus:b
                     px-3 py-2 bg-white text-gray-900 placeholder-gray-400 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, email: e.target.value })
                    }
                    placeholder="Your Email Address"
                    required
                    className="border border-gray-200 rounded-lg focus:ring-2 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 shadow-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <div className="relative">
                  <select
                    value={inviteForm.role}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, role: e.target.value })
                    }
                    className="w-full appearance-none px-3 py-2 border border-gray-200 rounded-lg focus:ring-2  bg-white text-gray-900 shadow-sm pr-10 focus:outline-none"
                    style={{ boxShadow: "none" }}
                  >
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={inviteLoading}
                  className={`gap-2 rounded-lg px-4 py-2 font-medium shadow-sm border border-gray-200 ${
                    inviteLoading
                      ? "bg-blue-300"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white`}
                  style={{
                    backgroundColor: inviteLoading ? "#93c5fd" : primaryColor,
                  }}
                >
                  {inviteLoading ? "Sending..." : "Send Invitation"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 rounded-lg px-4 py-2 font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-900"
                  onClick={() => setShowInvite(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Members ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: `${primaryColor}20`,
                    }}
                  >
                    <span
                      className="font-semibold"
                      style={{ color: primaryColor }}
                    >
                      {user.name?.[0] || user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor:
                        user.role === "admin" ? "#F3E8FF" : `${primaryColor}20`,
                      color: user.role === "admin" ? "#7C3AED" : primaryColor,
                    }}
                  >
                    {user.role}
                  </span>
                  {/* Uncomment if you want delete functionality
                  <button className="text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  */}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
