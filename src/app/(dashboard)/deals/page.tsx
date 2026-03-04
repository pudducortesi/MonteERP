"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { DealsTable } from "@/components/pipeline/DealsTable";
import { DealForm } from "@/components/pipeline/DealForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus } from "lucide-react";
import type { DealWithRelations } from "@/types";

export default function DealsPage() {
  const [deals, setDeals] = useState<DealWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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

    if (data) setDeals(data as unknown as DealWithRelations[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const filtered = deals.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.code?.toLowerCase().includes(q) ||
      d.company?.name?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Deal</h1>
          <p className="text-sm text-muted-foreground">
            {deals.length} deal totali
          </p>
        </div>
        <Button
          size="sm"
          className="bg-[#1B2A4A] hover:bg-[#253A5E]"
          onClick={() => setFormOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Nuovo Deal
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca per titolo, codice o azienda..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>

      <DealsTable deals={filtered} />

      <DealForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={fetchDeals}
      />
    </div>
  );
}
