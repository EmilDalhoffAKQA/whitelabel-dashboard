"use client";

import { StatCard } from "./StatCard";

interface ResolutionRateWidgetProps {
  primaryColor?: string;
}

export function ResolutionRateWidget({
  primaryColor,
}: ResolutionRateWidgetProps) {
  return (
    <StatCard
      title="Resolution Rate"
      value="94%"
      trend={{ value: 3, isPositive: true }}
      description="Issues resolved successfully"
      primaryColor={primaryColor}
    />
  );
}
