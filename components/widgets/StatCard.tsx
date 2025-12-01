// components/widgets/StatCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  icon?: React.ReactNode;
  primaryColor?: string;
}

export function StatCard({
  title,
  value,
  trend,
  description,
  icon,
  primaryColor = "#3b82f6",
}: StatCardProps) {
  return (
    <Card className="h-full !py-4 md:!py-6 !gap-3 md:!gap-4">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 min-h-[40px] md:h-[48px]">
        <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground line-clamp-2 pr-2">
          {title}
        </CardTitle>
        <div className="h-4 flex items-center flex-shrink-0">
          {trend && (
            <div
              className={`flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs font-medium whitespace-nowrap ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpIcon className="h-2.5 w-2.5 md:h-3 md:w-3" />
              ) : (
                <ArrowDownIcon className="h-2.5 w-2.5 md:h-3 md:w-3" />
              )}
              <span>
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5 md:space-y-2">
        <div
          className="text-xl md:text-2xl lg:text-2xl font-bold truncate"
          style={{ color: primaryColor }}
        >
          {value}
        </div>
        <div className="min-h-[14px] md:h-[16px] flex items-end">
          {description && (
            <p className="text-[10px] md:text-xs text-muted-foreground leading-none line-clamp-1">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
