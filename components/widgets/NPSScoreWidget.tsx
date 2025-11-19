"use client";

import { StatCard } from "./StatCard";

interface NPSScoreWidgetProps {
  primaryColor?: string;
  marketId?: number;
  workspaceId?: number;
}

export function NPSScoreWidget({
  primaryColor,
  marketId,
  workspaceId,
}: NPSScoreWidgetProps) {
  const mockData = {
    score: Math.floor(Math.random() * 50) + 50,
    trend: Math.floor(Math.random() * 15) - 5,
  };

  const getDescription = (score: number) => {
    if (score >= 70) return "Excellent customer satisfaction";
    if (score >= 50) return "Good customer satisfaction";
    return "Needs improvement customer satisfaction";
  };

  return (
    <StatCard
      title="NPS Score"
      value={mockData.score}
      trend={{
        value: Math.abs(mockData.trend),
        isPositive: mockData.trend > 0,
      }}
      description={getDescription(mockData.score)}
      primaryColor={primaryColor}
    />
  );
}
