"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { LayoutGrid, BarChart3, Table2 } from "lucide-react";
import { Workspace } from "@/lib/types";

interface Widget {
  id: string;
  name: string;
  display_name: string;
  component_name: string;
  is_active: boolean;
  category: string;
  width: number;
  height: number;
}

type WidgetSize = "small" | "medium" | "large";

export default function DashboardSettingsPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const params = useParams();
  const workspaceId = params?.workspaceId as string;

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  const loadData = async () => {
    try {
      // Fetch workspace data
      const { data: workspaceData, error: workspaceError } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", workspaceId)
        .single();

      if (workspaceError) throw workspaceError;
      setWorkspace(workspaceData);

      // Fetch widgets - both global (workspace_id IS NULL) and workspace-specific
      const { data: widgetsData, error: widgetsError } = await supabase
        .from("widget_types")
        .select("*")
        .or(`workspace_id.is.null,workspace_id.eq.${workspaceId}`)
        .order("sort_order", { ascending: true });

      if (widgetsError) throw widgetsError;
      setWidgets(widgetsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWidget = async (widgetId: string, currentState: boolean) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("widget_types")
        .update({ is_active: !currentState })
        .eq("id", widgetId);

      if (error) throw error;

      // Update local state
      setWidgets(
        widgets.map((w) =>
          w.id === widgetId ? { ...w, is_active: !currentState } : w
        )
      );
    } catch (error) {
      console.error("Error updating widget:", error);
      alert("Failed to update widget");
    } finally {
      setSaving(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getWidgetSize = (width: number, height: number): WidgetSize => {
    if (width <= 3 && height === 1) return "small";
    if (width <= 6 && height === 2) return "medium";
    return "large";
  };

  const groupWidgetsBySize = () => {
    const grouped: Record<WidgetSize, Widget[]> = {
      small: [],
      medium: [],
      large: [],
    };

    widgets.forEach((widget) => {
      const size = getWidgetSize(widget.width, widget.height);
      grouped[size].push(widget);
    });

    return grouped;
  };

  const getSizeConfig = (size: WidgetSize) => {
    switch (size) {
      case "small":
        return {
          title: "Compact Widgets",
          description: "Quick stat cards and metrics at a glance",
          icon: LayoutGrid,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        };
      case "medium":
        return {
          title: "Chart Widgets",
          description: "Interactive charts and visualizations",
          icon: BarChart3,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
        };
      case "large":
        return {
          title: "Data Tables",
          description: "Detailed tables and comprehensive views",
          icon: Table2,
          color: "text-green-600",
          bgColor: "bg-green-50",
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const groupedWidgets = groupWidgetsBySize();
  const activeCount = widgets.filter((w) => w.is_active).length;
  const primaryColor = workspace?.theme_config?.primaryColor || "#3b82f6";

  return (
    <div className="space-y-6">
      <style jsx global>{`
        button[role="switch"][data-state="checked"] {
          background-color: ${primaryColor} !important;
        }
        button[role="switch"][data-state="unchecked"] {
          border: 1px solid #d1d5db !important;
        }
        button[role="switch"] span[data-state="checked"] {
          background-color: white !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
        }
        button[role="switch"] span[data-state="unchecked"] {
          background-color: white !important;
          border: 1px solid #d1d5db !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
        }
      `}</style>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Widgets
          </h1>
          <p className="text-gray-600 mt-1">
            Customize which widgets appear on your dashboard
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
          <div className="text-sm text-gray-600">Active widgets</div>
        </div>
      </div>

      <div className="grid gap-6">
        {(["small", "medium", "large"] as WidgetSize[]).map((size) => {
          const sizeWidgets = groupedWidgets[size];
          if (sizeWidgets.length === 0) return null;

          const config = getSizeConfig(size);
          const Icon = config.icon;
          const activeInSize = sizeWidgets.filter((w) => w.is_active).length;

          return (
            <Card key={size}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.bgColor}`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle>{config.title}</CardTitle>
                    <CardDescription>{config.description}</CardDescription>
                  </div>
                  <div className="text-sm text-gray-600">
                    {activeInSize} of {sizeWidgets.length} active
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {sizeWidgets.map((widget) => (
                    <div
                      key={widget.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        widget.is_active
                          ? "bg-white border-gray-200 shadow-sm"
                          : "bg-gray-50 border-gray-100 opacity-60"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">
                            {widget.display_name}
                          </h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {getCategoryLabel(widget.category)}
                          </span>
                        </div>
                      </div>
                      <Switch
                        checked={widget.is_active}
                        onCheckedChange={() =>
                          toggleWidget(widget.id, widget.is_active)
                        }
                        disabled={saving}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <p className="text-sm text-gray-600">
          Changes are saved automatically and will take effect immediately
        </p>
        <button
          onClick={() => router.push(`/${workspaceId}/dashboard`)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          View Dashboard
        </button>
      </div>
    </div>
  );
}
