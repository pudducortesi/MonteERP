"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { KPICard } from "@/components/dashboard/KPICard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, DollarSign, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils/deal";
import {
  FEE_STATUS_LABELS,
  FEE_STATUS_COLORS,
  INVOICE_ENTITY_LABELS,
} from "@/lib/utils/fee";
import { cn } from "@/lib/utils";
import type { SuccessFee, Deal, FeeStatus, InvoiceEntity } from "@/types";

type FeeWithDeal = SuccessFee & {
  deal?: Pick<Deal, "id" | "code" | "title" | "deal_value" | "success_fee_pct" | "success_fee_min"> | null;
};

export default function FeesPage() {
  const [fees, setFees] = useState<FeeWithDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const supabase = createClient();

  const fetchFees = useCallback(async () => {
    const { data } = await supabase
      .from("success_fees")
      .select(
        "*, deal:deals(id, code, title, deal_value, success_fee_pct, success_fee_min)"
      )
      .order("created_at", { ascending: false });

    if (data) setFees(data as unknown as FeeWithDeal[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  // KPI calculations
  const totalExpected = fees.reduce(
    (sum, f) => sum + (f.fee_agreed || f.fee_calculated || 0),
    0
  );
  const totalPaid = fees
    .filter((f) => f.payment_status === "paid")
    .reduce((sum, f) => sum + (f.fee_agreed || f.fee_calculated || 0), 0);
  const totalOverdue = fees
    .filter((f) => f.payment_status === "overdue")
    .reduce((sum, f) => sum + (f.fee_agreed || f.fee_calculated || 0) - f.paid_amount, 0);
  const totalPending = fees
    .filter((f) => f.payment_status === "pending" || f.payment_status === "partial")
    .reduce((sum, f) => sum + (f.fee_agreed || f.fee_calculated || 0) - f.paid_amount, 0);

  const filtered = fees.filter((f) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !f.deal?.code?.toLowerCase().includes(q) &&
        !f.deal?.title?.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (statusFilter !== "all" && f.payment_status !== statusFilter) return false;
    if (entityFilter !== "all" && f.invoice_entity !== entityFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Success Fee</h1>
        <p className="text-sm text-muted-foreground">
          {fees.length} fee registrate
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Fee Attese"
          value={formatCurrency(totalExpected)}
          description="Totale fee previste"
          icon={DollarSign}
        />
        <KPICard
          label="Fee Incassate"
          value={formatCurrency(totalPaid)}
          description="Pagamento completato"
          icon={TrendingUp}
        />
        <KPICard
          label="In Ritardo"
          value={formatCurrency(totalOverdue)}
          description="Pagamento scaduto"
          icon={AlertTriangle}
        />
        <KPICard
          label="Forecast"
          value={formatCurrency(totalPending)}
          description="In attesa di pagamento"
          icon={Clock}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per deal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli status</SelectItem>
            {Object.entries(FEE_STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Entità" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le entità</SelectItem>
            {Object.entries(INVOICE_ENTITY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border">
          <DollarSign className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">
            Nessuna fee trovata
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Le fee verranno create dai deal
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Codice</TableHead>
                <TableHead>Titolo Deal</TableHead>
                <TableHead className="text-right">Valore Deal</TableHead>
                <TableHead className="text-right">Fee %</TableHead>
                <TableHead className="text-right">Fee Calcolata</TableHead>
                <TableHead className="text-right">Fee Concordata</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Entità</TableHead>
                <TableHead className="text-right">Pagato</TableHead>
                <TableHead>Scadenza</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((fee) => (
                <TableRow key={fee.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    <Link
                      href={`/deals/${fee.deal_id}`}
                      className="hover:underline text-[#1B2A4A]"
                    >
                      {fee.deal?.code || "—"}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-[#1B2A4A]">
                    {fee.deal?.title || "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatCurrency(fee.deal_value_final)}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {fee.deal?.success_fee_pct != null
                      ? `${fee.deal.success_fee_pct}%`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatCurrency(fee.fee_calculated)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {formatCurrency(fee.fee_agreed)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px]",
                        FEE_STATUS_COLORS[fee.payment_status]
                      )}
                    >
                      {FEE_STATUS_LABELS[fee.payment_status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {fee.invoice_entity
                      ? INVOICE_ENTITY_LABELS[fee.invoice_entity]
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatCurrency(fee.paid_amount)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {fee.due_date
                      ? new Date(fee.due_date).toLocaleDateString("it-IT")
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
