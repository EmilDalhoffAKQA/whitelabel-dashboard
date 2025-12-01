"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Market, Workspace } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getWidgetComponent } from "@/components/widgets";
import { ArrowLeft } from "lucide-react";

export default function MarketDashboardPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const workspaceId = params?.workspaceId as string;
  const marketCode = params?.marketCode as string;

  useEffect(() => {
    loadData();
  }, [workspaceId, marketCode]);

  const loadData = async () => {
    try {
      // Fetch workspace
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

      // Fetch market
      const { data: marketData, error: marketError } = await supabase
        .from("markets")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("market_code", marketCode)
        .single();

      if (marketError || !marketData) {
        router.push(`/${workspaceId}/markets`);
        return;
      }

      setMarket(marketData);

      // Ensure analytics snapshots exist for today for this market — if not, generate mock data
      const today = new Date().toISOString().split("T")[0];
      const { data: todaySnapshot } = await supabase
        .from("analytics_snapshots")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("market_id", marketData.id)
        .gte("timestamp", `${today}T00:00:00`)
        .single();

      if (!todaySnapshot) {
        // call server-side route to refresh mock data for this market
        try {
          await fetch(`/api/markets/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ workspaceId: workspaceId, marketId: marketData.id, days: 7 }),
          });
        } catch (e) {
          console.error("Failed to refresh mock data", e);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      router.push(`/${workspaceId}/markets`);
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

  if (!workspace || !market) {
    return null;
  }

  // Define which widgets to show for market dashboard
  const marketWidgets = [
    { component: "TotalConversationsWidget", width: 3, height: 1 },
    { component: "AverageResponseTimeWidget", width: 3, height: 1 },
    { component: "ResolutionRateWidget", width: 3, height: 1 },
    { component: "NPSScoreWidget", width: 3, height: 1 },
    { component: "ConversationVolumeWidget", width: 6, height: 2 },
    { component: "CustomerSentimentWidget", width: 6, height: 2 },
    { component: "RecentConversationsWidget", width: 12, height: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(`/${workspaceId}/markets`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {market.name} Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Market-specific analytics for {market.market_code}
          </p>
        </div>
      </div>

      {/* Market Info Card */}
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Market Code</p>
              <p
                className="text-lg font-semibold"
                style={{ color: primaryColor }}
              >
                {market.market_code}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Language</p>
              <p className="text-lg font-semibold text-gray-900">
                {market.language}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-lg font-semibold text-gray-900">
                {market.is_active ? "Active" : "Inactive"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Workspace</p>
              <p className="text-lg font-semibold text-gray-900">
                {workspace.name}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Widgets Grid */}
      <div className="grid grid-cols-12 gap-4">
        {marketWidgets.map((widget, index) => {
          const WidgetComponent = getWidgetComponent(widget.component);
          if (!WidgetComponent) return null;

          return (
            <div
              key={index}
              className={`col-span-${widget.width}`}
              style={{
                gridColumn: `span ${widget.width}`,
                minHeight: `${widget.height * 180}px`,
              }}
            >
              <WidgetComponent
                primaryColor={primaryColor}
                marketId={market.id}
                workspaceId={parseInt(workspaceId)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
