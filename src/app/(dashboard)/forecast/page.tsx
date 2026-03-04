"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Target, AlertTriangle, Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils/deal";
import type { DealWithRelations, MonthlySummary } from "@/types";

const FORFETTARIO_SOGLIA = 85000;

const PHASE_PROBABILITIES: Record<string, number> = {
  prospect: 0.05,
  pitch: 0.15,
  mandate_signed: 0.35,
  analysis: 0.55,
  marketing: 0.55,
  negotiation: 0.75,
  closing: 0.95,
};

export default function ForecastPage() {
  const [deals, setDeals] = useState<DealWithRelations[]>([]);
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const [dealsRes, summaryRes] = await Promise.all([
      supabase
        .from("deals")
        .select("*, company:companies(id, name)")
        .order("updated_at", { ascending: false }),
      supabase
        .from("monthly_summary")
        .select("*")
        .order("year")
        .order("month_number"),
    ]);

    if (dealsRes.data) setDeals(dealsRes.data as unknown as DealWithRelations[]);
    if (summaryRes.data) setMonthlySummaries(summaryRes.data as MonthlySummary[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  const activeDeals = deals.filter(
    (d) => !["completed", "lost", "on_hold"].includes(d.status)
  );

  const currentYear = new Date().getFullYear();

  // Fee YTD
  const feeYTD = monthlySummaries
    .filter((s) => s.year === currentYear)
    .reduce((sum, s) => sum + (s.fee_earned || 0), 0);
  const forfettarioProgress = Math.min((feeYTD / FORFETTARIO_SOGLIA) * 100, 100);
  const forfettarioOverLimit = feeYTD > FORFETTARIO_SOGLIA;

  // Scenari
  function estimateFee(deal: DealWithRelations): number {
    if (!deal.success_fee_pct || !deal.deal_value) return deal.success_fee_min || 0;
    const fee = (deal.deal_value * deal.success_fee_pct) / 100;
    return Math.max(fee, deal.success_fee_min || 0);
  }

  const closingDeals = activeDeals.filter((d) => d.status === "closing");
  const ddDeals = activeDeals.filter((d) => d.status === "negotiation");

  const pessimistic = closingDeals.reduce((sum, d) => sum + estimateFee(d), 0);
  const base = [...closingDeals, ...ddDeals].reduce((sum, d) => sum + estimateFee(d), 0);
  const optimistic = activeDeals.reduce((sum, d) => {
    const prob = PHASE_PROBABILITIES[d.status] || 0.1;
    return sum + estimateFee(d) * prob;
  }, 0);

  // Fee per mese
  const currentYearSummaries = monthlySummaries.filter((s) => s.year === currentYear);
  const feeByMonth = currentYearSummaries.map((s) => ({
    name: s.month,
    fee: s.fee_earned || 0,
    entity: s.entity || "piva",
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Forecast</h1>
        <p className="text-sm text-[#6B7280]">
          Previsioni fee e soglia forfettario
        </p>
      </div>

      {/* Soglia Forfettario */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#E87A2E]" />
            <h3 className="text-base font-semibold text-[#1A1A1A]">
              Soglia Forfettario €85.000
            </h3>
          </div>
          <span className={`text-lg font-semibold ${forfettarioOverLimit ? "text-[#FF6B6B]" : "text-[#4ECDC4]"}`}>
            {formatCurrency(feeYTD)}
          </span>
        </div>
        <div className="h-4 w-full bg-[#F3F4F6] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${forfettarioOverLimit ? "bg-[#FF6B6B]" : "bg-[#4ECDC4]"}`}
            style={{ width: `${forfettarioProgress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <p className={`text-sm ${forfettarioOverLimit ? "text-[#FF6B6B] font-medium" : "text-[#9CA3AF]"}`}>
            {forfettarioOverLimit
              ? "⚠️ Soglia superata — Fattura tramite Assets SpA"
              : `Margine: ${formatCurrency(FORFETTARIO_SOGLIA - feeYTD)}`}
          </p>
          <p className="text-sm text-[#9CA3AF]">
            {formatCurrency(FORFETTARIO_SOGLIA)}
          </p>
        </div>
      </div>

      {/* 3 Scenari */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-sm text-[#6B7280] font-medium">Pessimistico</p>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Solo deal in Closing</p>
          <p className="text-2xl font-semibold text-[#FF6B6B] mt-2">
            {formatCurrency(pessimistic)}
          </p>
          <p className="text-xs text-[#9CA3AF] mt-1">{closingDeals.length} deal</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-sm text-[#6B7280] font-medium">Base</p>
          <p className="text-xs text-[#9CA3AF] mt-0.5">DD + Closing</p>
          <p className="text-2xl font-semibold text-[#FFD93D] mt-2">
            {formatCurrency(base)}
          </p>
          <p className="text-xs text-[#9CA3AF] mt-1">{closingDeals.length + ddDeals.length} deal</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-sm text-[#6B7280] font-medium">Ottimistico</p>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Pipeline pesata</p>
          <p className="text-2xl font-semibold text-[#4ECDC4] mt-2">
            {formatCurrency(optimistic)}
          </p>
          <p className="text-xs text-[#9CA3AF] mt-1">{activeDeals.length} deal</p>
        </div>
      </div>

      {/* Probabilità per Fase */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-4 w-4 text-[#E87A2E]" />
          <h3 className="text-sm font-semibold text-[#1A1A1A]">Probabilità per Fase</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { from: "Lead", to: "Proposta", prob: "5-15%", time: "9-18 mesi" },
            { from: "Mandato", to: "DD", prob: "35-75%", time: "3-9 mesi" },
            { from: "DD", to: "Closing", prob: "75-95%", time: "< 3 mesi" },
          ].map((item) => (
            <div key={item.from} className="flex items-center gap-3 p-3 rounded-lg bg-[#FAFAFA] border border-[#F3F4F6]">
              <div>
                <p className="text-sm font-medium text-[#1A1A1A]">
                  {item.from} → {item.to}
                </p>
                <p className="text-xs text-[#6B7280]">
                  {item.prob} · {item.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Split Fatturazione */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-4 w-4 text-[#E87A2E]" />
          <h3 className="text-sm font-semibold text-[#1A1A1A]">Split Fatturazione</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="p-4 rounded-lg bg-[#4ECDC4]/5 border border-[#4ECDC4]/20">
            <p className="text-sm font-semibold text-[#4ECDC4]">P.IVA Forfettaria</p>
            <p className="text-xs text-[#6B7280] mt-1">Fino a €85.000/anno</p>
            <p className="text-lg font-semibold text-[#1A1A1A] mt-2">Tassazione 5%</p>
          </div>
          <div className="p-4 rounded-lg bg-[#A78BFA]/5 border border-[#A78BFA]/20">
            <p className="text-sm font-semibold text-[#A78BFA]">Assets SpA</p>
            <p className="text-xs text-[#6B7280] mt-1">Oltre €85.000/anno</p>
            <p className="text-lg font-semibold text-[#1A1A1A] mt-2">IRES 24% + IRAP 3,9%</p>
          </div>
        </div>
      </div>

      {/* Fee per mese */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Fee per Mese</h3>
        {feeByMonth.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={feeByMonth} margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value as number), "Fee"]}
                contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }}
              />
              <Bar dataKey="fee" radius={[4, 4, 0, 0]} barSize={32}>
                {feeByMonth.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.entity === "spa" ? "#A78BFA" : "#4ECDC4"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Target className="h-8 w-8 text-[#D1D5DB] mb-2" />
            <p className="text-sm text-[#9CA3AF]">Nessuna fee registrata per {currentYear}</p>
          </div>
        )}
        {feeByMonth.length > 0 && (
          <div className="flex gap-4 mt-3 justify-center">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#4ECDC4]" />
              <span className="text-[11px] text-[#6B7280]">P.IVA Forfettaria</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#A78BFA]" />
              <span className="text-[11px] text-[#6B7280]">Assets SpA</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
