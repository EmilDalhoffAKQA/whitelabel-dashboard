"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { Conversation, Market } from "@/lib/types";

interface RecentConversationsWidgetProps {
  primaryColor?: string;
  marketId?: number; // NEW: Optional market filter
  workspaceId?: number; // NEW: Optional workspace filter
}

interface ConversationWithMarket extends Conversation {
  market?: Market;
}

export function RecentConversationsWidget({
  primaryColor,
  marketId,
  workspaceId,
}: RecentConversationsWidgetProps) {
  const [conversations, setConversations] = useState<ConversationWithMarket[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, [marketId, workspaceId]);

  const loadConversations = async () => {
    try {
      let query = supabase
        .from("conversations")
        .select(
          `
          *,
          market:markets(*)
        `
        )
        .order("created_at", { ascending: false })
        .limit(10);

      // Apply filters
      if (workspaceId) query = query.eq("workspace_id", workspaceId);
      if (marketId) query = query.eq("market_id", marketId);

      const { data, error } = await query;

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-500";
      case "active":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours > 24) return `${Math.floor(diffHours / 24)}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return `${Math.floor(diffMs / (1000 * 60))}m ago`;
  };

  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Recent Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-base font-medium">
          Recent Conversations
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {marketId ? "Latest in this market" : "Latest across all markets"}
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-0">
          {conversations.map((conv, index) => (
            <div
              key={conv.id}
              className={`flex items-center justify-between p-3 hover:bg-accent/30 transition-colors ${
                index !== conversations.length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
            >
              <div className="flex-1 min-w-0 mr-3">
                {!marketId && conv.market && (
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{conv.market.name}</p>
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {conv.market.market_code}
                    </Badge>
                  </div>
                )}
                <p
                  className={`text-xs font-medium ${getSentimentColor(
                    conv.sentiment
                  )}`}
                >
                  {conv.sentiment.charAt(0).toUpperCase() +
                    conv.sentiment.slice(1)}{" "}
                  sentiment
                  {conv.satisfaction_score && ` • ${conv.satisfaction_score}/5`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(conv.status)}>
                  {conv.status}
                </Badge>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {getTimeAgo(conv.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
