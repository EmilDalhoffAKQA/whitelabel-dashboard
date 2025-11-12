"use client";

import { StatCard } from "./StatCard";
import { MessageSquare } from "lucide-react";

export function TotalConversationsWidget() {
  // Mock data - generer tilfældige tal per workspace
  const mockData = {
    total: Math.floor(Math.random() * 5000) + 1000,
    trend: {
      value: Math.floor(Math.random() * 20) + 5,
      isPositive: Math.random() > 0.3,
    },
  };

  return (
    <StatCard
      title="Total Conversations"
      value={mockData.total.toLocaleString()}
      trend={mockData.trend}
      description="Trending up this month"
    />
  );
}
