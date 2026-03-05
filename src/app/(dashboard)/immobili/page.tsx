"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, Plus, MapPin, Building2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type {
  AssetWithRelations,
  Entity,
  Liability,
} from "@/types";

export default function ImmobiliPage() {
  const [properties, setProperties] = useState<AssetWithRelations[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    entity_id: "",
    current_value: "",
    purchase_value: "",
    purchase_date: "",
    address: "",
    annual_rent: "",
    notes: "",
  });

  const supabase = createClient();

  // -----------------------------------------------------------------------
  // Fetch
  // -----------------------------------------------------------------------
  const fetchData = useCallback(async () => {
    const [assetsRes, liabRes, entitiesRes] = await Promise.all([
      supabase
        .from("assets")
        .select("*, entity:entities(*), asset_class:asset_classes(*)")
        .eq("asset_class.name", "Immobili")
        .order("created_at"),
      supabase.from("liabilities").select("*").order("created_at"),
      supabase
        .from("entities")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
    ]);

    if (assetsRes.data) {
      const filtered = (assetsRes.data as unknown as AssetWithRelations[]).filter(
        (a) => a.asset_class !== null && a.asset_class !== undefined
      );
      setProperties(filtered);
    }
    if (liabRes.data) setLiabilities(liabRes.data as Liability[]);
    if (entitiesRes.data) setEntities(entitiesRes.data as Entity[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // -----------------------------------------------------------------------
  // Derived
  // -----------------------------------------------------------------------
  const totalValue = properties.reduce((s, p) => s + (p.current_value ?? 0), 0);
  const propertyCount = properties.length;

  function meta(property: AssetWithRelations): Record<string, unknown> {
    return (property.metadata as Record<string, unknown>) ?? {};
  }

  function findMortgage(property: AssetWithRelations): Liability | undefined {
    return liabilities.find(
      (l) =>
        l.collateral &&
        (l.collateral === property.name ||
          l.collateral === (meta(property).address as string))
    );
  }

  // -----------------------------------------------------------------------
  // Create handler
  // -----------------------------------------------------------------------
  async function handleCreate() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (!form.name) {
      toast.error("Il nome è obbligatorio");
      return;
    }

    // Resolve Immobili asset class id
    const { data: acData } = await supabase
      .from("asset_classes")
      .select("id")
      .eq("name", "Immobili")
      .single();

    if (!acData) {
      toast.error("Asset class 'Immobili' non trovata");
      return;
    }

    const currentVal = parseFloat(form.current_value.replace(",", ".")) || 0;
    const purchaseVal = parseFloat(form.purchase_value.replace(",", ".")) || 0;
    const annualRent = parseFloat(form.annual_rent.replace(",", ".")) || 0;

    const { error } = await supabase.from("assets").insert({
      user_id: user.id,
      entity_id: form.entity_id || null,
      asset_class_id: acData.id,
      name: form.name,
      current_value: currentVal,
      purchase_value: purchaseVal || null,
      purchase_date: form.purchase_date || null,
      currency: "EUR",
      is_liquid: false,
      is_liability: false,
      metadata: {
        address: form.address || null,
        annual_rent: annualRent || null,
      },
      notes: form.notes || null,
    });

    if (error) {
      toast.error("Errore nella creazione");
      return;
    }
    toast.success("Immobile aggiunto");
    setCreateDialogOpen(false);
    setForm({
      name: "",
      entity_id: "",
      current_value: "",
      purchase_value: "",
      purchase_date: "",
      address: "",
      annual_rent: "",
      notes: "",
    });
    fetchData();
  }

  // -----------------------------------------------------------------------
  // Loading skeleton
  // -----------------------------------------------------------------------
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">
            Portfolio Immobiliare
          </h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            Valore totale:{" "}
            <span className="font-semibold text-[#1A1A1A]">
              {formatCurrency(totalValue)}
            </span>
            {" · "}
            {propertyCount} {propertyCount === 1 ? "immobile" : "immobili"}
          </p>
        </div>
        <Button
          size="sm"
          className="bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Nuovo Immobile
        </Button>
      </div>

      {/* Properties grid */}
      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-[#E5E7EB]">
          <Home className="h-8 w-8 text-[#D1D5DB] mb-2" />
          <p className="text-sm text-[#9CA3AF]">Nessun immobile registrato</p>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Aggiungi il tuo primo immobile
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {properties.map((property) => {
            const m = meta(property);
            const address = (m.address as string) || null;
            const annualRent = (m.annual_rent as number) || null;
            const mortgage = findMortgage(property);
            const purchaseVal = property.purchase_value ?? 0;
            const currentVal = property.current_value ?? 0;
            const pnl = purchaseVal > 0 ? currentVal - purchaseVal : 0;
            const pnlPct =
              purchaseVal > 0 ? ((pnl / purchaseVal) * 100).toFixed(1) : null;
            const entityColor = property.entity?.color || "#E87A2E";

            return (
              <div
                key={property.id}
                className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Photo placeholder */}
                <div className="h-32 bg-[#F3F4F6] flex items-center justify-center">
                  <Home className="h-10 w-10 text-[#D1D5DB]" />
                </div>

                <div className="p-5 space-y-4">
                  {/* Name & address */}
                  <div>
                    <h3 className="text-base font-semibold text-[#1A1A1A]">
                      {property.name}
                    </h3>
                    {address && (
                      <p className="text-xs text-[#6B7280] mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {address}
                      </p>
                    )}
                  </div>

                  {/* Valore stimato */}
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#9CA3AF] font-medium">
                      Valore stimato
                    </p>
                    <p className="text-2xl font-semibold text-[#1A1A1A]">
                      {formatCurrency(currentVal)}
                    </p>
                  </div>

                  {/* Detail rows */}
                  <div className="space-y-2 text-sm">
                    {/* Data acquisto */}
                    {property.purchase_date && (
                      <div className="flex justify-between">
                        <span className="text-[#6B7280]">Data acquisto</span>
                        <span className="text-[#1A1A1A] font-medium">
                          {formatDate(property.purchase_date)}
                        </span>
                      </div>
                    )}

                    {/* Entità */}
                    {property.entity && (
                      <div className="flex justify-between items-center">
                        <span className="text-[#6B7280]">
                          Entità proprietaria
                        </span>
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${entityColor}15`,
                            color: entityColor,
                          }}
                        >
                          {property.entity.name}
                        </span>
                      </div>
                    )}

                    {/* Rendita annua */}
                    {annualRent != null && annualRent > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[#6B7280]">Rendita annua</span>
                        <span className="text-[#4ECDC4] font-medium">
                          {formatCurrency(annualRent)}
                        </span>
                      </div>
                    )}

                    {/* Mutuo residuo */}
                    {mortgage && (
                      <div className="flex justify-between">
                        <span className="text-[#6B7280] flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          Mutuo residuo
                        </span>
                        <span className="text-[#FF6B6B] font-medium">
                          {formatCurrency(mortgage.current_balance)}
                        </span>
                      </div>
                    )}

                    {/* P&L */}
                    {purchaseVal > 0 && (
                      <div className="flex justify-between pt-2 border-t border-[#F3F4F6]">
                        <span className="text-[#6B7280]">
                          P&L vs acquisto
                        </span>
                        <span
                          className={`font-semibold ${
                            pnl >= 0 ? "text-[#4ECDC4]" : "text-[#FF6B6B]"
                          }`}
                        >
                          {pnl > 0 ? "+" : ""}
                          {formatCurrency(pnl)}
                          {pnlPct && (
                            <span className="text-xs ml-1 opacity-75">
                              ({pnl >= 0 ? "+" : ""}
                              {pnlPct}%)
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── New Property Dialog ─────────────────────────────────── */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuovo Immobile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nome / Descrizione</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="es. Appartamento Milano Centro"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Entità proprietaria</Label>
              <Select
                value={form.entity_id}
                onValueChange={(v) => setForm({ ...form, entity_id: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleziona entità..." />
                </SelectTrigger>
                <SelectContent>
                  {entities.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Valore stimato (€)</Label>
                <Input
                  value={form.current_value}
                  onChange={(e) =>
                    setForm({ ...form, current_value: e.target.value })
                  }
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Valore acquisto (€)</Label>
                <Input
                  value={form.purchase_value}
                  onChange={(e) =>
                    setForm({ ...form, purchase_value: e.target.value })
                  }
                  placeholder="0"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Data acquisto</Label>
              <Input
                type="date"
                value={form.purchase_date}
                onChange={(e) =>
                  setForm({ ...form, purchase_date: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Indirizzo</Label>
              <Input
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
                placeholder="es. Via Roma 10, Milano"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Rendita annua (€)</Label>
              <Input
                value={form.annual_rent}
                onChange={(e) =>
                  setForm({ ...form, annual_rent: e.target.value })
                }
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Note</Label>
              <Input
                value={form.notes}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value })
                }
                placeholder="Opzionale"
                className="mt-1"
              />
            </div>
            <Button
              className="w-full bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
              onClick={handleCreate}
              disabled={!form.name}
            >
              Aggiungi Immobile
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
