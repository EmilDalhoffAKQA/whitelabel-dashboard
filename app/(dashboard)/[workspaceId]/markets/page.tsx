"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { Market } from "@/lib/types";
import { Globe, MessageSquare, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarketStats {
  market: Market;
  today: {
    conversations: number;
    satisfaction: number;
  };
  yesterday: {
    conversations: number;
  };
}

export default function MarketsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params?.workspaceId as string;
  const [marketStats, setMarketStats] = useState<MarketStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  const loadData = async () => {
    try {
      // Get workspace theme
      const { data: workspace } = await supabase
        .from("workspaces")
        .select("theme_config")
        .eq("id", workspaceId)
        .single();

      if (workspace?.theme_config?.primaryColor) {
        setPrimaryColor(workspace.theme_config.primaryColor);
      }

      // Get markets
      const { data: markets } = await supabase
        .from("markets")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("name");

      if (!markets) return;

      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];

      // Get analytics for each market
      const stats = await Promise.all(
        markets.map(async (market) => {
          const { data: todayData } = await supabase
            .from("analytics_snapshots")
            .select("metrics")
            .eq("workspace_id", workspaceId)
            .eq("market_id", market.id)
            .gte("timestamp", `${today}T00:00:00`)
            .single();

          const { data: yesterdayData } = await supabase
            .from("analytics_snapshots")
            .select("metrics")
            .eq("workspace_id", workspaceId)
            .eq("market_id", market.id)
            .gte("timestamp", `${yesterday}T00:00:00`)
            .lt("timestamp", `${today}T00:00:00`)
            .single();

          return {
            market,
            today: {
              conversations: todayData?.metrics?.total_conversations || 0,
              satisfaction: todayData?.metrics?.avg_satisfaction_score || 0,
            },
            yesterday: {
              conversations: yesterdayData?.metrics?.total_conversations || 0,
            },
          };
        })
      );

      setMarketStats(stats);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedMarkets = async () => {
    setSeeding(true);
    try {
      const response = await fetch("/api/markets/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });

      if (!response.ok) throw new Error("Failed to seed markets");

      // Reload data after seeding
      await loadData();
    } catch (error) {
      console.error("Error seeding markets:", error);
      alert("Failed to seed markets. Please try again.");
    } finally {
      setSeeding(false);
    }
  };

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

  const totalConversations = marketStats.reduce(
    (sum, stat) => sum + stat.today.conversations,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Markets</h1>
        <p className="text-gray-600 mt-1">
          Monitor performance across all markets
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Active Markets
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {marketStats.filter((s) => s.market.is_active).length}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: `${primaryColor}10`,
                  color: primaryColor,
                }}
              >
                <Globe className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Conversations Today
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: primaryColor }}
                >
                  {totalConversations}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: `${primaryColor}10`,
                  color: primaryColor,
                }}
              >
                <MessageSquare className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Markets Grid */}
      {marketStats.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Globe className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  No markets found
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get started by adding default markets to your workspace
                </p>
                <Button
                  onClick={handleSeedMarkets}
                  disabled={seeding}
                  variant="dashboard"
                  style={{
                    backgroundColor: primaryColor,
                    color: "white",
                  }}
                  className="hover:opacity-90"
                >
                  {seeding ? "Adding Markets..." : "Add Default Markets"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketStats.map(({ market, today, yesterday }) => {
          const trend =
            yesterday.conversations > 0
              ? Math.round(
                  ((today.conversations - yesterday.conversations) /
                    yesterday.conversations) *
                    100
                )
              : 0;

          return (
            <Card
              key={market.id}
              className="border-gray-200 hover:shadow-lg transition-all cursor-pointer"
              onClick={() =>
                router.push(`/${workspaceId}/markets/${market.market_code}`)
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {market.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {market.market_code} • {market.language}
                    </p>
                  </div>
                  <Badge
                    className="text-xs"
                    style={{
                      backgroundColor: market.is_active
                        ? `${primaryColor}15`
                        : "#f3f4f6",
                      color: market.is_active ? primaryColor : "#6b7280",
                      border: market.is_active
                        ? `1px solid ${primaryColor}30`
                        : "1px solid #e5e7eb",
                    }}
                  >
                    {market.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Main Stats */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Conversations Today
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {today.conversations}
                    </p>
                    {trend !== 0 && (
                      <div
                        className={`flex items-center gap-1 text-xs font-medium ${
                          trend > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {trend > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>{Math.abs(trend)}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Satisfaction */}
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">
                    Avg. Satisfaction
                  </p>
                  <p
                    className="text-lg font-bold"
                    style={{ color: primaryColor }}
                  >
                    {today.satisfaction.toFixed(1)}/5.0
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
        </div>
      )}
    </div>
  );
}
