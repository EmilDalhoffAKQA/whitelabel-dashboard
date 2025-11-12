"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface DashboardMetrics {
  totalConversations: number;
  avgSatisfaction: number;
  avgResponseTime: number;
  activeUsers: number;
  conversationTrend: Array<{ date: string; count: number }>;
  topIntents: Array<{ intent: string; count: number; percentage: number }>;
  recentActivity: Array<{
    id: string;
    user: string;
    message: string;
    timestamp: string;
    status: "completed" | "failed" | "pending";
  }>;
}

// Generate consistent mock data based on workspace ID
function generateMockMetrics(workspaceId: number): DashboardMetrics {
  // Use workspace ID as seed for consistent data
  const seed = workspaceId * 1000;
  const random = (min: number, max: number, offset: number = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
  };

  // Generate conversation trend for last 7 days
  const conversationTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      count: random(80, 200, i * 10),
    };
  });

  const totalConversations = conversationTrend.reduce(
    (sum, day) => sum + day.count,
    0
  );

  // Top intents
  const intents = [
    "Product Information",
    "Order Status",
    "Technical Support",
    "Pricing Inquiry",
    "Account Management",
  ];
  const topIntents = intents.map((intent, i) => {
    const count = random(50, 300, i * 20);
    return { intent, count, percentage: 0 };
  });
  const totalIntents = topIntents.reduce((sum, item) => sum + item.count, 0);
  topIntents.forEach((item) => {
    item.percentage = Math.round((item.count / totalIntents) * 100);
  });
  topIntents.sort((a, b) => b.count - a.count);

  // Recent activity
  const activities = [
    "How do I reset my password?",
    "What are your business hours?",
    "I need help with my order #12345",
    "Can you explain your pricing plans?",
    "Technical issue with login",
    "Request product demo",
    "Billing question about invoice",
    "Feature request: Dark mode",
  ];
  const recentActivity = Array.from({ length: 6 }, (_, i) => ({
    id: `act-${workspaceId}-${i}`,
    user: `User ${random(1000, 9999, i * 5)}`,
    message: activities[random(0, activities.length - 1, i * 7)],
    timestamp: `${random(1, 45, i * 3)}m ago`,
    status: (["completed", "completed", "completed", "pending", "failed"][
      random(0, 4, i * 11)
    ] || "completed") as "completed" | "failed" | "pending",
  }));

  return {
    totalConversations,
    avgSatisfaction: random(35, 48, 100) / 10, // 3.5 - 4.8
    avgResponseTime: random(8, 25, 200) / 10, // 0.8s - 2.5s
    activeUsers: random(450, 850, 300),
    conversationTrend,
    topIntents,
    recentActivity,
  };
}

export default function DashboardPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
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

      // Generate mock metrics based on workspace ID
      const mockMetrics = generateMockMetrics(parseInt(workspaceId));
      setMetrics(mockMetrics);
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

  if (!workspace || !metrics) {
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

  const primaryColor = workspace.theme_config?.primaryColor || "#3B82F6";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {workspace.name} Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Monitor your chatbot performance and user interactions
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: primaryColor }}>
              {metrics.totalConversations.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg. Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div
                className="text-3xl font-bold"
                style={{ color: primaryColor }}
              >
                {metrics.avgSatisfaction.toFixed(1)}
              </div>
              <div className="text-lg text-gray-400">/ 5.0</div>
            </div>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 5 }, (_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(metrics.avgSatisfaction)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg. Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div
                className="text-3xl font-bold"
                style={{ color: primaryColor }}
              >
                {metrics.avgResponseTime.toFixed(1)}
              </div>
              <div className="text-lg text-gray-400">sec</div>
            </div>
            <p className="text-xs text-green-600 mt-1">↓ 12% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: primaryColor }}>
              {metrics.activeUsers.toLocaleString()}
            </div>
            <p className="text-xs text-green-600 mt-1">↑ 8% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversation Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Conversation Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.conversationTrend.map((day, i) => {
                const maxCount = Math.max(
                  ...metrics.conversationTrend.map((d) => d.count)
                );
                const percentage = (day.count / maxCount) * 100;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="text-xs text-gray-500 w-12">{day.date}</div>
                    <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full rounded-lg transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: primaryColor,
                          opacity: 0.8,
                        }}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-xs font-medium text-gray-700">
                          {day.count}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Intents */}
        <Card>
          <CardHeader>
            <CardTitle>Top Intents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topIntents.slice(0, 5).map((intent, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {intent.intent}
                    </span>
                    <span className="text-sm text-gray-500">
                      {intent.count} ({intent.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${intent.percentage}%`,
                        backgroundColor: primaryColor,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 ${
                    activity.status === "completed"
                      ? "bg-green-500"
                      : activity.status === "pending"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {activity.user}
                    </span>
                    <span className="text-xs text-gray-500">
                      {activity.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {activity.message}
                  </p>
                </div>
                <div
                  className={`text-xs px-2 py-1 rounded-full ${
                    activity.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : activity.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {activity.status}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
