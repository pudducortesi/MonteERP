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
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils/deal";
import {
  FEE_STATUS_LABELS,
  FEE_STATUS_COLORS,
  INVOICE_ENTITY_LABELS,
} from "@/lib/utils/fee";
import { cn } from "@/lib/utils";
import type { SuccessFee, Deal, InvoiceEntity } from "@/types";

type FeeWithDeal = SuccessFee & {
  deal?: Pick<Deal, "id" | "code" | "title" | "deal_value" | "success_fee_pct" | "success_fee_min" | "practice_area"> | null;
};

const PIE_COLORS = ["#E87A2E", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EF4444", "#06B6D4", "#EC4899"];

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
      .select("*, deal:deals(id, code, title, deal_value, success_fee_pct, success_fee_min, practice_area)")
      .order("created_at", { ascending: false });

    if (data) setFees(data as unknown as FeeWithDeal[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const totalExpected = fees.reduce((sum, f) => sum + (f.fee_agreed || f.fee_calculated || 0), 0);
  const totalPaid = fees.filter((f) => f.payment_status === "paid").reduce((sum, f) => sum + (f.fee_agreed || f.fee_calculated || 0), 0);
  const totalOverdue = fees.filter((f) => f.payment_status === "overdue").reduce((sum, f) => sum + (f.fee_agreed || f.fee_calculated || 0) - f.paid_amount, 0);
  const totalPending = fees.filter((f) => f.payment_status === "pending" || f.payment_status === "partial").reduce((sum, f) => sum + (f.fee_agreed || f.fee_calculated || 0) - f.paid_amount, 0);

  // Entity breakdown
  const entityBreakdown = Object.entries(INVOICE_ENTITY_LABELS).map(([key, label]) => ({
    name: label,
    value: fees.filter((f) => f.invoice_entity === key).reduce((sum, f) => sum + (f.fee_agreed || f.fee_calculated || 0), 0),
  })).filter((d) => d.value > 0);

  // Status pie
  const statusPie = Object.entries(FEE_STATUS_LABELS).map(([key, label]) => ({
    name: label,
    value: fees.filter((f) => f.payment_status === key).length,
  })).filter((d) => d.value > 0);

  const filtered = fees.filter((f) => {
    if (search) {
      const q = search.toLowerCase();
      if (!f.deal?.code?.toLowerCase().includes(q) && !f.deal?.title?.toLowerCase().includes(q)) return false;
    }
    if (statusFilter !== "all" && f.payment_status !== statusFilter) return false;
    if (entityFilter !== "all" && f.invoice_entity !== entityFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Success Fee</h1>
        <p className="text-sm text-[#6B7280]">{fees.length} fee registrate</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Fee Attese" value={formatCurrency(totalExpected)} description="Totale fee previste" icon={DollarSign} />
        <KPICard label="Fee Incassate" value={formatCurrency(totalPaid)} description="Pagamento completato" icon={TrendingUp} />
        <KPICard label="In Ritardo" value={formatCurrency(totalOverdue)} description="Pagamento scaduto" icon={AlertTriangle} />
        <KPICard label="Forecast" value={formatCurrency(totalPending)} description="In attesa di pagamento" icon={Clock} />
      </div>

      {/* Charts */}
      {fees.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Entity breakdown */}
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Fee per Entità</h3>
            {entityBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={entityBreakdown}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => [formatCurrency(value as number), "Fee"]} contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} />
                  <Bar dataKey="value" fill="#E87A2E" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-[#9CA3AF] text-center py-8">Nessun dato</p>
            )}
          </div>

          {/* Status pie */}
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Distribuzione per Status</h3>
            {statusPie.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                    {statusPie.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-[#9CA3AF] text-center py-8">Nessun dato</p>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
          <Input placeholder="Cerca per deal..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-white border-[#E5E7EB] h-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-white border-[#E5E7EB] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli status</SelectItem>
            {Object.entries(FEE_STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[180px] bg-white border-[#E5E7EB] h-9">
            <SelectValue placeholder="Entità" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le entità</SelectItem>
            {Object.entries(INVOICE_ENTITY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-[#E5E7EB]">
          <DollarSign className="h-8 w-8 text-[#D1D5DB] mb-2" />
          <p className="text-sm text-[#9CA3AF]">Nessuna fee trovata</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-x-auto shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[#6B7280]">Codice</TableHead>
                <TableHead className="text-[#6B7280]">Titolo Deal</TableHead>
                <TableHead className="text-right text-[#6B7280]">Fee Concordata</TableHead>
                <TableHead className="text-[#6B7280]">Status</TableHead>
                <TableHead className="text-[#6B7280]">Entità</TableHead>
                <TableHead className="text-right text-[#6B7280]">Pagato</TableHead>
                <TableHead className="text-[#6B7280]">Scadenza</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((fee) => (
                <TableRow key={fee.id} className="cursor-pointer hover:bg-[#FAFAFA] transition-colors">
                  <TableCell>
                    <Link href={`/pipeline/${fee.deal_id}`} className="text-[11px] font-mono text-[#9CA3AF] hover:text-[#E87A2E] transition-colors">
                      {fee.deal?.code || "—"}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-[#1A1A1A]">{fee.deal?.title || "—"}</TableCell>
                  <TableCell className="text-right text-sm font-semibold text-[#1A1A1A]">{formatCurrency(fee.fee_agreed || fee.fee_calculated)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4", FEE_STATUS_COLORS[fee.payment_status])}>
                      {FEE_STATUS_LABELS[fee.payment_status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[#6B7280]">{fee.invoice_entity ? INVOICE_ENTITY_LABELS[fee.invoice_entity] : "—"}</TableCell>
                  <TableCell className="text-right text-sm text-[#1A1A1A]">{formatCurrency(fee.paid_amount)}</TableCell>
                  <TableCell className="text-sm text-[#6B7280]">{fee.due_date ? new Date(fee.due_date).toLocaleDateString("it-IT") : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
