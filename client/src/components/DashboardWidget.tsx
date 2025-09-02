import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface DashboardWidgetProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    label: string;
  };
  trend?: "positive" | "negative" | "neutral";
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function DashboardWidget({
  title,
  value,
  icon: Icon,
  change,
  trend = "neutral",
  className,
  onClick,
  children,
}: DashboardWidgetProps) {
  const borderColor = {
    positive: "border-success/20",
    negative: "border-destructive/20",
    neutral: "border-border",
  };

  const changeColor = {
    positive: "text-success-foreground bg-success/10",
    negative: "text-destructive-foreground bg-destructive/10",
    neutral: "text-muted-foreground bg-muted/10",
  };

  const iconColor = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-primary",
  };

  return (
    <Card 
      className={cn(
        "widget-card shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1",
        borderColor[trend],
        className
      )}
      onClick={onClick}
      data-testid={`widget-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            trend === "positive" ? "bg-success/10" : 
            trend === "negative" ? "bg-destructive/10" : "bg-primary/10"
          )}>
            <Icon className={cn("w-5 h-5", iconColor[trend])} />
          </div>
          {change && (
            <div className="text-right">
              <span className={cn(
                "text-sm px-2 py-1 rounded-full",
                changeColor[trend]
              )}>
                {change.value > 0 ? "+" : ""}{change.value.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
        <p className="text-3xl font-bold text-foreground" data-testid={`value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {change && (
          <p className="text-sm text-muted-foreground mt-1">{change.label}</p>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
