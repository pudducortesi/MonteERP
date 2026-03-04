"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Wallet,
  Briefcase,
  Receipt,
  TrendingUp,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import {
  formatCurrency,
  formatDateShort,
  daysRemaining,
  getGreeting,
  DEAL_STATUS_LABELS,
  DEAL_STATUS_COLORS,
} from "@/lib/utils/deal";
import type { User, DealWithRelations, Account, MonthlySummary } from "@/types";

interface PersonalDashboardProps {
  user: User;
}

const CATEGORY_COLORS: Record<string, string> = {
  Ristoranti: "#FF6B6B",
  Shopping: "#4ECDC4",
  Abbonamenti: "#45B7D1",
  Energia: "#FFA07A",
  "Online/Tech": "#98D8C8",
  Parcheggio: "#C9B1FF",
  Tabaccherie: "#FFD93D",
  "Bar/Caffè": "#6BCB77",
  Altro: "#95AFC0",
};

const FORFETTARIO_SOGLIA = 85000;

export function PersonalDashboard({ user }: PersonalDashboardProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [deals, setDeals] = useState<DealWithRelations[]>([]);
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const [accountsRes, dealsRes, summaryRes, txRes] = await Promise.all([
      supabase.from("accounts").select("*").eq("is_active", true).order("sort_order"),
      supabase
        .from("deals")
        .select("*, company:companies(id, name)")
        .order("updated_at", { ascending: false }),
      supabase
        .from("monthly_summary")
        .select("*")
        .order("year", { ascending: true })
        .order("month_number", { ascending: true }),
      supabase
        .from("transactions")
        .select("category, amount")
        .eq("type", "expense"),
    ]);

    if (accountsRes.data) setAccounts(accountsRes.data as Account[]);
    if (dealsRes.data) setDeals(dealsRes.data as unknown as DealWithRelations[]);
    if (summaryRes.data) setMonthlySummaries(summaryRes.data as MonthlySummary[]);

    if (txRes.data && txRes.data.length > 0) {
      const catMap: Record<string, number> = {};
      for (const tx of txRes.data) {
        const cat = tx.category || "Altro";
        catMap[cat] = (catMap[cat] || 0) + Math.abs(tx.amount);
      }
      setCategoryData(
        Object.entries(catMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
      );
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  const totalLiquidity = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const activeAccounts = accounts.filter((a) => a.is_active).length;

  const activeDeals = deals.filter(
    (d) => !["completed", "lost", "on_hold"].includes(d.status)
  );
  const pipelineValue = activeDeals.reduce((sum, d) => sum + (d.deal_value || 0), 0);

  const PHASE_PROBABILITIES: Record<string, number> = {
    prospect: 0.05,
    pitch: 0.15,
    mandate_signed: 0.35,
    analysis: 0.55,
    marketing: 0.55,
    negotiation: 0.75,
    closing: 0.95,
  };
  const weightedPipeline = activeDeals.reduce((sum, d) => {
    const prob = PHASE_PROBABILITIES[d.status] || 0.1;
    const fee = d.success_fee_pct && d.deal_value
      ? (d.deal_value * d.success_fee_pct) / 100
      : 0;
    return sum + fee * prob;
  }, 0);

  // Spese mese corrente
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const currentMonthSummary = monthlySummaries.find(
    (s) => s.year === currentYear && s.month_number === currentMonth
  );
  const prevMonthSummary = monthlySummaries.find(
    (s) =>
      (currentMonth === 1 ? s.year === currentYear - 1 && s.month_number === 12 : s.year === currentYear && s.month_number === currentMonth - 1)
  );
  const currentExpenses = currentMonthSummary?.expenses || 0;
  const prevExpenses = prevMonthSummary?.expenses || 0;
  const expenseChange = prevExpenses > 0 ? ((currentExpenses - prevExpenses) / prevExpenses) * 100 : 0;

  // Patrimonio totale = liquidità (non abbiamo investimenti per ora)
  const totalPatrimony = totalLiquidity;

  // Andamento spese ultimi 6 mesi
  const last6Months = monthlySummaries.slice(-6).map((s) => ({
    name: s.month,
    spese: s.expenses,
  }));

  // Fee YTD per soglia forfettario
  const feeYTD = monthlySummaries
    .filter((s) => s.year === currentYear)
    .reduce((sum, s) => sum + (s.fee_earned || 0), 0);
  const forfettarioProgress = Math.min((feeYTD / FORFETTARIO_SOGLIA) * 100, 100);
  const forfettarioOverLimit = feeYTD > FORFETTARIO_SOGLIA;

  // Deal in scadenza 30 giorni
  const upcomingDeals = activeDeals
    .filter((d) => {
      const days = daysRemaining(d.expected_close ?? null);
      return days !== null && days >= 0 && days <= 30;
    })
    .sort((a, b) => {
      const dA = daysRemaining(a.expected_close ?? null) ?? 999;
      const dB = daysRemaining(b.expected_close ?? null) ?? 999;
      return dA - dB;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">
          {getGreeting()}, {user.full_name.split(" ")[0]}
        </h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          Panoramica finanziaria personale
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Liquidità */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-[#6B7280] font-medium">Liquidità Totale</p>
              <p className={`text-2xl font-semibold ${totalLiquidity >= 0 ? "text-[#4ECDC4]" : "text-[#FF6B6B]"}`}>
                {formatCurrency(totalLiquidity)}
              </p>
              <span className="text-xs text-[#9CA3AF]">{activeAccounts} conti attivi</span>
            </div>
            <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${totalLiquidity >= 0 ? "bg-[#4ECDC4]/10" : "bg-[#FF6B6B]/10"}`}>
              <Wallet className={`h-5 w-5 ${totalLiquidity >= 0 ? "text-[#4ECDC4]" : "text-[#FF6B6B]"}`} />
            </div>
          </div>
        </div>

        {/* Pipeline */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-[#6B7280] font-medium">Pipeline</p>
              <p className="text-2xl font-semibold text-[#A78BFA]">
                {formatCurrency(pipelineValue)}
              </p>
              <span className="text-xs text-[#9CA3AF]">
                Pesata: {formatCurrency(weightedPipeline)}
              </span>
            </div>
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#A78BFA]/10">
              <Briefcase className="h-5 w-5 text-[#A78BFA]" />
            </div>
          </div>
        </div>

        {/* Spese Mese */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-[#6B7280] font-medium">Spese Mese</p>
              <p className="text-2xl font-semibold text-[#FF6B6B]">
                {formatCurrency(currentExpenses)}
              </p>
              <span className="text-xs text-[#9CA3AF]">
                vs mese prec.: {expenseChange >= 0 ? "+" : ""}{expenseChange.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#FF6B6B]/10">
              <Receipt className="h-5 w-5 text-[#FF6B6B]" />
            </div>
          </div>
        </div>

        {/* Patrimonio */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-[#6B7280] font-medium">Patrimonio Totale</p>
              <p className="text-2xl font-semibold text-[#FFD93D]">
                {formatCurrency(totalPatrimony)}
              </p>
              <span className="text-xs text-[#9CA3AF]">Liquidità + investimenti</span>
            </div>
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#FFD93D]/10">
              <TrendingUp className="h-5 w-5 text-[#FFD93D]" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Andamento Spese */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] animate-fade-in">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">
            Andamento Spese
          </h3>
          {last6Months.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={last6Months} margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="spese-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                  formatter={(value) => [formatCurrency(value as number), "Spese"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="spese"
                  stroke="#FF6B6B"
                  strokeWidth={2}
                  fill="url(#spese-gradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="h-8 w-8 text-[#D1D5DB] mb-2" />
              <p className="text-sm text-[#9CA3AF]">Nessun dato disponibile</p>
            </div>
          )}
        </div>

        {/* Spese per Categoria */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] animate-fade-in">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">
            Spese per Categoria
          </h3>
          {categoryData.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#95AFC0"} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatCurrency(value as number), ""]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 justify-center">
                {categoryData.slice(0, 6).map((c) => (
                  <div key={c.name} className="flex items-center gap-1.5">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[c.name] || "#95AFC0" }}
                    />
                    <span className="text-[11px] text-[#6B7280]">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="h-8 w-8 text-[#D1D5DB] mb-2" />
              <p className="text-sm text-[#9CA3AF]">Nessun dato disponibile</p>
            </div>
          )}
        </div>
      </div>

      {/* Soglia Forfettario */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#1A1A1A]">
            Soglia Forfettario €85.000
          </h3>
          <span className={`text-sm font-medium ${forfettarioOverLimit ? "text-[#FF6B6B]" : "text-[#4ECDC4]"}`}>
            {formatCurrency(feeYTD)} / {formatCurrency(FORFETTARIO_SOGLIA)}
          </span>
        </div>
        <div className="h-3 w-full bg-[#F3F4F6] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${forfettarioOverLimit ? "bg-[#FF6B6B]" : "bg-[#4ECDC4]"}`}
            style={{ width: `${forfettarioProgress}%` }}
          />
        </div>
        <p className={`text-xs mt-2 ${forfettarioOverLimit ? "text-[#FF6B6B] font-medium" : "text-[#9CA3AF]"}`}>
          {forfettarioOverLimit
            ? "⚠️ Soglia superata — Fattura tramite Assets SpA"
            : `Margine: ${formatCurrency(FORFETTARIO_SOGLIA - feeYTD)}`}
        </p>
      </div>

      {/* Deal in scadenza */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-[#E87A2E]" />
          <h3 className="text-sm font-semibold text-[#1A1A1A]">
            Deal in Scadenza
          </h3>
        </div>
        {upcomingDeals.length > 0 ? (
          <div className="space-y-3">
            {upcomingDeals.map((deal) => {
              const days = daysRemaining(deal.expected_close ?? null);
              return (
                <Link
                  key={deal.id}
                  href={`/mandati`}
                  className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAFA] transition-colors rounded px-1"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-[#9CA3AF]">
                        {deal.code}
                      </span>
                      <Badge
                        variant="outline"
                        className={DEAL_STATUS_COLORS[deal.status] + " text-[10px] px-1.5 py-0 h-4"}
                      >
                        {DEAL_STATUS_LABELS[deal.status]}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">
                      {deal.title}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">
                      {deal.company?.name} · {formatDateShort(deal.expected_close)}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap ml-3 ${
                      days !== null && days <= 7
                        ? "text-red-600"
                        : days !== null && days <= 14
                        ? "text-amber-600"
                        : "text-[#6B7280]"
                    }`}
                  >
                    {days}g
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Briefcase className="h-8 w-8 text-[#D1D5DB] mb-2" />
            <p className="text-sm text-[#9CA3AF]">
              Nessun deal in scadenza nei prossimi 30 giorni
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
