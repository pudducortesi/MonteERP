"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { KPICard } from "@/components/dashboard/KPICard";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  ListTodo,
  Phone,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, Activity, Deal, User, TaskStatus, TaskPriority } from "@/types";

type TaskWithRelations = Task & {
  deal?: Pick<Deal, "id" | "code" | "title"> | null;
  assignee?: Pick<User, "id" | "full_name"> | null;
};

type ActivityWithRelations = Activity & {
  deal?: Pick<Deal, "id" | "code" | "title"> | null;
  user?: Pick<User, "id" | "full_name"> | null;
};

const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Da fare",
  in_progress: "In corso",
  done: "Completato",
  cancelled: "Annullato",
};

const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "bg-gray-50 text-gray-600 border-gray-200",
  medium: "bg-blue-50 text-blue-600 border-blue-200",
  high: "bg-orange-50 text-orange-600 border-orange-200",
};

function StatusIcon({ status }: { status: TaskStatus }) {
  switch (status) {
    case "done":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "in_progress":
      return <Clock className="h-4 w-4 text-[#E87A2E]" />;
    case "cancelled":
      return <AlertCircle className="h-4 w-4 text-gray-400" />;
    default:
      return <Circle className="h-4 w-4 text-[#9CA3AF]" />;
  }
}

function groupByDate<T extends { due_date?: string | null; created_at: string }>(
  items: T[],
  dateField: "due_date" | "created_at"
): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    const raw = dateField === "due_date" ? (item.due_date || item.created_at) : item.created_at;
    const date = new Date(raw).toLocaleDateString("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
  }
  return groups;
}

export default function CalendarPage() {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [activities, setActivities] = useState<ActivityWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"tasks" | "activities">("tasks");
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const [tasksRes, activitiesRes] = await Promise.all([
      supabase
        .from("tasks")
        .select("*, deal:deals(id, code, title), assignee:users!assigned_to(id, full_name)")
        .in("status", ["todo", "in_progress"])
        .order("due_date", { ascending: true, nullsFirst: false }),
      supabase
        .from("activities")
        .select("*, deal:deals(id, code, title), user:users!user_id(id, full_name)")
        .in("activity_type", ["call", "meeting"])
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    if (tasksRes.data) setTasks(tasksRes.data as unknown as TaskWithRelations[]);
    if (activitiesRes.data) setActivities(activitiesRes.data as unknown as ActivityWithRelations[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const highPriorityCount = tasks.filter((t) => t.priority === "high").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const taskGroups = groupByDate(tasks, "due_date");
  const activityGroups = groupByDate(activities, "created_at");

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Calendario</h1>
        <p className="text-sm text-[#6B7280]">
          {tasks.length} task attive &middot; {activities.length} attività recenti
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard label="Task Attive" value={tasks.length.toString()} description={`${inProgressCount} in corso`} icon={ListTodo} />
        <KPICard label="Alta Priorità" value={highPriorityCount.toString()} description="Richiedono attenzione" icon={AlertCircle} />
        <KPICard label="Meeting & Call" value={activities.length.toString()} description="Attività recenti" icon={Phone} />
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView("tasks")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            view === "tasks"
              ? "bg-[#E87A2E] text-white"
              : "bg-white text-[#1A1A1A] border border-[#E5E7EB] hover:bg-[#FAFAFA]"
          )}
        >
          Task ({tasks.length})
        </button>
        <button
          onClick={() => setView("activities")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            view === "activities"
              ? "bg-[#E87A2E] text-white"
              : "bg-white text-[#1A1A1A] border border-[#E5E7EB] hover:bg-[#FAFAFA]"
          )}
        >
          Attività ({activities.length})
        </button>
      </div>

      {/* Tasks View */}
      {view === "tasks" && (
        <>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-[#E5E7EB]">
              <CalendarIcon className="h-8 w-8 text-[#D1D5DB] mb-2" />
              <p className="text-sm text-[#9CA3AF]">Nessuna task attiva</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(taskGroups).map(([date, dateTasks]) => (
                <div key={date}>
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2 capitalize">
                    {date}
                  </h3>
                  <div className="bg-white rounded-lg border border-[#E5E7EB] divide-y divide-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    {dateTasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-3 p-3 hover:bg-[#FAFAFA] transition-colors">
                        <StatusIcon status={task.status} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1A1A1A] truncate">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {task.deal && (
                              <Link href={`/pipeline/${task.deal.id}`} className="text-xs text-[#6B7280] hover:text-[#E87A2E] transition-colors">
                                {task.deal.code} — {task.deal.title}
                              </Link>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] px-1.5 py-0 h-4", TASK_PRIORITY_COLORS[task.priority])}
                        >
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-[#6B7280] border-[#E5E7EB]">
                          {TASK_STATUS_LABELS[task.status]}
                        </Badge>
                        {task.assignee && (
                          <span className="text-xs text-[#6B7280] whitespace-nowrap">
                            {task.assignee.full_name}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Activities View */}
      {view === "activities" && (
        <>
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-[#E5E7EB]">
              <CalendarIcon className="h-8 w-8 text-[#D1D5DB] mb-2" />
              <p className="text-sm text-[#9CA3AF]">Nessuna attività recente</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(activityGroups).map(([date, dateActivities]) => (
                <div key={date}>
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2 capitalize">
                    {date}
                  </h3>
                  <div className="bg-white rounded-lg border border-[#E5E7EB] divide-y divide-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    {dateActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 hover:bg-[#FAFAFA] transition-colors">
                        <div className="flex items-center justify-center h-7 w-7 rounded-full bg-[#E87A2E]/10 shrink-0">
                          {activity.activity_type === "meeting" ? (
                            <Users className="h-3.5 w-3.5 text-[#E87A2E]" />
                          ) : (
                            <Phone className="h-3.5 w-3.5 text-[#E87A2E]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1A1A1A] truncate">
                            {activity.title}
                          </p>
                          {activity.deal && (
                            <Link href={`/pipeline/${activity.deal.id}`} className="text-xs text-[#6B7280] hover:text-[#E87A2E] transition-colors">
                              {activity.deal.code} — {activity.deal.title}
                            </Link>
                          )}
                        </div>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-[#E87A2E]/5 text-[#E87A2E] border-[#E87A2E]/20">
                          {activity.activity_type === "meeting" ? "Meeting" : "Call"}
                        </Badge>
                        {activity.user && (
                          <span className="text-xs text-[#6B7280] whitespace-nowrap">
                            {activity.user.full_name}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
