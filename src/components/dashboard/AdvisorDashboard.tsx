"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Briefcase,
  CheckSquare,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import {
  formatCurrency,
  formatDateShort,
  getGreeting,
  DEAL_STATUS_LABELS,
  DEAL_STATUS_COLORS,
  PRACTICE_AREA_LABELS,
  PRACTICE_AREA_COLORS,
} from "@/lib/utils/deal";
import type { User, DealWithRelations, Task } from "@/types";

interface AdvisorDashboardProps {
  user: User;
}

export function AdvisorDashboard({ user }: AdvisorDashboardProps) {
  const [deals, setDeals] = useState<DealWithRelations[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const [dealsRes, tasksRes] = await Promise.all([
      supabase
        .from("deals")
        .select("*, company:companies(id, name), deal_members(deal_id, user_id, role_in_deal, joined_at)")
        .order("updated_at", { ascending: false }),
      supabase
        .from("tasks")
        .select("*")
        .eq("assigned_to", user.id)
        .in("status", ["todo", "in_progress"])
        .order("due_date", { ascending: true })
        .limit(5),
    ]);

    if (dealsRes.data) {
      const myDeals = (dealsRes.data as unknown as DealWithRelations[]).filter(
        (d) => d.deal_members?.some((m) => m.user_id === user.id)
      );
      setDeals(myDeals);
    }
    if (tasksRes.data) setTasks(tasksRes.data as Task[]);
    setLoading(false);
  }, [supabase, user.id]);

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
      </div>
    );
  }

  const activeDeals = deals.filter((d) => !["completed", "lost", "on_hold"].includes(d.status));
  const pipelineValue = activeDeals.reduce((s, d) => s + (d.deal_value || 0), 0);
  const feeForecast = activeDeals.reduce((sum, d) => {
    const fee = d.success_fee_pct && d.deal_value ? (d.deal_value * d.success_fee_pct) / 100 : 0;
    return sum + Math.max(fee, d.success_fee_min || 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">
          {getGreeting()}, {user.full_name.split(" ")[0]}
        </h1>
        <p className="text-sm text-[#6B7280] mt-0.5">I tuoi deal e task</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="I Miei Deal" value={String(activeDeals.length)} description="Attivi" icon={Briefcase} />
        <KPICard label="Pipeline Value" value={formatCurrency(pipelineValue)} description="I miei deal" icon={BarChart3} />
        <KPICard label="Fee Forecast" value={formatCurrency(feeForecast)} description="Attese" icon={TrendingUp} />
        <KPICard label="Task Aperti" value={String(tasks.length)} description="A me assegnati" icon={CheckSquare} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* My deals */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">I Tuoi Deal</h3>
          {activeDeals.length > 0 ? (
            <div className="space-y-3">
              {activeDeals.slice(0, 6).map((deal) => (
                <Link
                  key={deal.id}
                  href={`/pipeline/${deal.id}`}
                  className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0 hover:bg-[#F9FAFB] -mx-2 px-2 rounded transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">{deal.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[#9CA3AF]">{deal.company?.name}</span>
                      {deal.practice_area && (
                        <Badge variant="outline" className={PRACTICE_AREA_COLORS[deal.practice_area] + " text-[10px] px-1.5 py-0 h-4"}>
                          {PRACTICE_AREA_LABELS[deal.practice_area]}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className={DEAL_STATUS_COLORS[deal.status] + " text-[10px] px-1.5 py-0 h-4 ml-2"}>
                    {DEAL_STATUS_LABELS[deal.status]}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Briefcase className="h-8 w-8 text-[#D1D5DB] mb-2" />
              <p className="text-sm text-[#9CA3AF]">Nessun deal assegnato</p>
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Task in Scadenza</h3>
          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">{task.title}</p>
                    <p className="text-xs text-[#9CA3AF]">{task.due_date ? formatDateShort(task.due_date) : "Senza scadenza"}</p>
                  </div>
                  <Badge variant="outline" className={task.priority === "high" ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-gray-50 text-gray-600 border-gray-200"}>
                    {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Bassa"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckSquare className="h-8 w-8 text-[#D1D5DB] mb-2" />
              <p className="text-sm text-[#9CA3AF]">Nessun task in scadenza</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
