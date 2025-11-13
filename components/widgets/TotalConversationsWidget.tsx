"use client";

import { StatCard } from "./StatCard";

interface TotalConversationsWidgetProps {
  primaryColor?: string;
}

export function TotalConversationsWidget({
  primaryColor,
}: TotalConversationsWidgetProps) {
  // Mock data - replace with real data later
  const mockData = {
    total: Math.floor(Math.random() * 5000) + 1000,
    trend: Math.floor(Math.random() * 30) - 10,
  };

  return (
    <StatCard
      title="Total Conversations"
      value={mockData.total.toLocaleString()}
      trend={{
        value: Math.abs(mockData.trend),
        isPositive: mockData.trend > 0,
      }}
      description="Trending up this month"
      primaryColor={primaryColor}
    />
  );
}
