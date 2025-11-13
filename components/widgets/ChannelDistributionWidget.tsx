"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface ChannelDistributionWidgetProps {
  primaryColor?: string;
}

export function ChannelDistributionWidget({
  primaryColor = "#3b82f6",
}: ChannelDistributionWidgetProps) {
  const data = [
    { name: "Chat", value: 45, color: primaryColor },
    { name: "Email", value: 30, color: "#8b5cf6" },
    { name: "Phone", value: 15, color: "#ec4899" },
    { name: "Social", value: 10, color: "#10b981" },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-base font-medium">
          Channel Distribution
        </CardTitle>
        <p className="text-xs text-muted-foreground">This month</p>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
