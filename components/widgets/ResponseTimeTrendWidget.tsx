"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { TrendingDown, TrendingUp } from "lucide-react";

interface ResponseTimeTrendWidgetProps {
  primaryColor?: string;
}

export function ResponseTimeTrendWidget({ primaryColor = "#3b82f6" }: ResponseTimeTrendWidgetProps) {
  const isMobile = useIsMobile();
  const data = [
    { value: 3.2 },
    { value: 2.8 },
    { value: 2.5 },
    { value: 2.9 },
    { value: 2.3 },
    { value: 2.1 },
    { value: 1.9 },
  ];

  const trend = -18; // Negative is good for response time
  const isImproving = trend < 0;

  return (
    <Card className="h-full flex flex-col p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Response Time
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold" style={{ color: primaryColor }}>
              1.9m
            </p>
            <div className="flex items-center gap-1 text-xs font-medium text-green-600">
              {isImproving ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <TrendingUp className="h-3 w-3" />
              )}
              <span>{Math.abs(trend)}%</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 -mx-4 -mb-4">
        <ResponsiveContainer width="100%" height={isMobile ? 140 : "100%"}>
          <LineChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={primaryColor}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground mt-2">Trending down</p>
    </Card>
  );
}
