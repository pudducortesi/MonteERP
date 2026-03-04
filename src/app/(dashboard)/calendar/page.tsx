"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarIcon, Clock, CheckCircle2, Circle, AlertCircle } from "lucide-react";
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
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
};

function StatusIcon({ status }: { status: TaskStatus }) {
  switch (status) {
    case "done":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "in_progress":
      return <Clock className="h-4 w-4 text-blue-600" />;
    case "cancelled":
      return <AlertCircle className="h-4 w-4 text-gray-400" />;
    default:
      return <Circle className="h-4 w-4 text-gray-400" />;
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

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const taskGroups = groupByDate(tasks, "due_date");
  const activityGroups = groupByDate(activities, "created_at");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Calendario</h1>
        <p className="text-sm text-muted-foreground">
          {tasks.length} task attive &middot; {activities.length} attività recenti
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView("tasks")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            view === "tasks"
              ? "bg-[#1B2A4A] text-white"
              : "bg-white text-[#1B2A4A] border hover:bg-gray-50"
          )}
        >
          Task ({tasks.length})
        </button>
        <button
          onClick={() => setView("activities")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            view === "activities"
              ? "bg-[#1B2A4A] text-white"
              : "bg-white text-[#1B2A4A] border hover:bg-gray-50"
          )}
        >
          Attività ({activities.length})
        </button>
      </div>

      {/* Tasks View */}
      {view === "tasks" && (
        <>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border">
              <CalendarIcon className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Nessuna task attiva</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(taskGroups).map(([date, dateTasks]) => (
                <div key={date}>
                  <h3 className="text-sm font-semibold text-[#1B2A4A] mb-2 capitalize">
                    {date}
                  </h3>
                  <div className="bg-white rounded-lg border divide-y">
                    {dateTasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-3 p-3">
                        <StatusIcon status={task.status} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1B2A4A] truncate">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {task.deal && (
                              <span className="text-xs text-muted-foreground">
                                {task.deal.code} — {task.deal.title}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn("text-[10px]", TASK_PRIORITY_COLORS[task.priority])}
                        >
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {TASK_STATUS_LABELS[task.status]}
                        </Badge>
                        {task.assignee && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
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
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border">
              <CalendarIcon className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Nessuna attività recente</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(activityGroups).map(([date, dateActivities]) => (
                <div key={date}>
                  <h3 className="text-sm font-semibold text-[#1B2A4A] mb-2 capitalize">
                    {date}
                  </h3>
                  <div className="bg-white rounded-lg border divide-y">
                    {dateActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3">
                        <CalendarIcon className="h-4 w-4 text-[#1B2A4A]" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1B2A4A] truncate">
                            {activity.title}
                          </p>
                          {activity.deal && (
                            <span className="text-xs text-muted-foreground">
                              {activity.deal.code} — {activity.deal.title}
                            </span>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          {activity.activity_type === "meeting" ? "Meeting" : "Call"}
                        </Badge>
                        {activity.user && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
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
