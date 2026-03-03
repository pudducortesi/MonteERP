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
import { cn } from "@/lib/utils";
import {
  DEAL_STATUS_LABELS,
  DEAL_TYPE_LABELS,
  DEAL_PRIORITY_LABELS,
  DEAL_PRIORITY_COLORS,
  formatCurrency,
} from "@/lib/utils/deal";
import { Briefcase } from "lucide-react";
import type { DealWithRelations } from "@/types";

interface DealsTableProps {
  deals: DealWithRelations[];
}

export function DealsTable({ deals }: DealsTableProps) {
  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border">
        <Briefcase className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">Nessun deal trovato</p>
        <p className="text-xs text-muted-foreground mt-1">
          Crea il primo deal per iniziare a gestire la pipeline
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Codice</TableHead>
            <TableHead>Titolo</TableHead>
            <TableHead>Azienda</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priorità</TableHead>
            <TableHead className="text-right">Valore</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deals.map((deal) => (
            <TableRow key={deal.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell>
                <Link
                  href={`/deals/${deal.id}`}
                  className="text-xs font-mono text-muted-foreground hover:text-[#1B2A4A]"
                >
                  {deal.code || "—"}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/deals/${deal.id}`}
                  className="font-medium text-[#1B2A4A] hover:underline"
                >
                  {deal.title}
                </Link>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {deal.company?.name || "—"}
              </TableCell>
              <TableCell className="text-sm">
                {DEAL_TYPE_LABELS[deal.deal_type]}
              </TableCell>
              <TableCell>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                  {DEAL_STATUS_LABELS[deal.status]}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded",
                    DEAL_PRIORITY_COLORS[deal.priority]
                  )}
                >
                  {DEAL_PRIORITY_LABELS[deal.priority]}
                </span>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(deal.deal_value)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
