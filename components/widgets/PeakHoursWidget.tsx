"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface PeakHoursWidgetProps {
  primaryColor?: string;
}

export function PeakHoursWidget({
  primaryColor = "#3b82f6",
}: PeakHoursWidgetProps) {
  const data = [
    { hour: "9AM", conversations: 45 },
    { hour: "10AM", conversations: 78 },
    { hour: "11AM", conversations: 92 },
    { hour: "12PM", conversations: 110 },
    { hour: "1PM", conversations: 95 },
    { hour: "2PM", conversations: 88 },
    { hour: "3PM", conversations: 102 },
    { hour: "4PM", conversations: 85 },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-base font-medium">Peak Hours</CardTitle>
        <p className="text-xs text-muted-foreground">Today's activity</p>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="hour"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip />
            <Bar
              dataKey="conversations"
              fill={primaryColor}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
