"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import {
  Landmark,
  Plus,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils/format";
import type {
  Entity,
  Asset,
  AssetClass,
  Liability,
  AssetWithRelations,
} from "@/types";
import { ENTITY_TYPE_LABELS } from "@/types";

// ── Form state shape ────────────────────────────────────────
interface AssetFormState {
  name: string;
  entity_id: string;
  asset_class_id: string;
  current_value: string;
  purchase_value: string;
  purchase_date: string;
  is_liquid: boolean;
  description: string;
  notes: string;
}

const EMPTY_FORM: AssetFormState = {
  name: "",
  entity_id: "",
  asset_class_id: "",
  current_value: "",
  purchase_value: "",
  purchase_date: "",
  is_liquid: false,
  description: "",
  notes: "",
};

// ── Component ───────────────────────────────────────────────
export default function PatrimonioPage() {
  const supabase = createClient();

  // Data
  const [entities, setEntities] = useState<Entity[]>([]);
  const [assets, setAssets] = useState<AssetWithRelations[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [assetClasses, setAssetClasses] = useState<AssetClass[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(
    new Set()
  );
  const [selectedEntity, setSelectedEntity] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<AssetFormState>(EMPTY_FORM);

  // ── Data fetching ──────────────────────────────────────────
  const fetchData = useCallback(async () => {
    const [entRes, assRes, liabRes, classRes] = await Promise.all([
      supabase
        .from("entities")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("assets")
        .select("*, entity:entities(*), asset_class:asset_classes(*)")
        .order("current_value", { ascending: false }),
      supabase.from("liabilities").select("*").order("current_balance", {
        ascending: false,
      }),
      supabase.from("asset_classes").select("*").order("sort_order"),
    ]);

    if (entRes.data) setEntities(entRes.data as Entity[]);
    if (assRes.data) setAssets(assRes.data as AssetWithRelations[]);
    if (liabRes.data) setLiabilities(liabRes.data as Liability[]);
    if (classRes.data) setAssetClasses(classRes.data as AssetClass[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Derived data ───────────────────────────────────────────
  const filteredAssets = useMemo(() => {
    let result = assets;
    if (selectedEntity !== "all") {
      result = result.filter((a) => a.entity_id === selectedEntity);
    }
    if (selectedClass !== "all") {
      result = result.filter((a) => a.asset_class_id === selectedClass);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [assets, selectedEntity, selectedClass, searchQuery]);

  const totalAssets = filteredAssets.reduce(
    (sum, a) => sum + (a.current_value || 0),
    0
  );

  const filteredLiabilities = useMemo(() => {
    if (selectedEntity !== "all") {
      return liabilities.filter((l) => l.entity_id === selectedEntity);
    }
    return liabilities;
  }, [liabilities, selectedEntity]);

  const totalLiabilities = filteredLiabilities.reduce(
    (sum, l) => sum + (l.current_balance || 0),
    0
  );

  const totalNet = totalAssets - totalLiabilities;

  // Totals per entity (unfiltered, for progress bar percentages)
  const entityTotals = useMemo(() => {
    const map: Record<
      string,
      { assets: number; liabilities: number; net: number }
    > = {};
    for (const e of entities) {
      map[e.id] = { assets: 0, liabilities: 0, net: 0 };
    }
    for (const a of assets) {
      if (a.entity_id && map[a.entity_id]) {
        map[a.entity_id].assets += a.current_value || 0;
      }
    }
    for (const l of liabilities) {
      if (l.entity_id && map[l.entity_id]) {
        map[l.entity_id].liabilities += l.current_balance || 0;
      }
    }
    for (const id of Object.keys(map)) {
      map[id].net = map[id].assets - map[id].liabilities;
    }
    return map;
  }, [entities, assets, liabilities]);

  const globalTotalNet = useMemo(() => {
    return Object.values(entityTotals).reduce((s, t) => s + t.net, 0);
  }, [entityTotals]);

  // Assets grouped by entity then asset class
  const assetsForEntity = useCallback(
    (entityId: string) => {
      let ea = filteredAssets.filter((a) => a.entity_id === entityId);
      return ea;
    },
    [filteredAssets]
  );

  const groupByClass = useCallback(
    (entityAssets: AssetWithRelations[]) => {
      const groups: Record<
        string,
        { assetClass: AssetClass | null; items: AssetWithRelations[] }
      > = {};
      for (const a of entityAssets) {
        const classId = a.asset_class_id || "uncategorized";
        if (!groups[classId]) {
          groups[classId] = {
            assetClass: a.asset_class || null,
            items: [],
          };
        }
        groups[classId].items.push(a);
      }
      return Object.values(groups).sort((a, b) => {
        const sa = a.assetClass?.sort_order ?? 999;
        const sb = b.assetClass?.sort_order ?? 999;
        return sa - sb;
      });
    },
    []
  );

  // ── Toggle entity expansion ────────────────────────────────
  function toggleEntity(id: string) {
    setExpandedEntities((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // ── Create asset ───────────────────────────────────────────
  async function handleCreateAsset() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const currentVal =
      parseFloat(form.current_value.replace(",", ".")) || 0;
    const purchaseVal =
      parseFloat(form.purchase_value.replace(",", ".")) || 0;

    const payload = {
      user_id: user.id,
      name: form.name,
      entity_id: form.entity_id || null,
      asset_class_id: form.asset_class_id || null,
      current_value: currentVal,
      purchase_value: purchaseVal,
      purchase_date: form.purchase_date || null,
      is_liquid: form.is_liquid,
      description: form.description || null,
      notes: form.notes || null,
      currency: "EUR",
      metadata: {},
      is_liability: false,
    };

    const { error } = await supabase.from("assets").insert(payload);
    if (error) {
      toast.error("Errore nella creazione dell'asset");
      return;
    }

    toast.success("Asset creato con successo");
    setFormOpen(false);
    setForm(EMPTY_FORM);
    fetchData();
  }

  function openNewAssetForm() {
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  // ── Loading skeleton ───────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-36" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-10 w-60" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  // ── Visible entities (respect entity filter) ───────────────
  const visibleEntities =
    selectedEntity !== "all"
      ? entities.filter((e) => e.id === selectedEntity)
      : entities;

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="h-6 w-6 text-[#E87A2E]" />
            <h1 className="text-2xl font-semibold text-[#1A1A1A]">
              Patrimonio
            </h1>
          </div>
          <p className="text-sm text-[#6B7280] mt-1">
            Patrimonio netto totale:{" "}
            <span className="font-semibold text-[#1A1A1A]">
              {formatCurrency(totalNet)}
            </span>
          </p>
        </div>
        <Button
          size="sm"
          className="bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
          onClick={openNewAssetForm}
        >
          <Plus className="h-4 w-4 mr-1" />
          Nuovo Asset
        </Button>
      </div>

      {/* ── Filters ────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#9CA3AF]" />
          <Select value={selectedEntity} onValueChange={setSelectedEntity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tutte le entità" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le entità</SelectItem>
              {entities.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tutte le classi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le classi</SelectItem>
            {assetClasses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
          <Input
            placeholder="Cerca asset..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* ── Level 1 — Entity cards ─────────────────────────── */}
      {visibleEntities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-[#E5E7EB]">
          <Landmark className="h-8 w-8 text-[#D1D5DB] mb-2" />
          <p className="text-sm text-[#9CA3AF]">Nessuna entità trovata</p>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Configura le tue entità per iniziare
          </p>
        </div>
      )}

      <div className="space-y-4">
        {visibleEntities.map((entity) => {
          const totals = entityTotals[entity.id] || {
            assets: 0,
            liabilities: 0,
            net: 0,
          };
          const isExpanded = expandedEntities.has(entity.id);
          const entityAssets = assetsForEntity(entity.id);
          const classGroups = groupByClass(entityAssets);
          const pctOfTotal =
            globalTotalNet > 0
              ? Math.max(0, (totals.net / globalTotalNet) * 100)
              : 0;

          return (
            <div key={entity.id} className="space-y-0">
              {/* Entity card */}
              <Card
                className={`bg-white border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md`}
                style={{
                  borderLeftWidth: "4px",
                  borderLeftColor: entity.color || "#E87A2E",
                }}
                onClick={() => toggleEntity(entity.id)}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-[#6B7280]" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-[#6B7280]" />
                        )}
                        <h3 className="text-base font-semibold text-[#1A1A1A]">
                          {entity.name}
                        </h3>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs font-medium"
                      >
                        {ENTITY_TYPE_LABELS[entity.type]}
                      </Badge>
                    </div>
                    <p className="text-lg font-semibold text-[#1A1A1A]">
                      {formatCurrency(totals.net)}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-6 text-sm">
                    <span className="text-[#6B7280]">
                      Attivi:{" "}
                      <span className="font-medium text-[#1A1A1A]">
                        {formatCurrency(totals.assets)}
                      </span>
                    </span>
                    <span className="text-[#6B7280]">
                      Passivi:{" "}
                      <span className="font-medium text-[#FF6B6B]">
                        {formatCurrency(totals.liabilities)}
                      </span>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-[#9CA3AF] mb-1">
                      <span>{pctOfTotal.toFixed(1)}% del patrimonio totale</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#F3F4F6]">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(pctOfTotal, 100)}%`,
                          backgroundColor: entity.color || "#E87A2E",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* ── Level 2 — Expanded: assets grouped by class ── */}
              {isExpanded && (
                <div className="ml-4 border-l-2 border-[#E5E7EB] pl-4 pt-3 space-y-3 animate-fade-in">
                  {classGroups.length === 0 ? (
                    <p className="text-sm text-[#9CA3AF] py-4">
                      Nessun asset per questa entità
                    </p>
                  ) : (
                    classGroups.map((group) => {
                      const classTotal = group.items.reduce(
                        (s, a) => s + (a.current_value || 0),
                        0
                      );
                      return (
                        <div
                          key={
                            group.assetClass?.id || "uncategorized"
                          }
                          className="bg-white rounded-lg border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden"
                        >
                          {/* Class header */}
                          <div className="flex items-center justify-between px-4 py-3 bg-[#FAFAFA] border-b border-[#E5E7EB]">
                            <div className="flex items-center gap-2">
                              {group.assetClass?.icon && (
                                <span className="text-base">
                                  {group.assetClass.icon}
                                </span>
                              )}
                              <span className="text-sm font-semibold text-[#1A1A1A]">
                                {group.assetClass?.name || "Senza classe"}
                              </span>
                              <span className="text-xs text-[#9CA3AF]">
                                ({group.items.length})
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-[#1A1A1A]">
                              {formatCurrency(classTotal)}
                            </span>
                          </div>

                          {/* ── Level 3 — Individual asset rows ── */}
                          <div className="divide-y divide-[#F3F4F6]">
                            {group.items.map((asset) => {
                              const pnl =
                                asset.purchase_value != null
                                  ? asset.current_value -
                                    asset.purchase_value
                                  : null;
                              return (
                                <div
                                  key={asset.id}
                                  className="flex items-center justify-between px-4 py-3 hover:bg-[#FAFAFA] transition-colors duration-150"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[#1A1A1A] truncate">
                                      {asset.name}
                                    </p>
                                    {asset.description && (
                                      <p className="text-xs text-[#9CA3AF] truncate">
                                        {asset.description}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-4 ml-4">
                                    <div className="text-right">
                                      <p className="text-sm font-medium text-[#1A1A1A]">
                                        {formatCurrency(asset.current_value)}
                                      </p>
                                      {asset.purchase_value != null && (
                                        <p className="text-xs text-[#9CA3AF]">
                                          Acquisto:{" "}
                                          {formatCurrency(
                                            asset.purchase_value
                                          )}
                                        </p>
                                      )}
                                    </div>

                                    {pnl != null && pnl !== 0 && (
                                      <span
                                        className={`text-sm font-medium min-w-[80px] text-right ${
                                          pnl >= 0
                                            ? "text-[#4ECDC4]"
                                            : "text-[#FF6B6B]"
                                        }`}
                                      >
                                        {pnl > 0 ? "+" : ""}
                                        {formatCurrency(pnl)}
                                      </span>
                                    )}

                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Edit placeholder — could open edit dialog
                                      }}
                                    >
                                      <Pencil className="h-3.5 w-3.5 text-[#6B7280]" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Empty state when no assets at all ──────────────── */}
      {entities.length > 0 && assets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-[#E5E7EB]">
          <Landmark className="h-8 w-8 text-[#D1D5DB] mb-2" />
          <p className="text-sm text-[#9CA3AF]">
            Nessun asset registrato
          </p>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Aggiungi il tuo primo asset per iniziare a monitorare il patrimonio
          </p>
        </div>
      )}

      {/* ── Nuovo Asset Dialog ─────────────────────────────── */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuovo Asset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Name */}
            <div>
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="es. Appartamento Milano"
                className="mt-1"
              />
            </div>

            {/* Entity + Asset Class */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Entità</Label>
                <Select
                  value={form.entity_id}
                  onValueChange={(v) =>
                    setForm({ ...form, entity_id: v })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleziona entità" />
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
              <div>
                <Label>Classe di asset</Label>
                <Select
                  value={form.asset_class_id}
                  onValueChange={(v) =>
                    setForm({ ...form, asset_class_id: v })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleziona classe" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetClasses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Values */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Valore attuale (€)</Label>
                <Input
                  value={form.current_value}
                  onChange={(e) =>
                    setForm({ ...form, current_value: e.target.value })
                  }
                  placeholder="0,00"
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
                  placeholder="0,00"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Purchase date */}
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

            {/* is_liquid checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_liquid"
                checked={form.is_liquid}
                onChange={(e) =>
                  setForm({ ...form, is_liquid: e.target.checked })
                }
                className="h-4 w-4 rounded border-[#D1D5DB] text-[#E87A2E] focus:ring-[#E87A2E]"
              />
              <Label htmlFor="is_liquid" className="cursor-pointer">
                Asset liquido
              </Label>
            </div>

            {/* Description */}
            <div>
              <Label>Descrizione</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Descrizione opzionale"
                className="mt-1"
              />
            </div>

            {/* Notes */}
            <div>
              <Label>Note</Label>
              <Input
                value={form.notes}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value })
                }
                placeholder="Note aggiuntive"
                className="mt-1"
              />
            </div>

            {/* Submit */}
            <Button
              className="w-full bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
              onClick={handleCreateAsset}
              disabled={!form.name}
            >
              Crea Asset
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
