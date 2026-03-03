"use client";

import Link from "next/link";
import { Draggable } from "@hello-pangea/dnd";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  DEAL_PRIORITY_COLORS,
  DEAL_PRIORITY_LABELS,
  formatCurrency,
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
            "bg-white rounded-lg border border-gray-200 p-3 shadow-sm transition-shadow",
            snapshot.isDragging && "shadow-lg ring-2 ring-[#1B2A4A]/20"
          )}
        >
          <Link href={`/deals/${deal.id}`} className="block space-y-2">
            {/* Header: code + priority */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground">
                {deal.code || "—"}
              </span>
              <span
                className={cn(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                  DEAL_PRIORITY_COLORS[deal.priority]
                )}
              >
                {DEAL_PRIORITY_LABELS[deal.priority]}
              </span>
            </div>

            {/* Title */}
            <p className="text-sm font-medium text-[#1B2A4A] leading-tight line-clamp-2">
              {deal.title}
            </p>

            {/* Company */}
            {deal.company && (
              <p className="text-xs text-muted-foreground truncate">
                {deal.company.name}
              </p>
            )}

            {/* Value */}
            {deal.deal_value != null && (
              <p className="text-sm font-semibold text-[#1B2A4A]">
                {formatCurrency(deal.deal_value)}
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
                      <AvatarFallback className="text-[9px] bg-[#1B2A4A] text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  );
                })}
                {extraCount > 0 && (
                  <Avatar className="h-6 w-6 border-2 border-white">
                    <AvatarFallback className="text-[9px] bg-gray-200 text-gray-600">
                      +{extraCount}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {days}g
              </span>
            </div>
          </Link>
        </div>
      )}
    </Draggable>
  );
}
