"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Workspace {
  id: number;
  name: string;
  logo_url: string | null;
  theme_config: {
    primaryColor: string;
    secondaryColor: string;
    logo: string;
    favicon: string;
  } | null;
}

export default function DashboardPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const workspaceId = params?.workspaceId as string;

  useEffect(() => {
    loadDashboard();
  }, [workspaceId]);

  const loadDashboard = async () => {
    try {
      // Fetch workspace data from Supabase
      const { data: workspaceData, error: workspaceError } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", workspaceId)
        .single();

      if (workspaceError || !workspaceData) {
        console.error("Workspace error:", workspaceError);
        router.push("/workspaces");
        return;
      }

      setWorkspace(workspaceData);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      router.push("/workspaces");
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

  if (!workspace) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Workspace not found
          </h2>
          <p className="text-gray-600 mb-4">
            The workspace you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.push("/workspaces")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Workspaces
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {workspace.name} Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Monitor your workspace performance and analytics
        </p>
      </div>

      {/* Widget Grid - Ready for modular cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Widgets will be added here */}
        <div className="col-span-full text-center py-12 text-gray-500">
          Dashboard widgets coming soon...
        </div>
      </div>
    </div>
  );
}
