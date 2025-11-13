"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface SatisfactionTrendWidgetProps {
  primaryColor?: string;
}

export function SatisfactionTrendWidget({
  primaryColor = "#3b82f6",
}: SatisfactionTrendWidgetProps) {
  const data = [
    { value: 82 },
    { value: 85 },
    { value: 83 },
    { value: 88 },
    { value: 90 },
    { value: 87 },
    { value: 92 },
  ];

  return (
    <Card className="h-full flex flex-col p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Satisfaction Trend
          </p>
          <p
            className="text-2xl font-bold mt-1"
            style={{ color: primaryColor }}
          >
            92%
          </p>
        </div>
      </div>
      <div className="flex-1 min-h-0 -mx-4 -mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="satisfactionGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={primaryColor}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#satisfactionGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground mt-2">Last 7 days</p>
    </Card>
  );
}
