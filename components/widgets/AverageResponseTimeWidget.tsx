"use client";

import { StatCard } from "./StatCard";

interface AverageResponseTimeWidgetProps {
  primaryColor?: string;
}

export function AverageResponseTimeWidget({
  primaryColor,
}: AverageResponseTimeWidgetProps) {
  return (
    <StatCard
      title="Average Response Time"
      value="2.3m"
      trend={{ value: 12, isPositive: true }}
      description="Faster than last week"
      primaryColor={primaryColor}
    />
  );
}
