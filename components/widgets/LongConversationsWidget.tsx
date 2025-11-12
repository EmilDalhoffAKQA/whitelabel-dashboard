"use client";

import { StatCard } from "./StatCard";
import { MessagesSquare } from "lucide-react";

export function LongConversationsWidget() {
  // Mock data - samtaler med 5+ beskeder
  const mockData = {
    total: Math.floor(Math.random() * 800) + 200,
    percentage: Math.floor(Math.random() * 30) + 15,
  };

  return (
    <StatCard
      title="Conversations with 5+ Messages"
      value={mockData.total.toLocaleString()}
      description="Deep engagement conversations"
    />
  );
}
