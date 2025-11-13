"use client";

import { StatCard } from "./StatCard";

interface LongConversationsWidgetProps {
  primaryColor?: string;
}

export function LongConversationsWidget({ primaryColor }: LongConversationsWidgetProps) {
  const mockData = {
    total: Math.floor(Math.random() * 500) + 100,
    trend: Math.floor(Math.random() * 20) - 5,
  };

  return (
    <StatCard
      title="Conversations with 5+ Messages"
      value={mockData.total}
      trend={{
        value: Math.abs(mockData.trend),
        isPositive: mockData.trend > 0,
      }}
      description="Deep engagement conversations"
      primaryColor={primaryColor}
    />
  );
}
