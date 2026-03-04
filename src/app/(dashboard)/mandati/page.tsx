"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DealForm } from "@/components/pipeline/DealForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Briefcase, Plus, Search } from "lucide-react";
import {
  formatCurrency,
  daysInStage,
  DEAL_STATUS_LABELS,
  DEAL_STATUS_COLORS,
} from "@/lib/utils/deal";
import type { DealWithRelations, DealStatus } from "@/types";

const PHASE_LABELS: Record<string, string> = {
  prospect: "Lead",
  pitch: "Proposta",
  mandate_signed: "Mandato",
  analysis: "Esecuzione",
  marketing: "Esecuzione",
  negotiation: "Due Diligence",
  closing: "Closing",
};

const PHASE_PROBABILITIES: Record<string, number> = {
  prospect: 0.05,
  pitch: 0.15,
  mandate_signed: 0.35,
  analysis: 0.55,
  marketing: 0.55,
  negotiation: 0.75,
  closing: 0.95,
};

const FUNNEL_PHASES = [
  { key: "prospect", label: "Lead", prob: 5, color: "#9CA3AF" },
  { key: "pitch", label: "Proposta", prob: 15, color: "#60A5FA" },
  { key: "mandate_signed", label: "Mandato", prob: 35, color: "#A78BFA" },
  { key: "analysis,marketing", label: "Esecuzione", prob: 55, color: "#F59E0B" },
  { key: "negotiation", label: "Due Diligence", prob: 75, color: "#E87A2E" },
  { key: "closing", label: "Closing", prob: 95, color: "#10B981" },
];

export default function MandatiPage() {
  const [deals, setDeals] = useState<DealWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const supabase = createClient();

  const fetchDeals = useCallback(async () => {
    const { data } = await supabase
      .from("deals")
      .select("*, company:companies(id, name)")
      .order("updated_at", { ascending: false });
    if (data) setDeals(data as unknown as DealWithRelations[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const activeDeals = deals.filter(
    (d) => !["completed", "lost", "on_hold"].includes(d.status)
  );

  const totalPipeline = activeDeals.reduce((sum, d) => sum + (d.deal_value || 0), 0);
  const totalWeighted = activeDeals.reduce((sum, d) => {
    const prob = PHASE_PROBABILITIES[d.status] || 0.1;
    const fee = d.success_fee_pct && d.deal_value
      ? (d.deal_value * d.success_fee_pct) / 100
      : 0;
    return sum + fee * prob;
  }, 0);

  // Funnel data
  const funnelData = FUNNEL_PHASES.map((phase) => {
    const keys = phase.key.split(",");
    const phaseDeals = activeDeals.filter((d) => keys.includes(d.status));
    const value = phaseDeals.reduce((sum, d) => sum + (d.deal_value || 0), 0);
    return { ...phase, count: phaseDeals.length, value };
  });
  const maxFunnelValue = Math.max(...funnelData.map((d) => d.value), 1);

  const filtered = deals.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.code?.toLowerCase().includes(q) ||
      d.company?.name?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">Pipeline Mandati</h1>
          <p className="text-sm text-[#6B7280]">
            Pipeline: {formatCurrency(totalPipeline)} · Pesata: {formatCurrency(totalWeighted)}
          </p>
        </div>
        <Button
          size="sm"
          className="bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
          onClick={() => setFormOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Nuovo Mandato
        </Button>
      </div>

      {/* Funnel */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Funnel Pipeline</h3>
        <div className="space-y-2.5">
          {funnelData.map((phase) => (
            <div key={phase.key} className="flex items-center gap-3">
              <span className="text-xs font-medium text-[#6B7280] w-24 text-right shrink-0">
                {phase.label}
              </span>
              <div className="flex-1 h-7 bg-[#F3F4F6] rounded-md overflow-hidden relative">
                <div
                  className="h-full rounded-md transition-all duration-700"
                  style={{
                    width: `${Math.max((phase.value / maxFunnelValue) * 100, phase.count > 0 ? 8 : 0)}%`,
                    backgroundColor: phase.color,
                  }}
                />
                {phase.count > 0 && (
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-medium text-white mix-blend-difference">
                    {phase.count} deal · {formatCurrency(phase.value)}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#9CA3AF] w-10 shrink-0 text-right">
                {phase.prob}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
        <Input
          placeholder="Cerca mandati..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white border-[#E5E7EB] h-9"
        />
      </div>

      {/* Deals Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-[#E5E7EB]">
          <Briefcase className="h-8 w-8 text-[#D1D5DB] mb-2" />
          <p className="text-sm text-[#9CA3AF]">Nessun mandato trovato</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-x-auto shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[#6B7280]">Codice</TableHead>
                <TableHead className="text-[#6B7280]">Titolo</TableHead>
                <TableHead className="text-[#6B7280]">Azienda</TableHead>
                <TableHead className="text-[#6B7280] text-right">Valore Deal</TableHead>
                <TableHead className="text-[#6B7280] text-right">Fee %</TableHead>
                <TableHead className="text-[#6B7280] text-right">Fee Stimata</TableHead>
                <TableHead className="text-[#6B7280]">Fase</TableHead>
                <TableHead className="text-[#6B7280] text-right">Giorni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((deal) => {
                const fee = deal.success_fee_pct && deal.deal_value
                  ? (deal.deal_value * deal.success_fee_pct) / 100
                  : null;
                const estimatedFee = fee
                  ? Math.max(fee, deal.success_fee_min || 0)
                  : deal.success_fee_min || null;

                return (
                  <TableRow
                    key={deal.id}
                    className="cursor-pointer hover:bg-[#FAFAFA] transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-[#9CA3AF]">
                      {deal.code || "—"}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/pipeline/${deal.id}`}
                        className="text-sm font-medium text-[#1A1A1A] hover:text-[#E87A2E] transition-colors"
                      >
                        {deal.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-[#6B7280]">
                      {deal.company?.name || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-right font-medium text-[#1A1A1A]">
                      {formatCurrency(deal.deal_value)}
                    </TableCell>
                    <TableCell className="text-sm text-right text-[#6B7280]">
                      {deal.success_fee_pct ? `${deal.success_fee_pct}%` : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-right font-medium text-[#E87A2E]">
                      {formatCurrency(estimatedFee)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={DEAL_STATUS_COLORS[deal.status] + " text-[10px] px-1.5 py-0 h-4"}
                      >
                        {DEAL_STATUS_LABELS[deal.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-right text-[#9CA3AF]">
                      {daysInStage(deal.updated_at)}g
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <DealForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={fetchDeals}
      />
    </div>
  );
}
