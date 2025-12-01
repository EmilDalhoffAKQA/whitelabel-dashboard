// app/(dashboard)/[workspaceId]/dashboard/page.tsx
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getWidgetComponent } from "@/components/widgets";
import GridLayout, { Layout, WidthProvider } from "react-grid-layout";
import {
  widgetsToLayout,
  layoutToUpdates,
  GRID_CONFIG,
  snapToGrid,
} from "@/lib/grid-utils";
import { syncWorkspaceWidgets } from "@/lib/sync-widgets";
import { SquarePen, Save, X, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const [originalLayout, setOriginalLayout] = useState<Layout[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const workspaceId = params?.workspaceId as string;
  const isMobile = useIsMobile();
  const [rowHeight, setRowHeight] = useState<number>(GRID_CONFIG.rowHeight);

  useEffect(() => {
    loadDashboard();
  }, [workspaceId]);

  // Adjust rowHeight responsively so medium/tablet view shows more widgets
  useEffect(() => {
    function updateRowHeight() {
      const w = window.innerWidth;
      // mobile uses stacked layout, tablets/small desktops use a smaller row height
      if (w < 1024 && w >= 768) {
        setRowHeight(120); // medium/tablet: reduce height to fit more
      } else if (w < 768) {
        setRowHeight(100); // small screens (shouldn't reach here for grid but keep safe)
      } else {
        setRowHeight(GRID_CONFIG.rowHeight);
      }
    }

    updateRowHeight();
    window.addEventListener("resize", updateRowHeight);
    return () => window.removeEventListener("resize", updateRowHeight);
  }, []);

  const loadDashboard = async () => {
    try {
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
      await syncWorkspaceWidgets(parseInt(workspaceId));

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

      if (!widgetsError && widgetsData) {
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
    setOriginalLayout([...layout]);
  };

  const handleDragStop = (
    currentLayout: Layout[],
    oldItem: Layout,
    newItem: Layout
  ) => {
    if (!isEditMode) return;

    const snappedX = snapToGrid(newItem.x, newItem.w);
    const maxX = GRID_CONFIG.cols - newItem.w;
    const constrainedX = Math.max(0, Math.min(snappedX, maxX));
    const constrainedY = Math.max(0, newItem.y);

    const overlappingItems = originalLayout.filter((item) => {
      if (item.i === newItem.i) return false;
      const xOverlap =
        constrainedX < item.x + item.w && constrainedX + newItem.w > item.x;
      const yOverlap =
        constrainedY < item.y + item.h && constrainedY + newItem.h > item.y;
      return xOverlap && yOverlap;
    });

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

      const originalDraggedItem = originalLayout.find((i) => i.i === newItem.i);
      if (originalDraggedItem && originalDraggedItem.w !== overlappingItem.w) {
        overlappingItem = null;
      }
    }

    let newLayout;
    if (overlappingItem) {
      newLayout = originalLayout.map((item) => {
        if (item.i === newItem.i) {
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
      newLayout = currentLayout.map((item) => {
        if (item.i === newItem.i) {
          return { ...item, x: constrainedX, y: constrainedY };
        }
        return item;
      });
    }

    setLayout(newLayout);
  };

  const handleLayoutChange = (newLayout: Layout[]) => {
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
        />
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
          <Button onClick={() => router.push("/workspaces")}>
            Go to Workspaces
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      {/* Mobile-optimized Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">
            {workspace.name} Dashboard
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Monitor your workspace performance and analytics
          </p>
        </div>

        <div className="hidden sm:flex gap-2 flex-shrink-0">
          {!isEditMode ? (
            <Button
              onClick={() => setIsEditMode(true)}
              variant="dashboard"
              size="default"
              className="gap-2"
            >
              <SquarePen className="h-4 w-4" />
              <span className="hidden md:inline">Edit layout</span>
            </Button>
          ) : (
            <>
              <Button
                onClick={handleCancelEdit}
                variant="cancel"
                size="default"
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>

              {hiddenWidgets.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="dashboard"
                      size="default"
                      className="gap-2"
                    >
                      <Plus className="h-3 w-3" />
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
                variant="dashboard"
                size="default"
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </>
          )}
        </div>

        {/* Mobile Edit Controls - Sheet */}
        <div className="sm:hidden">
          {!isEditMode ? (
            <Button
              onClick={() => setIsEditMode(true)}
              variant="dashboard"
              className="w-full gap-2"
            >
              <SquarePen className="h-4 w-4" />
              Edit layout
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleCancelEdit}
                variant="cancel"
                className="flex-1 gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>

              {hiddenWidgets.length > 0 && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="dashboard" className="flex-1 gap-2">
                      <Plus className="h-3 w-3" />
                      Add
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[80vh]">
                    <div className="space-y-4 py-4">
                      <h3 className="text-lg font-semibold">
                        Available Widgets
                      </h3>
                      <div className="space-y-2">
                        {hiddenWidgets.map((widget) => (
                          <Button
                            key={widget.id}
                            onClick={() => handleAddWidget(widget.id)}
                            variant="dashboard"
                            className="w-full justify-start gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            {widget.widget_type?.display_name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              )}

              <Button
                onClick={handleSaveLayout}
                disabled={isSaving}
                variant="dashboard"
                className="flex-1 gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "..." : "Save"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Widget Grid */}
      {widgets.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-gray-500">
              No widgets configured for this workspace.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Enable widgets in settings to see them here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={isEditMode ? "edit-mode" : ""}>
          {isMobile ? (
            // Mobile: Stack widgets vertically (no dragging)
            <div className="space-y-4">
              {widgets.map((widget) => {
                const WidgetComponent = getWidgetComponent(
                  widget.widget_type?.component_name || ""
                );

                if (!WidgetComponent || !widget.widget_type) return null;

                return (
                  <div key={widget.id} className="widget-container-mobile">
                    {isEditMode && (
                      <button
                        onClick={() => handleRemoveWidget(widget.id)}
                        className="absolute top-2 right-2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
                        title="Remove widget"
                      >
                        <X className="h-4 w-4 text-gray-600" />
                      </button>
                    )}
                    <WidgetComponent
                      primaryColor={primaryColor}
                      {...({} as any)}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            // Desktop/Tablet: Use grid layout
            <ResponsiveGridLayout
              className="layout"
              layout={layout}
              cols={GRID_CONFIG.cols}
              rowHeight={rowHeight}
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

                if (!WidgetComponent || !widget.widget_type) return null;

                return (
                  <div key={widget.id} className="widget-container">
                    {isEditMode && (
                      <>
                        <button
                          onClick={() => handleRemoveWidget(widget.id)}
                          className="absolute top-2 right-2 z-20 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
                          title="Remove widget"
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </button>
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
                      </>
                    )}
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
          )}
        </div>
      )}

      <style jsx global>{`
        /* Mobile widget styles: ensure chart widgets have space to render
        - override child .h-full so cards don't collapse when parent has no height
        - provide a modest min-height so Recharts' ResponsiveContainer has room */
        .widget-container-mobile {
          position: relative;
          min-height: 0;
        }

        /* When stacked on mobile, allow the inner card to size to content and give charts room */
        .widget-container-mobile > * {
          height: auto !important;
          min-height: 140px; /* small sensible height for chart widgets on mobile */
        }

        /* Ensure the card content area (where charts mount) has a min-height so
           ResponsiveContainer with height=\"100%\" can calculate sizes reliably */
        .widget-container-mobile [data-slot="card-content"] {
          min-height: 120px;
          height: auto !important;
        }
        /* Desktop/Tablet grid styles */
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

        .widget-container .h-full,
        .widget-container > div > * {
          height: 100%;
        }

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

        /* Tablet adjustments */
        @media (min-width: 768px) and (max-width: 1024px) {
          .react-grid-layout {
            margin: 0 -8px;
          }
        }

        /* Mobile: hide grid visuals */
        @media (max-width: 767px) {
          .react-grid-layout::before,
          .react-grid-layout::after {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
