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
import { Badge } from "@/components/ui/badge";
import {
  LayoutGrid,
  TrendingUp,
  Clock,
  Users,
  MessageSquare,
  Star,
  BarChart3,
  PieChart,
  Activity,
  Target,
  ThumbsUp,
  CheckCircle2,
  Zap,
  Plus,
} from "lucide-react";
import { Workspace } from "@/lib/types";

interface WidgetType {
  id: string;
  display_name: string;
  component_name: string;
  category: string;
  width: number;
  height: number;
  description?: string;
}

interface WorkspaceWidget {
  id: string;
  widget_type_id: string;
  is_visible: boolean;
  widget_type?: WidgetType;
}

// Widget metadata with descriptions
const widgetDescriptions: Record<
  string,
  { description: string; icon: any; useCase: string }
> = {
  TotalConversationsWidget: {
    description: "Track the total number of customer conversations over time",
    icon: MessageSquare,
    useCase: "Monitor overall chat volume and identify busy periods",
  },
  ActiveUsersTodayWidget: {
    description: "See how many users are currently active on your platform",
    icon: Users,
    useCase: "Real-time monitoring of concurrent user activity",
  },
  AverageResponseTimeWidget: {
    description:
      "Monitor your team's average response time to customer messages",
    icon: Clock,
    useCase: "Ensure quick responses and improve customer satisfaction",
  },
  ResolutionRateWidget: {
    description: "Percentage of conversations successfully resolved",
    icon: CheckCircle2,
    useCase: "Track team effectiveness in solving customer issues",
  },
  NPSScoreWidget: {
    description:
      "Net Promoter Score - measure customer loyalty and satisfaction",
    icon: Star,
    useCase: "Gauge overall customer sentiment and brand advocacy",
  },
  CustomerSentimentWidget: {
    description: "Analyze customer emotions across all conversations",
    icon: ThumbsUp,
    useCase: "Identify trends in customer satisfaction and pain points",
  },
  ConversationVolumeWidget: {
    description: "Visual timeline of conversation volume over the last 7 days",
    icon: TrendingUp,
    useCase: "Spot trends and plan resource allocation",
  },
  ResponseTimeTrendWidget: {
    description: "Track how response times change over time",
    icon: Activity,
    useCase: "Monitor service quality improvements or degradation",
  },
  SatisfactionTrendWidget: {
    description: "Customer satisfaction scores tracked over time",
    icon: BarChart3,
    useCase: "Measure the impact of service improvements",
  },
  ChannelDistributionWidget: {
    description:
      "See which channels customers prefer (chat, email, phone, etc.)",
    icon: PieChart,
    useCase: "Allocate resources to the right communication channels",
  },
  AgentPerformanceWidget: {
    description: "Compare individual agent metrics and performance",
    icon: Target,
    useCase: "Identify top performers and coaching opportunities",
  },
  PeakHoursWidget: {
    description: "Identify the busiest hours for customer support",
    icon: Zap,
    useCase: "Optimize staffing schedules based on demand",
  },
  LongConversationsWidget: {
    description: "Track conversations exceeding 5+ messages",
    icon: MessageSquare,
    useCase: "Identify complex issues requiring special attention",
  },
  RecentConversationsWidget: {
    description: "Browse the most recent customer interactions",
    icon: LayoutGrid,
    useCase: "Quick access to ongoing conversations",
  },
};

const getSizeLabel = (width: number, height: number): string => {
  if (width <= 3) return "Small";
  if (width <= 6) return "Medium";
  return "Large";
};

const getSizeColor = (width: number): string => {
  if (width <= 3) return "bg-blue-100 text-blue-700";
  if (width <= 6) return "bg-purple-100 text-purple-700";
  return "bg-pink-100 text-pink-700";
};

export default function DashboardSettingsPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaceWidgets, setWorkspaceWidgets] = useState<WorkspaceWidget[]>(
    []
  );
  const [loading, setLoading] = useState(true);
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

      if (workspaceError || !workspaceData) {
        router.push("/workspaces");
        return;
      }

      setWorkspace(workspaceData);

      // Fetch workspace widgets with their types
      const { data: widgetsData, error: widgetsError } = await supabase
        .from("workspace_widget_layouts")
        .select(
          `
          id,
          widget_type_id,
          is_visible,
          widget_type:widget_types(
            id,
            display_name,
            component_name,
            category,
            width,
            height
          )
        `
        )
        .eq("workspace_id", workspaceId)
        .order("widget_type(display_name)", { ascending: true });

      if (!widgetsError && widgetsData) {
        setWorkspaceWidgets(widgetsData as any);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const primaryColor = workspace?.theme_config?.primaryColor || "#3b82f6";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 mb-4">Workspace not found</p>
        <button
          onClick={() => router.push("/workspaces")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Workspaces
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Widget Library</h1>
        <p className="text-gray-600 mt-2">
          Browse available analytics widgets and their capabilities
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Widgets
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {workspaceWidgets.length}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: `${primaryColor}10`,
                  color: primaryColor,
                }}
              >
                <LayoutGrid className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Currently Active
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: primaryColor }}
                >
                  {workspaceWidgets.filter((w) => w.is_visible).length}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: `${primaryColor}10`,
                  color: primaryColor,
                }}
              >
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Available to Add
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {workspaceWidgets.filter((w) => !w.is_visible).length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-100">
                <Plus className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {workspaceWidgets.map((widget) => {
          const widgetType = widget.widget_type;
          if (!widgetType) return null;

          const metadata = widgetDescriptions[widgetType.component_name] || {
            description: "Analytics widget for monitoring key metrics",
            icon: BarChart3,
            useCase: "Track important business metrics",
          };

          const IconComponent = metadata.icon;
          const sizeLabel = getSizeLabel(widgetType.width, widgetType.height);
          const sizeColor = getSizeColor(widgetType.width);

          return (
            <Card
              key={widget.id}
              className={`relative transition-all hover:shadow-md ${
                widget.is_visible
                  ? "border-gray-200"
                  : "border-gray-100 bg-gray-50/50"
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="p-2.5 rounded-lg"
                    style={{
                      backgroundColor: `${primaryColor}10`,
                      color: primaryColor,
                    }}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>
                  {widget.is_visible ? (
                    <Badge
                      className="text-xs font-medium"
                      style={{
                        backgroundColor: `${primaryColor}15`,
                        color: primaryColor,
                        border: `1px solid ${primaryColor}30`,
                      }}
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-xs font-medium text-gray-500 border-gray-200"
                    >
                      Available
                    </Badge>
                  )}
                </div>

                <CardTitle className="text-base font-semibold text-gray-900 mb-2">
                  {widgetType.display_name}
                </CardTitle>

                <div className="flex gap-2">
                  <Badge
                    variant="secondary"
                    className={`text-xs ${sizeColor} border-0`}
                  >
                    {sizeLabel}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="text-xs bg-gray-100 text-gray-600 border-0"
                  >
                    {widgetType.category}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {metadata.description}
                </p>

                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">{metadata.useCase}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
