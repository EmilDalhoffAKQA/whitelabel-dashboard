"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { StatCard } from "./StatCard";

interface TotalConversationsWidgetProps {
  primaryColor?: string;
  marketId?: number; // NEW: Optional market filter
  workspaceId?: number; // NEW: Optional workspace filter
}

export function TotalConversationsWidget({
  primaryColor,
  marketId,
  workspaceId,
}: TotalConversationsWidgetProps) {
  const [data, setData] = useState({ total: 0, trend: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [marketId, workspaceId]);

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];

      // Build query
      let todayQuery = supabase
        .from("conversations")
        .select("id", { count: "exact" })
        .gte("created_at", `${today}T00:00:00`)
        .lt("created_at", `${today}T23:59:59`);

      let yesterdayQuery = supabase
        .from("conversations")
        .select("id", { count: "exact" })
        .gte("created_at", `${yesterday}T00:00:00`)
        .lt("created_at", `${yesterday}T23:59:59`);

      // Apply filters if provided
      if (workspaceId) {
        todayQuery = todayQuery.eq("workspace_id", workspaceId);
        yesterdayQuery = yesterdayQuery.eq("workspace_id", workspaceId);
      }
      if (marketId) {
        todayQuery = todayQuery.eq("market_id", marketId);
        yesterdayQuery = yesterdayQuery.eq("market_id", marketId);
      }

      const [todayResult, yesterdayResult] = await Promise.all([
        todayQuery,
        yesterdayQuery,
      ]);

      const todayTotal = todayResult.count || 0;
      const yesterdayTotal = yesterdayResult.count || 0;

      const trend =
        yesterdayTotal > 0
          ? Math.round(((todayTotal - yesterdayTotal) / yesterdayTotal) * 100)
          : 0;

      setData({ total: todayTotal, trend });
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StatCard
        title="Total Conversations"
        value="..."
        description="Loading..."
        primaryColor={primaryColor}
      />
    );
  }

  return (
    <StatCard
      title="Total Conversations"
      value={data.total.toLocaleString()}
      trend={{
        value: Math.abs(data.trend),
        isPositive: data.trend > 0,
      }}
      description={marketId ? "Today (this market)" : "Today (all markets)"}
      primaryColor={primaryColor}
    />
  );
}
