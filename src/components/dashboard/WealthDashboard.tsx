"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatPercent, getGreeting } from "@/lib/utils/format";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  User,
  Asset,
  Entity,
  Liability,
  AssetClass,
  AssetHistory,
  AssetTransaction,
} from "@/types";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Building2,
  Landmark,
  Droplets,
  ArrowUpRight,
  Minus,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────

const CHART_COLORS = [
  "#E87A2E",
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#F59E0B",
  "#06B6D4",
  "#EF4444",
  "#EC4899",
  "#6366F1",
];

const CARD_STYLE =
  "bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]";

// ── Helpers ──────────────────────────────────────────────

function firstName(fullName: string): string {
  return fullName.split(" ")[0] || fullName;
}

function monthLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("it-IT", { month: "short", year: "2-digit" });
}

// ── Component ────────────────────────────────────────────

interface WealthDashboardProps {
  user: User;
}

export function WealthDashboard({ user }: WealthDashboardProps) {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [assetClasses, setAssetClasses] = useState<AssetClass[]>([]);
  const [assetHistory, setAssetHistory] = useState<AssetHistory[]>([]);
  const [transactions, setTransactions] = useState<AssetTransaction[]>([]);

  // ── Data fetching ────────────────────────────────────

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const [
        { data: assetsData },
        { data: entitiesData },
        { data: liabilitiesData },
        { data: classesData },
        { data: historyData },
        { data: txData },
      ] = await Promise.all([
        supabase.from("assets").select("*").eq("user_id", user.id),
        supabase.from("entities").select("*").eq("user_id", user.id),
        supabase.from("liabilities").select("*").eq("user_id", user.id),
        supabase.from("asset_classes").select("*").eq("user_id", user.id),
        supabase.from("asset_history").select("*"),
        supabase.from("asset_transactions").select("*").eq("user_id", user.id),
      ]);

      setAssets((assetsData as Asset[]) ?? []);
      setEntities((entitiesData as Entity[]) ?? []);
      setLiabilities((liabilitiesData as Liability[]) ?? []);
      setAssetClasses((classesData as AssetClass[]) ?? []);
      setAssetHistory((historyData as AssetHistory[]) ?? []);
      setTransactions((txData as AssetTransaction[]) ?? []);
      setLoading(false);
    }

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  // ── Derived KPIs ─────────────────────────────────────

  const totalAssets = useMemo(
    () => assets.reduce((s, a) => s + a.current_value, 0),
    [assets]
  );

  const totalLiabilities = useMemo(
    () => liabilities.reduce((s, l) => s + l.current_balance, 0),
    [liabilities]
  );

  const netWorth = totalAssets - totalLiabilities;

  const liquidita = useMemo(
    () =>
      assets
        .filter((a) => a.is_liquid)
        .reduce((s, a) => s + a.current_value, 0),
    [assets]
  );

  const monthlyIncome = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return transactions
      .filter(
        (t) => t.type === "income" && new Date(t.date) >= thirtyDaysAgo
      )
      .reduce((s, t) => s + t.amount, 0);
  }, [transactions]);

  // ── Previous month delta ─────────────────────────────

  const { changeAmount, changePercent } = useMemo(() => {
    if (assetHistory.length === 0)
      return { changeAmount: 0, changePercent: 0 };

    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const prevEntries = assetHistory.filter((h) => {
      const d = new Date(h.date);
      return d >= prevMonth && d <= prevMonthEnd;
    });

    if (prevEntries.length === 0)
      return { changeAmount: 0, changePercent: 0 };

    const prevTotal = prevEntries.reduce((s, h) => s + h.value, 0);
    const change = totalAssets - prevTotal;
    const pct = prevTotal !== 0 ? (change / prevTotal) * 100 : 0;
    return { changeAmount: change, changePercent: pct };
  }, [assetHistory, totalAssets]);

  // ── Chart: Net Worth over time (last 12 months) ─────

  const networthTimeline = useMemo(() => {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const filtered = assetHistory.filter(
      (h) => new Date(h.date) >= twelveMonthsAgo
    );

    const grouped: Record<string, number> = {};
    for (const h of filtered) {
      const key = h.date.slice(0, 7); // YYYY-MM
      grouped[key] = (grouped[key] ?? 0) + h.value;
    }

    const months: { month: string; value: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({
        month: monthLabel(d.toISOString()),
        value: grouped[key] ?? 0,
      });
    }
    return months;
  }, [assetHistory]);

  // ── Chart: Asset Allocation per Classe ──────────────

  const classAllocation = useMemo(() => {
    const map: Record<string, { name: string; value: number }> = {};
    for (const a of assets) {
      const cls = assetClasses.find((c) => c.id === a.asset_class_id);
      const name = cls?.name ?? "Non classificato";
      if (!map[name]) map[name] = { name, value: 0 };
      map[name].value += a.current_value;
    }
    return Object.values(map)
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [assets, assetClasses]);

  // ── Chart: Distribution per Entity ──────────────────

  const entityDistribution = useMemo(() => {
    const map: Record<string, { name: string; value: number; color?: string | null }> = {};

    for (const a of assets) {
      const ent = entities.find((e) => e.id === a.entity_id);
      const name = ent?.name ?? "Senza entità";
      if (!map[name]) map[name] = { name, value: 0, color: ent?.color };
      map[name].value += a.current_value;
    }

    for (const l of liabilities) {
      const ent = entities.find((e) => e.id === l.entity_id);
      const name = ent?.name ?? "Senza entità";
      if (!map[name]) map[name] = { name, value: 0, color: ent?.color };
      map[name].value -= l.current_balance;
    }

    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [assets, liabilities, entities]);

  // ── Top 10 Assets ───────────────────────────────────

  const top10 = useMemo(() => {
    return [...assets]
      .sort((a, b) => b.current_value - a.current_value)
      .slice(0, 10)
      .map((a) => ({
        ...a,
        entityName: entities.find((e) => e.id === a.entity_id)?.name ?? "—",
        className:
          assetClasses.find((c) => c.id === a.asset_class_id)?.name ?? "—",
        pct: totalAssets > 0 ? (a.current_value / totalAssets) * 100 : 0,
      }));
  }, [assets, entities, assetClasses, totalAssets]);

  // ── KPI cards config ─────────────────────────────────

  const kpis = [
    {
      label: "Totale Asset",
      value: totalAssets,
      color: "#4ECDC4",
      icon: Wallet,
    },
    {
      label: "Totale Passività",
      value: totalLiabilities,
      color: "#FF6B6B",
      icon: Building2,
    },
    {
      label: "Patrimonio Netto",
      value: netWorth,
      color: "#E87A2E",
      icon: Landmark,
    },
    {
      label: "Liquidità",
      value: liquidita,
      color: "#06B6D4",
      icon: Droplets,
    },
    {
      label: "Reddito Mensile",
      value: monthlyIncome,
      color: "#8B5CF6",
      icon: ArrowUpRight,
    },
  ];

  // ── Custom tooltip ───────────────────────────────────

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { value: number }[];
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 shadow-lg">
        <p className="text-xs text-[#6B7280]">{label}</p>
        <p className="text-sm font-semibold text-[#1A1A1A]">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Header ──────────────────────────────────────── */}
      <section className="animate-fade-in">
        <p className="text-[#6B7280] text-base">
          {getGreeting()},{" "}
          <span className="font-medium text-[#1A1A1A]">
            {firstName(user.full_name)}
          </span>
        </p>

        <div className="mt-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:gap-4">
          <div>
            <p className="text-sm uppercase tracking-wider text-[#9CA3AF]">
              Patrimonio Netto
            </p>
            <p className="text-5xl font-bold tracking-tight text-[#1A1A1A]">
              {formatCurrency(netWorth)}
            </p>
          </div>

          <div className="flex items-center gap-1.5 pb-2">
            {changeAmount >= 0 ? (
              <TrendingUp className="h-4 w-4 text-[#4ECDC4]" />
            ) : (
              <TrendingDown className="h-4 w-4 text-[#FF6B6B]" />
            )}
            <span
              className={`text-sm font-medium ${
                changeAmount >= 0 ? "text-[#4ECDC4]" : "text-[#FF6B6B]"
              }`}
            >
              {formatCurrency(Math.abs(changeAmount))} (
              {formatPercent(changePercent)})
            </span>
            <span className="text-xs text-[#9CA3AF]">vs mese precedente</span>
          </div>
        </div>
      </section>

      {/* ── KPI Cards ───────────────────────────────────── */}
      <section className="animate-fade-in grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className={CARD_STYLE}>
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${kpi.color}15` }}
                >
                  <Icon className="h-4 w-4" style={{ color: kpi.color }} />
                </div>
                <p className="text-xs font-medium text-[#6B7280]">
                  {kpi.label}
                </p>
              </div>
              <p className="mt-3 text-xl font-bold text-[#1A1A1A]">
                {formatCurrency(kpi.value)}
              </p>
            </div>
          );
        })}
      </section>

      {/* ── Charts Row 1 ────────────────────────────────── */}
      <section className="animate-fade-in grid gap-6 lg:grid-cols-2">
        {/* Net Worth nel Tempo */}
        <div className={CARD_STYLE}>
          <h3 className="mb-4 text-sm font-semibold text-[#1A1A1A]">
            Net Worth nel Tempo
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={networthTimeline}>
                <defs>
                  <linearGradient
                    id="networth-gradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#E87A2E"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor="#E87A2E"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1_000_000
                      ? `${(v / 1_000_000).toFixed(1)}M`
                      : v >= 1_000
                        ? `${Math.round(v / 1_000)}k`
                        : String(v)
                  }
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#E87A2E"
                  strokeWidth={2.5}
                  fill="url(#networth-gradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Allocation per Classe */}
        <div className={CARD_STYLE}>
          <h3 className="mb-4 text-sm font-semibold text-[#1A1A1A]">
            Asset Allocation per Classe
          </h3>
          <div className="flex h-64 items-center">
            <div className="h-full w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="85%"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {classAllocation.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #E5E7EB",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex w-1/2 flex-col gap-2 pl-2">
              {classAllocation.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                    }}
                  />
                  <span className="truncate text-xs text-[#6B7280]">
                    {item.name}
                  </span>
                  <span className="ml-auto text-xs font-medium text-[#1A1A1A]">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Charts Row 2 ────────────────────────────────── */}
      <section className="animate-fade-in grid gap-6 lg:grid-cols-2">
        {/* Distribuzione per Entità */}
        <div className={CARD_STYLE}>
          <h3 className="mb-4 text-sm font-semibold text-[#1A1A1A]">
            Distribuzione per Entit&agrave;
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={entityDistribution}
                layout="vertical"
                margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1_000_000
                      ? `${(v / 1_000_000).toFixed(1)}M`
                      : v >= 1_000
                        ? `${Math.round(v / 1_000)}k`
                        : String(v)
                  }
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                  {entityDistribution.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.color ?? CHART_COLORS[i % CHART_COLORS.length]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 Asset */}
        <div className={CARD_STYLE}>
          <h3 className="mb-4 text-sm font-semibold text-[#1A1A1A]">
            Top 10 Asset
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="pb-2 font-medium text-[#9CA3AF]">Nome</th>
                  <th className="pb-2 font-medium text-[#9CA3AF]">
                    Entit&agrave;
                  </th>
                  <th className="pb-2 font-medium text-[#9CA3AF]">Classe</th>
                  <th className="pb-2 text-right font-medium text-[#9CA3AF]">
                    Valore
                  </th>
                  <th className="pb-2 text-right font-medium text-[#9CA3AF]">
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {top10.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-[#E5E7EB] last:border-0"
                  >
                    <td className="max-w-[120px] truncate py-2.5 font-medium text-[#1A1A1A]">
                      {a.name}
                    </td>
                    <td className="py-2.5 text-[#6B7280]">{a.entityName}</td>
                    <td className="py-2.5 text-[#6B7280]">{a.className}</td>
                    <td className="py-2.5 text-right font-medium text-[#1A1A1A]">
                      {formatCurrency(a.current_value)}
                    </td>
                    <td className="py-2.5 text-right text-[#6B7280]">
                      {a.pct.toFixed(1)}%
                    </td>
                  </tr>
                ))}
                {top10.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-[#9CA3AF]"
                    >
                      Nessun asset presente
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Loading skeleton ─────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="mt-4 h-12 w-72" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-3 h-7 w-28" />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-4 h-64 w-full" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-4 h-64 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
