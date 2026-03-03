"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Pencil } from "lucide-react";
import { DealForm } from "@/components/pipeline/DealForm";
import { DealOverview } from "@/components/pipeline/DealOverview";
import { DealTimeline } from "@/components/pipeline/DealTimeline";
import { DealTeam } from "@/components/pipeline/DealTeam";
import {
  DEAL_STATUS_LABELS,
  DEAL_PRIORITY_COLORS,
  DEAL_PRIORITY_LABELS,
} from "@/lib/utils/deal";
import { cn } from "@/lib/utils";
import type { DealWithRelations, Activity, User } from "@/types";

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;

  const [deal, setDeal] = useState<DealWithRelations | null>(null);
  const [activities, setActivities] = useState<(Activity & { user?: User })[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const supabase = createClient();

  const fetchDeal = useCallback(async () => {
    const { data } = await supabase
      .from("deals")
      .select(
        `
        *,
        company:companies(*),
        deal_members(
          deal_id,
          user_id,
          role_in_deal,
          joined_at,
          user:users(id, full_name, email, role, avatar_url)
        )
      `
      )
      .eq("id", dealId)
      .single();

    if (data) setDeal(data as unknown as DealWithRelations);
    setLoading(false);
  }, [supabase, dealId]);

  const fetchActivities = useCallback(async () => {
    const { data } = await supabase
      .from("activities")
      .select(
        `
        *,
        user:users(id, full_name)
      `
      )
      .eq("deal_id", dealId)
      .order("created_at", { ascending: false });

    if (data)
      setActivities(data as unknown as (Activity & { user?: User })[]);
  }, [supabase, dealId]);

  useEffect(() => {
    fetchDeal();
    fetchActivities();
  }, [fetchDeal, fetchActivities]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Deal non trovato</p>
        <Button variant="link" onClick={() => router.push("/pipeline")}>
          Torna alla pipeline
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mt-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">
                {deal.code}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
                {DEAL_STATUS_LABELS[deal.status]}
              </span>
              <span
                className={cn(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                  DEAL_PRIORITY_COLORS[deal.priority]
                )}
              >
                {DEAL_PRIORITY_LABELS[deal.priority]}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#1B2A4A] mt-1">
              {deal.title}
            </h1>
            {deal.company && (
              <p className="text-sm text-muted-foreground">
                {deal.company.name}
              </p>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setFormOpen(true)}
        >
          <Pencil className="h-4 w-4 mr-1" />
          Modifica
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="documents">Documenti</TabsTrigger>
          <TabsTrigger value="fee">Fee</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <DealOverview deal={deal} />
        </TabsContent>

        <TabsContent value="timeline">
          <DealTimeline activities={activities} />
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
          <div className="bg-white rounded-lg border p-8 text-center">
            <p className="text-muted-foreground text-sm">
              Gestione documenti — disponibile nella Fase 3
            </p>
          </div>
        </TabsContent>

        <TabsContent value="fee">
          <div className="bg-white rounded-lg border p-8 text-center">
            <p className="text-muted-foreground text-sm">
              Success Fee tracking — disponibile nella Fase 3
            </p>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <div className="bg-white rounded-lg border p-8 text-center">
            <p className="text-muted-foreground text-sm">
              Gestione task — disponibile nella Fase 4
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit form dialog */}
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
