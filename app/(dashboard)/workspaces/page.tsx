"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Building2,
  ChevronRight,
  LogOut,
  Loader2,
  Trash2,
  Shield,
} from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  role: string;
  logo_url?: string;
}

export default function WorkspacesPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Workspace | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  async function fetchWorkspaces() {
    setLoading(true);
    setError(null);
    try {
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
        router.push("/login");
        return;
      }

      setUserEmail(userInfo.email);

      // Try fetching as superadmin first
      const superadminRes = await fetch(`/api/workspaces`);

      if (superadminRes.ok) {
        // User is superadmin
        const data = await superadminRes.json();
        setIsSuperadmin(true);
        setWorkspaces(
          (data.workspaces || []).map((ws: any) => ({
            id: ws.id.toString(),
            name: ws.name,
            role: "admin",
            logo_url: ws.logo_url,
          }))
        );
      } else {
        // Regular user
        const res = await fetch(
          `/api/user/${encodeURIComponent(userInfo.email)}/workspaces`
        );
        if (!res.ok) throw new Error("Failed to fetch workspaces");

        const data = await res.json();
        setWorkspaces(data.workspaces || []);
      }
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectWorkspace(ws: Workspace) {
    document.cookie = `current_workspace=${encodeURIComponent(
      ws.id
    )}; path=/; max-age=${60 * 60 * 24 * 7}`;
    router.push(`/${ws.id}/dashboard`);
  }

  async function handleDeleteWorkspace(ws: Workspace) {
    setDeleting(true);
    try {
      const response = await fetch("/api/workspaces", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: parseInt(ws.id) }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete workspace");
      }

      // Remove from list
      setWorkspaces(workspaces.filter((w) => w.id !== ws.id));
      setDeleteTarget(null);
    } catch (error: any) {
      console.error("Delete error:", error);
      alert(`Failed to delete workspace: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  }

  function handleLogout() {
    window.location.href = "/api/auth/logout";
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "editor":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading your workspaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {isSuperadmin ? "All Workspaces" : "Your Workspaces"}
              </h1>
              <p className="text-gray-600 mt-2">
                {isSuperadmin
                  ? "Manage all workspaces across the platform"
                  : "Select a workspace to continue"}
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="dashboard"
              size="default"
              className="gap-2 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>

          {userEmail && (
            <div className="flex items-center gap-2 mt-4">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                {userEmail[0].toUpperCase()}
              </div>
              <span className="text-sm text-gray-600">{userEmail}</span>
              {isSuperadmin && (
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Superadmin
                </Badge>
              )}
            </div>
          )}
        </div>

        <Separator className="mb-8" />

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700">
                <div className="h-2 w-2 rounded-full bg-red-600" />
                <p className="font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!error && workspaces.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    No workspaces found
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isSuperadmin
                      ? "No workspaces have been created yet."
                      : "You haven't been added to any workspaces yet."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workspaces Grid */}
        {workspaces.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workspaces.map((ws) => (
              <Card
                key={ws.id}
                className="group hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-blue-300"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm overflow-hidden">
                        {ws.logo_url ? (
                          <img
                            src={ws.logo_url}
                            alt={ws.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{ws.name[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {ws.name}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className={`mt-1.5 text-xs ${getRoleBadgeColor(
                            ws.role
                          )}`}
                        >
                          {ws.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSelectWorkspace(ws)}
                      className="flex-1 gap-2 cursor-pointer"
                      size="sm"
                    >
                      Open Workspace
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    {isSuperadmin && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(ws);
                        }}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer Info */}
        {workspaces.length > 0 && (
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    {workspaces.length} Workspace
                    {workspaces.length !== 1 ? "s" : ""} Available
                  </h4>
                  <p className="text-sm text-gray-600">
                    {isSuperadmin
                      ? "As a superadmin, you can access and manage all workspaces."
                      : "Your role determines what actions you can perform in each workspace."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <div>
                  Are you sure you want to permanently delete this workspace?
                </div>
                <div className="text-red-600 font-medium">
                  This will delete all data including:
                </div>
                <ul className="list-disc list-inside text-sm text-red-600">
                  <li>All users and memberships</li>
                  <li>All markets</li>
                  <li>All conversations and analytics</li>
                </ul>
                <div className="font-bold text-red-600">
                  This action cannot be undone!
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteTarget && handleDeleteWorkspace(deleteTarget)
              }
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white gap-1"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Workspace
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
