"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";

const KanbanBoard = dynamic(
  () => import("@/components/pipeline/KanbanBoard").then((m) => m.KanbanBoard),
  { ssr: false, loading: () => <Skeleton className="h-[400px] w-full" /> }
);
const DealsTable = dynamic(
  () => import("@/components/pipeline/DealsTable").then((m) => m.DealsTable),
  { loading: () => <Skeleton className="h-[400px] w-full" /> }
);
import { DealFilters } from "@/components/pipeline/DealFilters";
import { DealForm } from "@/components/pipeline/DealForm";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { DEAL_STATUS_LABELS } from "@/lib/utils/deal";
import type {
  DealWithRelations,
  DealStatus,
  DealType,
  DealPriority,
  User,
} from "@/types";

export default function PipelinePage() {
  const [deals, setDeals] = useState<DealWithRelations[]>([]);
  const [advisors, setAdvisors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [showArchived, setShowArchived] = useState(false);
  const [dealTypeFilter, setDealTypeFilter] = useState<DealType | "all">(
    "all"
  );
  const [priorityFilter, setPriorityFilter] = useState<DealPriority | "all">(
    "all"
  );
  const [advisorFilter, setAdvisorFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);

  const supabase = createClient();

  const fetchDeals = useCallback(async () => {
    const { data } = await supabase
      .from("deals")
      .select(
        `
        *,
        company:companies(id, name),
        deal_members(
          deal_id,
          user_id,
          role_in_deal,
          joined_at,
          user:users(id, full_name, avatar_url)
        )
      `
      )
      .order("updated_at", { ascending: false });

    if (data) {
      setDeals(data as unknown as DealWithRelations[]);
    }
    setLoading(false);
  }, [supabase]);

  const fetchAdvisors = useCallback(async () => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .in("role", ["admin", "advisor"])
      .eq("is_active", true)
      .order("full_name");

    if (data) setAdvisors(data as User[]);
  }, [supabase]);

  useEffect(() => {
    fetchDeals();
    fetchAdvisors();
  }, [fetchDeals, fetchAdvisors]);

  async function handleStatusChange(dealId: string, newStatus: DealStatus) {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return;

    const oldStatus = deal.status;

    // Optimistic update
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, status: newStatus } : d))
    );

    const { error } = await supabase
      .from("deals")
      .update({ status: newStatus })
      .eq("id", dealId);

    if (error) {
      // Revert on error
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, status: oldStatus } : d))
      );
      toast.error("Errore nell'aggiornamento dello status");
      return;
    }

    // Log activity
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("activities").insert({
        deal_id: dealId,
        user_id: user.id,
        activity_type: "status_change",
        title: `Status cambiato: ${DEAL_STATUS_LABELS[oldStatus]} → ${DEAL_STATUS_LABELS[newStatus]}`,
        metadata: { old_status: oldStatus, new_status: newStatus },
      });
    }

    toast.success(
      `Deal spostato in ${DEAL_STATUS_LABELS[newStatus]}`
    );
  }

  // Apply filters
  const filteredDeals = deals.filter((deal) => {
    if (dealTypeFilter !== "all" && deal.deal_type !== dealTypeFilter)
      return false;
    if (priorityFilter !== "all" && deal.priority !== priorityFilter)
      return false;
    if (advisorFilter !== "all") {
      const hasMember = deal.deal_members?.some(
        (m) => m.user_id === advisorFilter
      );
      if (!hasMember) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[400px] w-[280px] flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Pipeline M&A</h1>
        <p className="text-sm text-muted-foreground">
          {deals.length} deal in pipeline
        </p>
      </div>

      <DealFilters
        view={view}
        onViewChange={setView}
        showArchived={showArchived}
        onShowArchivedChange={setShowArchived}
        dealTypeFilter={dealTypeFilter}
        onDealTypeFilterChange={setDealTypeFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        advisorFilter={advisorFilter}
        onAdvisorFilterChange={setAdvisorFilter}
        advisors={advisors}
        onNewDeal={() => setFormOpen(true)}
      />

      {view === "kanban" ? (
        <KanbanBoard
          deals={filteredDeals}
          showArchived={showArchived}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <DealsTable deals={filteredDeals} />
      )}

      <DealForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={fetchDeals}
      />
    </div>
  );
}
