"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  DEAL_STATUS_LABELS,
  DEAL_STATUS_COLORS,
  DEAL_TYPE_LABELS,
  DEAL_PRIORITY_COLORS,
  PRACTICE_AREA_LABELS,
  PRACTICE_AREA_COLORS,
  formatCurrency,
  formatDateShort,
} from "@/lib/utils/deal";
import { Briefcase } from "lucide-react";
import type { DealWithRelations } from "@/types";

interface DealsTableProps {
  deals: DealWithRelations[];
}

export function DealsTable({ deals }: DealsTableProps) {
  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-[#E5E7EB]">
        <Briefcase className="h-8 w-8 text-[#D1D5DB] mb-2" />
        <p className="text-sm text-[#9CA3AF]">Nessun deal trovato</p>
        <p className="text-xs text-[#9CA3AF] mt-1">
          Crea il primo deal per iniziare a gestire la pipeline
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-x-auto shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[100px] text-[#6B7280]">Codice</TableHead>
            <TableHead className="text-[#6B7280]">Titolo</TableHead>
            <TableHead className="text-[#6B7280]">Azienda</TableHead>
            <TableHead className="text-[#6B7280]">Practice Area</TableHead>
            <TableHead className="text-[#6B7280]">Status</TableHead>
            <TableHead className="text-[#6B7280]">Priorità</TableHead>
            <TableHead className="text-[#6B7280]">Team</TableHead>
            <TableHead className="text-[#6B7280]">Chiusura</TableHead>
            <TableHead className="text-right text-[#6B7280]">Valore</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deals.map((deal) => {
            const members = deal.deal_members ?? [];
            const visibleMembers = members.slice(0, 3);
            const extraCount = members.length - 3;

            return (
              <TableRow key={deal.id} className="cursor-pointer hover:bg-[#FAFAFA] transition-colors">
                <TableCell>
                  <Link
                    href={`/pipeline/${deal.id}`}
                    className="text-[11px] font-mono text-[#9CA3AF] hover:text-[#E87A2E] transition-colors"
                  >
                    {deal.code || "—"}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/pipeline/${deal.id}`}
                    className="font-medium text-[#1A1A1A] hover:text-[#E87A2E] transition-colors"
                  >
                    {deal.title}
                  </Link>
                </TableCell>
                <TableCell className="text-sm text-[#6B7280]">
                  {deal.company?.name || "—"}
                </TableCell>
                <TableCell>
                  {deal.practice_area ? (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-1.5 py-0 h-4 font-normal",
                        PRACTICE_AREA_COLORS[deal.practice_area]
                      )}
                    >
                      {PRACTICE_AREA_LABELS[deal.practice_area]}
                    </Badge>
                  ) : (
                    <span className="text-xs text-[#9CA3AF]">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] px-1.5 py-0 h-4 font-normal",
                      DEAL_STATUS_COLORS[deal.status]
                    )}
                  >
                    {DEAL_STATUS_LABELS[deal.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      DEAL_PRIORITY_COLORS[deal.priority]
                    )}
                    title={deal.priority}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex -space-x-1">
                    {visibleMembers.map((m) => {
                      const initials = m.user?.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || "?";
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
                </TableCell>
                <TableCell className="text-xs text-[#6B7280]">
                  {formatDateShort(deal.expected_close)}
                </TableCell>
                <TableCell className="text-right font-medium text-[#1A1A1A]">
                  {formatCurrency(deal.deal_value)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
