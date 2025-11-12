"use client";

import { StatCard } from "./StatCard";
import { Star } from "lucide-react";

export function NPSScoreWidget() {
  // Mock NPS score (between -100 and 100)
  const npsScore = Math.floor(Math.random() * 80) + 20; // 20-100 for demo
  const trend = {
    value: Math.floor(Math.random() * 10) + 1,
    isPositive: Math.random() > 0.5,
  };

  // NPS kategorier
  const getNPSCategory = (score: number) => {
    if (score >= 70) return "Excellent";
    if (score >= 50) return "Great";
    if (score >= 30) return "Good";
    return "Needs Improvement";
  };

  return (
    <StatCard
      title="NPS Score"
      value={npsScore}
      trend={trend}
      description={`${getNPSCategory(npsScore)} customer satisfaction`}
    />
  );
}
