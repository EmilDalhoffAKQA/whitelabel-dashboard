"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Workspace, WidgetType } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { getWidgetComponent } from "@/components/widgets";

export default function DashboardPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [widgets, setWidgets] = useState<WidgetType[]>([]);
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

      // Fetch widgets for this workspace
      // Get both global widgets (workspace_id IS NULL) and workspace-specific widgets
      const { data: widgetsData, error: widgetsError } = await supabase
        .from("widget_types")
        .select("*")
        .or(`workspace_id.is.null,workspace_id.eq.${workspaceId}`)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (widgetsError) {
        console.error("Widgets error:", widgetsError);
      } else {
        setWidgets(widgetsData || []);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      router.push("/workspaces");
    } finally {
      setLoading(false);
    }
  };

  const primaryColor = workspace?.theme_config?.primaryColor || "#3b82f6";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderBottomColor: primaryColor }}
        ></div>
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

      {/* Widget Grid - Uses width and height from database */}
      <div
        className="grid grid-cols-12 gap-4"
        style={{
          gridAutoFlow: "dense",
          gridAutoRows: "180px", // Base unit: small widget height
        }}
      >
        {widgets.length === 0 ? (
          <div className="col-span-12 text-center py-12">
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-500">
                  No widgets configured for this workspace.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Add widgets to the database to see them here.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          widgets.map((widget) => {
            const WidgetComponent = getWidgetComponent(widget.component_name);

            if (!WidgetComponent) {
              console.warn(
                `Widget component not found: ${widget.component_name}`
              );
              return null;
            }

            // Get primary color from workspace theme
            const primaryColor =
              workspace?.theme_config?.primaryColor || "#3b82f6";

            return (
              <div
                key={widget.id}
                className="h-full"
                style={{
                  gridColumn: `span ${widget.width} / span ${widget.width}`,
                  gridRow: `span ${widget.height} / span ${widget.height}`,
                }}
              >
                <WidgetComponent primaryColor={primaryColor} {...({} as any)} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
