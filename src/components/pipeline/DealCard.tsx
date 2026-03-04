"use client";

import Link from "next/link";
import { Draggable } from "@hello-pangea/dnd";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DEAL_PRIORITY_COLORS,
  PRACTICE_AREA_LABELS,
  PRACTICE_AREA_COLORS,
  formatCurrencyCompact,
  daysInStage,
} from "@/lib/utils/deal";
import type { DealWithRelations } from "@/types";

interface DealCardProps {
  deal: DealWithRelations;
  index: number;
}

export function DealCard({ deal, index }: DealCardProps) {
  const days = daysInStage(deal.updated_at);
  const members = deal.deal_members ?? [];
  const visibleMembers = members.slice(0, 3);
  const extraCount = members.length - 3;

  return (
    <Draggable draggableId={deal.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "bg-white rounded-lg border border-[#E5E7EB] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-md",
            snapshot.isDragging && "shadow-lg ring-2 ring-[#E87A2E]/20"
          )}
        >
          <Link href={`/pipeline/${deal.id}`} className="block space-y-2">
            {/* Header: code + priority dot */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#9CA3AF]">
                {deal.code || "—"}
              </span>
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  DEAL_PRIORITY_COLORS[deal.priority]
                )}
                title={deal.priority}
              />
            </div>

            {/* Title */}
            <p className="text-sm font-medium text-[#1A1A1A] leading-tight line-clamp-2">
              {deal.title}
            </p>

            {/* Company */}
            {deal.company && (
              <p className="text-xs text-[#6B7280] truncate">
                {deal.company.name}
              </p>
            )}

            {/* Practice Area badge */}
            {deal.practice_area && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0 h-4 font-normal",
                  PRACTICE_AREA_COLORS[deal.practice_area]
                )}
              >
                {PRACTICE_AREA_LABELS[deal.practice_area]}
              </Badge>
            )}

            {/* Value */}
            {deal.deal_value != null && (
              <p className="text-sm font-semibold text-[#1A1A1A]">
                {formatCurrencyCompact(deal.deal_value)}
              </p>
            )}

            {/* Footer: avatars + days in stage */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex -space-x-1.5">
                {visibleMembers.map((m) => {
                  const u = m.user;
                  const initials = u?.full_name
                    ? u.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "?";
                  return (
                    <Avatar key={m.user_id} className="h-6 w-6 border-2 border-white">
                      <AvatarFallback className="text-[9px] bg-[#E87A2E] text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  );
                })}
                {extraCount > 0 && (
                  <Avatar className="h-6 w-6 border-2 border-white">
                    <AvatarFallback className="text-[9px] bg-[#F3F4F6] text-[#6B7280]">
                      +{extraCount}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
              <span className="text-[10px] text-[#9CA3AF]">
                {days}g
              </span>
            </div>
          </Link>
        </div>
      )}
    </Draggable>
  );
}
