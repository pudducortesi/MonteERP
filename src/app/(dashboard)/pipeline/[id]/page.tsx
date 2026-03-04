"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Pencil } from "lucide-react";
import { DealForm } from "@/components/pipeline/DealForm";
import { DealOverview } from "@/components/pipeline/DealOverview";
import { DealTimeline } from "@/components/pipeline/DealTimeline";
import { DealTeam } from "@/components/pipeline/DealTeam";
import { DealDocuments } from "@/components/pipeline/DealDocuments";
import { DealFee } from "@/components/pipeline/DealFee";
import { cn } from "@/lib/utils";
import {
  DEAL_STATUS_LABELS,
  DEAL_STATUS_COLORS,
  DEAL_PRIORITY_COLORS,
  PRACTICE_AREA_LABELS,
  PRACTICE_AREA_COLORS,
  formatCurrency,
  daysInStage,
  formatDateShort,
} from "@/lib/utils/deal";
import { calculateFee } from "@/lib/utils/fee";
import type { DealWithRelations, Activity, User, Task } from "@/types";

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;

  const [deal, setDeal] = useState<DealWithRelations | null>(null);
  const [activities, setActivities] = useState<(Activity & { user?: User })[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const supabase = createClient();

  const fetchDeal = useCallback(async () => {
    const { data } = await supabase
      .from("deals")
      .select(`
        *,
        company:companies(*),
        deal_members(
          deal_id,
          user_id,
          role_in_deal,
          joined_at,
          user:users(id, full_name, email, role, avatar_url)
        )
      `)
      .eq("id", dealId)
      .single();

    if (data) setDeal(data as unknown as DealWithRelations);
    setLoading(false);
  }, [supabase, dealId]);

  const fetchActivities = useCallback(async () => {
    const { data } = await supabase
      .from("activities")
      .select("*, user:users(id, full_name)")
      .eq("deal_id", dealId)
      .order("created_at", { ascending: false });

    if (data) setActivities(data as unknown as (Activity & { user?: User })[]);
  }, [supabase, dealId]);

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("deal_id", dealId)
      .order("due_date", { ascending: true });

    if (data) setTasks(data as Task[]);
  }, [supabase, dealId]);

  useEffect(() => {
    fetchDeal();
    fetchActivities();
    fetchTasks();
  }, [fetchDeal, fetchActivities, fetchTasks]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-16" />)}
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="text-center py-16">
        <p className="text-[#9CA3AF]">Deal non trovato</p>
        <Button variant="link" onClick={() => router.push("/pipeline")} className="text-[#E87A2E]">
          Torna alla pipeline
        </Button>
      </div>
    );
  }

  const feeEstimated = calculateFee(deal.deal_value ?? 0, deal.success_fee_pct ?? 0, deal.success_fee_min ?? 0);
  const daysSince = deal.mandate_date ? daysInStage(deal.mandate_date) : null;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mt-0.5 h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono text-[#9CA3AF]">
                {deal.code}
              </span>
              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4", DEAL_STATUS_COLORS[deal.status])}>
                {DEAL_STATUS_LABELS[deal.status]}
              </Badge>
              <div className={cn("h-2 w-2 rounded-full", DEAL_PRIORITY_COLORS[deal.priority])} />
              {deal.practice_area && (
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4 font-normal", PRACTICE_AREA_COLORS[deal.practice_area])}>
                  {PRACTICE_AREA_LABELS[deal.practice_area]}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-semibold text-[#1A1A1A] mt-1">
              {deal.title}
            </h1>
            {deal.company && (
              <Link href={`/crm/companies/${deal.company.id}`} className="text-sm text-[#6B7280] hover:text-[#E87A2E] transition-colors">
                {deal.company.name}
              </Link>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setFormOpen(true)}
          className="border-[#E5E7EB] h-8"
        >
          <Pencil className="h-3.5 w-3.5 mr-1" />
          Modifica
        </Button>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Valore Deal", value: formatCurrency(deal.deal_value) },
          { label: "Fee %", value: deal.success_fee_pct ? `${deal.success_fee_pct}%` : "—" },
          { label: "Fee Stimata", value: formatCurrency(feeEstimated || null) },
          { label: "Retainer", value: deal.retainer_monthly ? `${formatCurrency(deal.retainer_monthly)}/mese` : "—" },
          { label: "Giorni Mandato", value: daysSince !== null ? `${daysSince}g` : "—" },
          { label: "Chiusura Prevista", value: formatDateShort(deal.expected_close) },
        ].map((metric) => (
          <div key={metric.label} className="bg-white rounded-lg border border-[#E5E7EB] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wide">{metric.label}</p>
            <p className="text-sm font-semibold text-[#1A1A1A] mt-0.5">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="bg-white border border-[#E5E7EB]">
          <TabsTrigger value="overview" className="data-[state=active]:text-[#E87A2E]">Overview</TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:text-[#E87A2E]">Timeline</TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:text-[#E87A2E]">Team</TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:text-[#E87A2E]">Documenti</TabsTrigger>
          <TabsTrigger value="fee" className="data-[state=active]:text-[#E87A2E]">Fee</TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:text-[#E87A2E]">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <DealOverview deal={deal} />
        </TabsContent>

        <TabsContent value="timeline">
          <DealTimeline activities={activities} dealId={dealId} onActivityAdded={fetchActivities} />
        </TabsContent>

        <TabsContent value="team">
          <DealTeam
            dealId={deal.id}
            members={deal.deal_members ?? []}
            onMemberChanged={() => {
              fetchDeal();
              fetchActivities();
            }}
          />
        </TabsContent>

        <TabsContent value="documents">
          <DealDocuments dealId={deal.id} />
        </TabsContent>

        <TabsContent value="fee">
          <DealFee deal={deal} />
        </TabsContent>

        <TabsContent value="tasks">
          <DealTasks tasks={tasks} dealId={dealId} onTaskChanged={fetchTasks} />
        </TabsContent>
      </Tabs>

      <DealForm
        open={formOpen}
        onOpenChange={setFormOpen}
        deal={deal}
        onSaved={() => {
          fetchDeal();
          fetchActivities();
        }}
      />
    </div>
  );
}

function DealTasks({
  tasks,
  dealId,
  onTaskChanged,
}: {
  tasks: Task[];
  dealId: string;
  onTaskChanged: () => void;
}) {
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const supabase = createClient();

  async function addTask() {
    if (!title.trim()) return;
    setAdding(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("tasks").insert({
        deal_id: dealId,
        title: title.trim(),
        created_by: user.id,
        assigned_to: user.id,
      });
    }
    setTitle("");
    setAdding(false);
    onTaskChanged();
  }

  async function toggleTask(taskId: string, currentStatus: string) {
    const newStatus = currentStatus === "done" ? "todo" : "done";
    await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId);
    onTaskChanged();
  }

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Aggiungi task..."
          className="flex-1 px-3 py-2 text-sm border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#E87A2E]/20 focus:border-[#E87A2E]"
        />
        <Button
          onClick={addTask}
          disabled={adding || !title.trim()}
          className="bg-[#E87A2E] hover:bg-[#D16A1E] text-white h-9"
          size="sm"
        >
          Aggiungi
        </Button>
      </div>
      {tasks.length > 0 ? (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 py-2 border-b border-[#F3F4F6] last:border-0"
            >
              <button
                onClick={() => toggleTask(task.id, task.status)}
                className={cn(
                  "h-4 w-4 rounded border-2 flex items-center justify-center transition-colors",
                  task.status === "done"
                    ? "bg-[#10B981] border-[#10B981]"
                    : "border-[#D1D5DB] hover:border-[#E87A2E]"
                )}
              >
                {task.status === "done" && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className={cn("text-sm flex-1", task.status === "done" ? "line-through text-[#9CA3AF]" : "text-[#1A1A1A]")}>
                {task.title}
              </span>
              {task.due_date && (
                <span className="text-xs text-[#9CA3AF]">
                  {formatDateShort(task.due_date)}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#9CA3AF] text-center py-4">Nessun task collegato</p>
      )}
    </div>
  );
}
