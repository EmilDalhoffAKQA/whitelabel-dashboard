"use client";

import { StatCard } from "./StatCard";

interface ActiveUsersTodayWidgetProps {
  primaryColor?: string;
}

export function ActiveUsersTodayWidget({
  primaryColor,
}: ActiveUsersTodayWidgetProps) {
  return (
    <StatCard
      title="Active Users Today"
      value="1,234"
      trend={{ value: 8, isPositive: true }}
      description="Users online right now"
      primaryColor={primaryColor}
    />
  );
}
