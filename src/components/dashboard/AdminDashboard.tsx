"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Briefcase,
  Phone,
  Mail,
  FileText,
  RefreshCcw,
  Calendar,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { KPICard } from "@/components/dashboard/KPICard";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import {
  formatCurrency,
  formatDateShort,
  formatRelativeTime,
  getGreeting,
  PRACTICE_AREA_LABELS,
  PRACTICE_AREA_CHART_COLORS,
  DEAL_STATUS_LABELS,
  DEAL_STATUS_COLORS,
  daysRemaining,
} from "@/lib/utils/deal";
import type {
  User,
  DealWithRelations,
  Activity,
  PracticeArea,
} from "@/types";

interface AdminDashboardProps {
  user: User;
}

const ACTIVITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  meeting: Users,
  email: Mail,
  note: FileText,
  status_change: RefreshCcw,
  document_upload: FileText,
};

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [deals, setDeals] = useState<DealWithRelations[]>([]);
  const [activities, setActivities] = useState<(Activity & { user?: User | null })[]>([]);
  const [advisors, setAdvisors] = useState<User[]>([]);
  const [feePaid, setFeePaid] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const [dealsRes, activitiesRes, advisorsRes, feesRes] = await Promise.all([
      supabase
        .from("deals")
        .select("*, company:companies(id, name), deal_members(deal_id, user_id, role_in_deal, joined_at, user:users(id, full_name, avatar_url))")
        .order("updated_at", { ascending: false }),
      supabase
        .from("activities")
        .select("*, user:users(id, full_name, avatar_url)")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("users")
        .select("*")
        .in("role", ["admin", "advisor"])
        .eq("is_active", true),
      supabase
        .from("success_fees")
        .select("paid_amount, payment_status"),
    ]);

    if (dealsRes.data) setDeals(dealsRes.data as unknown as DealWithRelations[]);
    if (activitiesRes.data) setActivities(activitiesRes.data as unknown as (Activity & { user?: User | null })[]);
    if (advisorsRes.data) setAdvisors(advisorsRes.data as User[]);
    if (feesRes.data) {
      const totalPaid = feesRes.data.reduce((sum, f) => sum + (f.paid_amount || 0), 0);
      setFeePaid(totalPaid);
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
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const activeDeals = deals.filter(
    (d) => !["completed", "lost", "on_hold"].includes(d.status)
  );
  const pipelineValue = activeDeals.reduce(
    (sum, d) => sum + (d.deal_value || 0),
    0
  );
  const feeForecast = activeDeals.reduce((sum, d) => {
    const fee =
      d.success_fee_pct && d.deal_value
        ? (d.deal_value * d.success_fee_pct) / 100
        : 0;
    return sum + Math.max(fee, d.success_fee_min || 0);
  }, 0);

  // Pipeline per Practice Area
  const practiceAreaData = Object.entries(PRACTICE_AREA_LABELS)
    .map(([key, label]) => {
      const areaDeals = activeDeals.filter(
        (d) => d.practice_area === key
      );
      return {
        key: key as PracticeArea,
        name: label,
        count: areaDeals.length,
        value: areaDeals.reduce((s, d) => s + (d.deal_value || 0), 0),
      };
    })
    .filter((d) => d.count > 0)
    .sort((a, b) => b.value - a.value);

  // Pipeline funnel
  const funnelData = [
    "prospect",
    "pitch",
    "mandate_signed",
    "analysis",
    "marketing",
    "negotiation",
    "closing",
  ].map((status) => ({
    name: DEAL_STATUS_LABELS[status as keyof typeof DEAL_STATUS_LABELS],
    count: deals.filter((d) => d.status === status).length,
  }));

  // Deal in scadenza (30 giorni)
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

  // Team workload
  const teamWorkload = advisors.map((advisor) => {
    const advisorDeals = activeDeals.filter((d) =>
      d.deal_members?.some((m) => m.user_id === advisor.id)
    );
    return {
      ...advisor,
      dealCount: advisorDeals.length,
    };
  });

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">
          {getGreeting()}, {user.full_name.split(" ")[0]}
        </h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          Panoramica del gestionale Montesino
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Deal Attivi"
          value={String(activeDeals.length)}
          description="In pipeline"
          icon={Briefcase}
        />
        <KPICard
          label="Pipeline Value"
          value={formatCurrency(pipelineValue)}
          description="Valore totale"
          icon={BarChart3}
        />
        <KPICard
          label="Fee Forecast"
          value={formatCurrency(feeForecast)}
          description="Success fee attese"
          icon={TrendingUp}
        />
        <KPICard
          label="Fee Incassate YTD"
          value={formatCurrency(feePaid)}
          description="Anno corrente"
          icon={DollarSign}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pipeline per Practice Area */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] animate-fade-in">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">
            Pipeline per Practice Area
          </h3>
          {practiceAreaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={practiceAreaData}
                layout="vertical"
                margin={{ left: 0, right: 20, top: 0, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [
                    formatCurrency(value as number),
                    "Valore",
                  ]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {practiceAreaData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={PRACTICE_AREA_CHART_COLORS[entry.key]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 className="h-8 w-8 text-[#D1D5DB] mb-2" />
              <p className="text-sm text-[#9CA3AF]">
                Nessun deal con practice area assegnata
              </p>
            </div>
          )}
        </div>

        {/* Pipeline Funnel */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] animate-fade-in">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">
            Pipeline Funnel
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={funnelData}
              margin={{ left: 0, right: 10, top: 0, bottom: 0 }}
            >
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
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #E5E7EB",
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="count"
                fill="#E87A2E"
                radius={[4, 4, 0, 0]}
                barSize={32}
                name="Deal"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom sections */}
      <div className="grid gap-6 lg:grid-cols-2">
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
                  <div
                    key={deal.id}
                    className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0"
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
                  </div>
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

        {/* Attività Recenti */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] animate-fade-in">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">
            Attività Recenti
          </h3>
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.slice(0, 6).map((activity) => {
                const ActivityIcon =
                  ACTIVITY_ICONS[activity.activity_type] || FileText;
                const initials =
                  activity.user?.full_name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "?";
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 py-2 border-b border-[#F3F4F6] last:border-0"
                  >
                    <Avatar className="h-7 w-7 mt-0.5">
                      <AvatarFallback className="bg-[#F3F4F6] text-[#6B7280] text-[10px]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <ActivityIcon className="h-3.5 w-3.5 text-[#9CA3AF]" />
                        <p className="text-sm text-[#1A1A1A] truncate">
                          {activity.title}
                        </p>
                      </div>
                      {activity.description && (
                        <p className="text-xs text-[#9CA3AF] truncate mt-0.5">
                          {activity.description}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] text-[#9CA3AF] whitespace-nowrap">
                      {formatRelativeTime(activity.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BarChart3 className="h-8 w-8 text-[#D1D5DB] mb-2" />
              <p className="text-sm text-[#9CA3AF]">
                Nessuna attività recente
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Team Workload */}
      {teamWorkload.length > 0 && (
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-[#E87A2E]" />
            <h3 className="text-sm font-semibold text-[#1A1A1A]">
              Team Workload
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {teamWorkload.map((advisor) => {
              const maxDeals = Math.max(...teamWorkload.map((a) => a.dealCount), 1);
              const pct = (advisor.dealCount / maxDeals) * 100;
              const initials = advisor.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              return (
                <div
                  key={advisor.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[#F3F4F6]"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-[#E87A2E] text-white text-xs font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">
                      {advisor.full_name}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">
                      {advisor.dealCount} deal attivi
                    </p>
                    <div className="mt-1.5 h-1.5 w-full bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#E87A2E] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
