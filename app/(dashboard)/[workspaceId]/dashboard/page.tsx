"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Workspace, WorkspaceWidgetLayout } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getWidgetComponent } from "@/components/widgets";
import GridLayout, { Layout, WidthProvider } from "react-grid-layout";
import {
  widgetsToLayout,
  layoutToUpdates,
  GRID_CONFIG,
  snapToGrid,
} from "@/lib/grid-utils";
import { syncWorkspaceWidgets } from "@/lib/sync-widgets";
import { Edit3, Save, X, Plus } from "lucide-react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(GridLayout);

export default function DashboardPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [widgets, setWidgets] = useState<WorkspaceWidgetLayout[]>([]);
  const [hiddenWidgets, setHiddenWidgets] = useState<WorkspaceWidgetLayout[]>(
    []
  );
  const [layout, setLayout] = useState<Layout[]>([]);
  const [originalLayout, setOriginalLayout] = useState<Layout[]>([]); // Track layout before drag
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
        .order("y_position", { ascending: true });

      if (widgetsError) {
        console.error("Widgets error:", widgetsError);
      } else {
        // Separate visible and hidden widgets
        const visible = widgetsData?.filter((w) => w.is_visible) || [];
        const hidden = widgetsData?.filter((w) => !w.is_visible) || [];

        setWidgets(visible);
        setHiddenWidgets(hidden);
        setLayout(widgetsToLayout(visible));
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      router.push("/workspaces");
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = () => {
    // Save current layout before drag starts
    setOriginalLayout([...layout]);
    console.log("🎯 Drag started, saved layout:", layout);
  };

  const handleDragStop = (
    currentLayout: Layout[],
    oldItem: Layout,
    newItem: Layout
  ) => {
    if (!isEditMode) return;

    console.log("🛑 Drag stopped");
    console.log("Old item:", oldItem);
    console.log("New item:", newItem);
    console.log("Original layout:", originalLayout);

    // Apply smart snapping based on widget width
    const snappedX = snapToGrid(newItem.x, newItem.w);

    // Ensure widget doesn't go beyond right edge
    const maxX = GRID_CONFIG.cols - newItem.w;
    const constrainedX = Math.max(0, Math.min(snappedX, maxX));
    const constrainedY = Math.max(0, newItem.y);

    console.log(`📍 Snapped position: (${constrainedX}, ${constrainedY})`);

    // Find ALL overlapping widgets
    const overlappingItems = originalLayout.filter((item) => {
      if (item.i === newItem.i) return false;

      // Check if the new position overlaps with this item's position
      const xOverlap =
        constrainedX < item.x + item.w && constrainedX + newItem.w > item.x;
      const yOverlap =
        constrainedY < item.y + item.h && constrainedY + newItem.h > item.y;

      return xOverlap && yOverlap;
    });

    console.log(`💥 Found ${overlappingItems.length} overlapping widgets`);

    // Find the closest overlapping widget (by center point distance)
    let overlappingItem = null;
    if (overlappingItems.length > 0) {
      const draggedCenterX = constrainedX + newItem.w / 2;
      const draggedCenterY = constrainedY + newItem.h / 2;

      overlappingItem = overlappingItems.reduce((closest, item) => {
        const itemCenterX = item.x + item.w / 2;
        const itemCenterY = item.y + item.h / 2;

        const distance = Math.sqrt(
          Math.pow(draggedCenterX - itemCenterX, 2) +
            Math.pow(draggedCenterY - itemCenterY, 2)
        );

        const closestCenterX = closest.x + closest.w / 2;
        const closestCenterY = closest.y + closest.h / 2;
        const closestDistance = Math.sqrt(
          Math.pow(draggedCenterX - closestCenterX, 2) +
            Math.pow(draggedCenterY - closestCenterY, 2)
        );

        return distance < closestDistance ? item : closest;
      });

      console.log(`🎯 Closest widget to swap with: ${overlappingItem.i}`, {
        draggedWidget: `(${constrainedX}, ${constrainedY}) size ${newItem.w}x${newItem.h}`,
        targetWidget: `(${overlappingItem.x}, ${overlappingItem.y}) size ${overlappingItem.w}x${overlappingItem.h}`,
      });

      // Check if widgets have the same width - only swap if they do
      const originalDraggedItem = originalLayout.find((i) => i.i === newItem.i);
      if (originalDraggedItem && originalDraggedItem.w !== overlappingItem.w) {
        console.log(
          `⚠️ Different widths detected (${originalDraggedItem.w} vs ${overlappingItem.w}) - cannot swap, will just place`
        );
        overlappingItem = null; // Don't swap if widths are different
      }
    }

    // Create new layout with swap or snap
    let newLayout;

    if (overlappingItem) {
      // SWAP: Both widgets exchange positions (only if same width)
      newLayout = originalLayout.map((item) => {
        if (item.i === newItem.i) {
          console.log(
            `🔄 SWAPPING: ${newItem.i} → (${overlappingItem.x}, ${overlappingItem.y})`
          );
          return {
            ...item,
            x: overlappingItem.x,
            y: overlappingItem.y,
            w: item.w,
            h: item.h,
          };
        } else if (item.i === overlappingItem.i) {
          const originalDraggedItem = originalLayout.find(
            (i) => i.i === newItem.i
          );
          console.log(
            `� SWAPPING: ${item.i} → (${originalDraggedItem?.x}, ${originalDraggedItem?.y})`
          );
          return {
            ...item,
            x: originalDraggedItem?.x || item.x,
            y: originalDraggedItem?.y || item.y,
            w: item.w,
            h: item.h,
          };
        }
        return item;
      });
    } else {
      // NO SWAP: Use react-grid-layout's automatic collision prevention
      console.log(`📌 NO SWAP: Using automatic layout with preventCollision`);

      // Just apply snapping and let react-grid-layout handle the rest
      newLayout = currentLayout.map((item) => {
        if (item.i === newItem.i) {
          // Apply snapping to the dragged item
          return {
            ...item,
            x: constrainedX,
            y: constrainedY,
          };
        }
        return item;
      });
    }

    console.log("✅ Final layout:", newLayout);
    setLayout(newLayout);
  };

  const handleLayoutChange = (newLayout: Layout[]) => {
    // Only update layout in non-edit mode or for initial load
    if (!isEditMode) {
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

  const handleRemoveWidget = async (widgetId: string | number) => {
    try {
      const { error } = await supabase
        .from("workspace_widget_layouts")
        .update({ is_visible: false })
        .eq("id", widgetId);

      if (error) throw error;

      const widgetToHide = widgets.find(
        (w) => w.id.toString() === widgetId.toString()
      );
      if (widgetToHide) {
        setWidgets(
          widgets.filter((w) => w.id.toString() !== widgetId.toString())
        );
        setHiddenWidgets([...hiddenWidgets, widgetToHide]);
        setLayout(layout.filter((l) => l.i !== widgetId.toString()));
      }
    } catch (error) {
      console.error("Error removing widget:", error);
    }
  };

  const handleAddWidget = async (widgetId: string | number) => {
    try {
      const { error } = await supabase
        .from("workspace_widget_layouts")
        .update({ is_visible: true })
        .eq("id", widgetId);

      if (error) throw error;
      await loadDashboard();
    } catch (error) {
      console.error("Error adding widget:", error);
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
              variant="default"
              size="default"
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Edit3 className="h-4 w-4" />
              Edit Layout
            </Button>
          ) : (
            <>
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                size="default"
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>

              {/* Add Widget Dropdown */}
              {hiddenWidgets.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="default" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Widget
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Available Widgets</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {hiddenWidgets.map((widget) => (
                      <DropdownMenuItem
                        key={widget.id}
                        onClick={() => handleAddWidget(widget.id)}
                        className="cursor-pointer"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        <span>{widget.widget_type?.display_name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button
                onClick={handleSaveLayout}
                disabled={isSaving}
                variant="default"
                size="default"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
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
            compactType="vertical"
            preventCollision={false}
            onLayoutChange={handleLayoutChange}
            onDragStart={handleDragStart}
            onDragStop={handleDragStop}
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
                  {/* Remove Button - minimal X icon (only visible in edit mode) */}
                  {isEditMode && (
                    <button
                      onClick={() => handleRemoveWidget(widget.id)}
                      className="absolute top-2 right-2 z-20 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
                      title="Remove widget"
                      aria-label="Remove widget"
                    >
                      <X className="h-4 w-4 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200" />
                    </button>
                  )}

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

      {/* Add Widget Section (only visible in edit mode) */}
      {isEditMode && hiddenWidgets.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Add Widgets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {hiddenWidgets.map((widget) => (
              <Card
                key={widget.id}
                className="hover:shadow-lg transition-all cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400"
                onClick={() => handleAddWidget(widget.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {widget.widget_type?.display_name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">Click to add</p>
                    </div>
                    <div className="ml-3 bg-primary/10 text-primary rounded-full p-2">
                      <Plus className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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

        /* Visual grid snap indicators */
        .edit-mode .react-grid-layout::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: repeating-linear-gradient(
            to right,
            transparent,
            transparent calc(100% / 12 - 1px),
            rgba(59, 130, 246, 0.1) calc(100% / 12 - 1px),
            rgba(59, 130, 246, 0.1) calc(100% / 12)
          );
          pointer-events: none;
          z-index: 0;
        }

        /* Highlight major snap points (3-column intervals) */
        .edit-mode .react-grid-layout::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: repeating-linear-gradient(
            to right,
            transparent,
            transparent calc(100% / 4 - 2px),
            rgba(59, 130, 246, 0.2) calc(100% / 4 - 2px),
            rgba(59, 130, 246, 0.2) calc(100% / 4)
          );
          pointer-events: none;
          z-index: 0;
        }

        .edit-mode .react-grid-item {
          z-index: 1;
        }

        .react-grid-item.react-draggable-dragging {
          z-index: 100 !important;
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
