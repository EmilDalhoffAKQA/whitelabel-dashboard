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
}

export function StatCard({
  title,
  value,
  trend,
  description,
  icon,
}: StatCardProps) {
  return (
    <Card className="h-full !py-6 !gap-4">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 h-[48px]">
        <CardTitle className="text-sm font-medium text-muted-foreground line-clamp-2">
          {title}
        </CardTitle>
        <div className="h-4 flex items-center flex-shrink-0">
          {trend && (
            <div className="flex items-center gap-1 text-xs font-medium whitespace-nowrap">
              {trend.isPositive ? (
                <ArrowUpIcon className="h-3 w-3" />
              ) : (
                <ArrowDownIcon className="h-3 w-3" />
              )}
              <span>
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold">{value}</div>
        <div className="h-[16px] flex items-end">
          {description && (
            <p className="text-xs text-muted-foreground leading-none">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
