"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Workspace, WorkspaceWidgetLayout } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getWidgetComponent } from "@/components/widgets";
import GridLayout, { Layout, WidthProvider } from "react-grid-layout";
import {
  widgetsToLayout,
  layoutToUpdates,
  GRID_CONFIG,
} from "@/lib/grid-utils";
import { syncWorkspaceWidgets } from "@/lib/sync-widgets";
import { Edit3, Save, X } from "lucide-react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(GridLayout);

export default function DashboardPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [widgets, setWidgets] = useState<WorkspaceWidgetLayout[]>([]);
  const [layout, setLayout] = useState<Layout[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
        router.push("/workspaces");
        return;
      }

      setWorkspace(workspaceData);

      // Sync widgets to ensure new widgets are added
      await syncWorkspaceWidgets(parseInt(workspaceId));

      // Fetch widget layouts for this workspace
      const { data: widgetsData, error: widgetsError } = await supabase
        .from("workspace_widget_layouts")
        .select(
          `
          *,
          widget_type:widget_types(*)
        `
        )
        .eq("workspace_id", workspaceId)
        .eq("is_visible", true)
        .order("y_position", { ascending: true });

      if (widgetsError) {
        console.error("Widgets error:", widgetsError);
      } else {
        setWidgets(widgetsData || []);
        setLayout(widgetsToLayout(widgetsData || []));
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      router.push("/workspaces");
    } finally {
      setLoading(false);
    }
  };

  const handleLayoutChange = (newLayout: Layout[]) => {
    if (isEditMode) {
      setLayout(newLayout);
    }
  };

  const handleSaveLayout = async () => {
    setIsSaving(true);
    try {
      const updates = layoutToUpdates(layout);

      const response = await fetch("/api/widgets/layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: parseInt(workspaceId),
          layouts: updates,
        }),
      });

      if (!response.ok) throw new Error("Failed to save layout");

      // Reload to get fresh data
      await loadDashboard();
      setIsEditMode(false);
    } catch (error) {
      console.error("Error saving layout:", error);
      alert("Failed to save layout. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset layout to original
    setLayout(widgetsToLayout(widgets));
    setIsEditMode(false);
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
      {/* Header with Edit Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {workspace.name} Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor your workspace performance and analytics
          </p>
        </div>

        {/* Edit Mode Toggle */}
        <div className="flex gap-2">
          {!isEditMode ? (
            <Button
              onClick={() => setIsEditMode(true)}
              variant="outline"
              className="gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Edit Layout
            </Button>
          ) : (
            <>
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveLayout}
                disabled={isSaving}
                className="gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Layout"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Widget Grid with React-Grid-Layout */}
      {widgets.length === 0 ? (
        <div className="col-span-12 text-center py-12">
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500">
                No widgets configured for this workspace.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Enable widgets in settings to see them here.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className={isEditMode ? "edit-mode" : ""}>
          <ResponsiveGridLayout
            className="layout"
            layout={layout}
            cols={GRID_CONFIG.cols}
            rowHeight={GRID_CONFIG.rowHeight}
            margin={GRID_CONFIG.margin}
            containerPadding={GRID_CONFIG.containerPadding}
            compactType={GRID_CONFIG.compactType}
            onLayoutChange={handleLayoutChange}
            isDraggable={isEditMode}
            isResizable={isEditMode}
            draggableHandle=".drag-handle"
          >
            {widgets.map((widget) => {
              const WidgetComponent = getWidgetComponent(
                widget.widget_type?.component_name || ""
              );

              if (!WidgetComponent || !widget.widget_type) {
                return null;
              }

              return (
                <div key={widget.id} className="widget-container">
                  {/* Drag Handle (only visible in edit mode) */}
                  {isEditMode && (
                    <div
                      className="drag-handle absolute top-0 left-0 right-0 h-8 cursor-move bg-blue-500/10 border-2 border-blue-500 border-dashed rounded-t-lg flex items-center justify-center z-10"
                      style={{ borderColor: primaryColor }}
                    >
                      <span
                        className="text-xs font-medium"
                        style={{ color: primaryColor }}
                      >
                        Drag to move
                      </span>
                    </div>
                  )}

                  {/* Your existing widget - styling stays exactly the same! */}
                  <div className={isEditMode ? "pt-8 h-full" : "h-full"}>
                    <WidgetComponent
                      primaryColor={primaryColor}
                      {...({} as any)}
                    />
                  </div>
                </div>
              );
            })}
          </ResponsiveGridLayout>
        </div>
      )}

      <style jsx global>{`
        /* Minimal styles to make RGL work with your existing design */
        .react-grid-layout {
          position: relative;
        }

        .react-grid-item {
          transition: all 200ms ease;
          transition-property: left, top;
          box-sizing: border-box;
        }

        .react-grid-item.cssTransforms {
          transition-property: transform;
        }

        .react-grid-item.resizing {
          transition: none;
          z-index: 100;
        }

        .react-grid-item.react-draggable-dragging {
          transition: none;
          z-index: 100;
        }

        .widget-container {
          height: 100%;
          width: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .widget-container > div:last-child {
          height: 100%;
          width: 100%;
          flex: 1;
          min-height: 0;
        }

        /* Ensure widget cards take full height */
        .widget-container .h-full,
        .widget-container > div > * {
          height: 100%;
        }

        /* Edit mode visual indicator */
        .edit-mode .react-grid-item {
          border: 2px dashed transparent;
          border-radius: 0.5rem;
        }

        .edit-mode .react-grid-item:hover {
          border-color: ${primaryColor};
          background: rgba(59, 130, 246, 0.05);
        }

        .drag-handle {
          opacity: 0;
          transition: opacity 200ms;
        }

        .edit-mode .react-grid-item:hover .drag-handle {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
