"use client";

import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

export function KPICard({
  label,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: KPICardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] animate-fade-in",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-[#6B7280] font-medium">{label}</p>
          <p className="text-2xl font-semibold text-[#1A1A1A] animate-count-up">
            {value}
          </p>
          <div className="flex items-center gap-2">
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium px-1.5 py-0.5 rounded",
                  trend.positive
                    ? "text-emerald-700 bg-emerald-50"
                    : "text-red-700 bg-red-50"
                )}
              >
                {trend.positive ? "+" : ""}
                {trend.value}
              </span>
            )}
            {description && (
              <span className="text-xs text-[#9CA3AF]">{description}</span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#E87A2E]/10">
          <Icon className="h-5 w-5 text-[#E87A2E]" />
        </div>
      </div>
    </div>
  );
}
