"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Pencil,
  PieChart as PieChartIcon,
  Briefcase,
  BarChart3,
  DollarSign,
  Percent,
} from "lucide-react";
import { toast } from "sonner";
import {
  formatCurrency,
  formatDate,
  formatPercent,
} from "@/lib/utils/format";
import type {
  Asset,
  AssetClass,
  AssetWithRelations,
  Entity,
} from "@/types";

// ── Constants ───────────────────────────────────────────────
const EXCLUDED_CLASSES = ["Conti Correnti", "Immobili"];

const CHART_COLORS = [
  "#E87A2E",
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#F59E0B",
  "#06B6D4",
  "#EF4444",
  "#EC4899",
];

const CLASS_ICONS: Record<string, string> = {
  "Titoli & ETF": "◆",
  "Private Equity": "◈",
  Crypto: "◎",
  "Arte & Collezioni": "◇",
  Veicoli: "▣",
  Altro: "○",
  "Liquidit\u00e0": "◈",
};

// ── Component ───────────────────────────────────────────────
export default function InvestimentiPage() {
  const [assets, setAssets] = useState<AssetWithRelations[]>([]);
  const [assetClasses, setAssetClasses] = useState<AssetClass[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<AssetWithRelations | null>(null);
  const [form, setForm] = useState({
    name: "",
    asset_class_id: "",
    entity_id: "",
    current_value: "",
    purchase_value: "",
    purchase_date: "",
    description: "",
    notes: "",
    is_liquid: false,
  });

  const supabase = createClient();

  // ── Fetch ───────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    const [assetsRes, classesRes, entitiesRes] = await Promise.all([
      supabase
        .from("assets")
        .select("*, asset_class:asset_classes(*), entity:entities(*)")
        .order("current_value", { ascending: false }),
      supabase.from("asset_classes").select("*").order("sort_order"),
      supabase.from("entities").select("*").eq("is_active", true).order("name"),
    ]);

    if (classesRes.data) setAssetClasses(classesRes.data as AssetClass[]);
    if (entitiesRes.data) setEntities(entitiesRes.data as Entity[]);

    if (assetsRes.data && classesRes.data) {
      const excludedIds = new Set(
        (classesRes.data as AssetClass[])
          .filter((c) => EXCLUDED_CLASSES.includes(c.name))
          .map((c) => c.id)
      );
      const filtered = (assetsRes.data as AssetWithRelations[]).filter(
        (a) => a.asset_class_id && !excludedIds.has(a.asset_class_id)
      );
      setAssets(filtered);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Derived data ──────────────────────────────────────────
  const investmentClasses = useMemo(
    () => assetClasses.filter((c) => !EXCLUDED_CLASSES.includes(c.name)),
    [assetClasses]
  );

  const totalCurrentValue = useMemo(
    () => assets.reduce((s, a) => s + (a.current_value || 0), 0),
    [assets]
  );

  const totalPurchaseValue = useMemo(
    () => assets.reduce((s, a) => s + (a.purchase_value || 0), 0),
    [assets]
  );

  const totalPnL = totalCurrentValue - totalPurchaseValue;
  const totalPnLPercent =
    totalPurchaseValue > 0 ? (totalPnL / totalPurchaseValue) * 100 : 0;

  // Group assets by class
  const groupedAssets = useMemo(() => {
    const map = new Map<string, { cls: AssetClass; items: AssetWithRelations[] }>();
    for (const a of assets) {
      const cls = a.asset_class;
      if (!cls) continue;
      if (!map.has(cls.id)) map.set(cls.id, { cls, items: [] });
      map.get(cls.id)!.items.push(a);
    }
    return Array.from(map.values());
  }, [assets]);

  // Pie data
  const pieData = useMemo(() => {
    return groupedAssets.map((g, i) => ({
      name: g.cls.name,
      value: g.items.reduce((s, a) => s + (a.current_value || 0), 0),
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [groupedAssets]);

  // ── Handlers ──────────────────────────────────────────────
  function openNew() {
    setEditAsset(null);
    setForm({
      name: "",
      asset_class_id: "",
      entity_id: "",
      current_value: "",
      purchase_value: "",
      purchase_date: "",
      description: "",
      notes: "",
      is_liquid: false,
    });
    setDialogOpen(true);
  }

  function openEdit(asset: AssetWithRelations) {
    setEditAsset(asset);
    setForm({
      name: asset.name,
      asset_class_id: asset.asset_class_id || "",
      entity_id: asset.entity_id || "",
      current_value: String(asset.current_value || 0).replace(".", ","),
      purchase_value: String(asset.purchase_value || 0).replace(".", ","),
      purchase_date: asset.purchase_date || "",
      description: asset.description || "",
      notes: asset.notes || "",
      is_liquid: asset.is_liquid,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const currentVal = parseFloat(form.current_value.replace(",", ".")) || 0;
    const purchaseVal = parseFloat(form.purchase_value.replace(",", ".")) || 0;

    const payload = {
      user_id: user.id,
      name: form.name,
      asset_class_id: form.asset_class_id || null,
      entity_id: form.entity_id || null,
      current_value: currentVal,
      purchase_value: purchaseVal,
      purchase_date: form.purchase_date || null,
      description: form.description || null,
      notes: form.notes || null,
      is_liquid: form.is_liquid,
    };

    if (editAsset) {
      const { error } = await supabase
        .from("assets")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", editAsset.id);
      if (error) {
        toast.error("Errore nell'aggiornamento");
        return;
      }
      toast.success("Investimento aggiornato");
    } else {
      const { error } = await supabase.from("assets").insert(payload);
      if (error) {
        toast.error("Errore nel salvataggio");
        return;
      }
      toast.success("Investimento creato");
    }

    setDialogOpen(false);
    setEditAsset(null);
    fetchData();
  }

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">
            Investimenti
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Valore totale:{" "}
            <span className="font-semibold text-[#1A1A1A]">
              {formatCurrency(totalCurrentValue)}
            </span>
            {" "}
            <span
              className={`font-semibold ${totalPnL >= 0 ? "text-[#4ECDC4]" : "text-[#FF6B6B]"}`}
            >
              ({totalPnL >= 0 ? "+" : ""}
              {formatCurrency(totalPnL)})
            </span>
          </p>
        </div>
        <Button
          size="sm"
          className="bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
          onClick={openNew}
        >
          <Plus className="h-4 w-4 mr-1" />
          Nuovo Investimento
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Totale Investito */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-[#6B7280] font-medium">
                Totale Investito
              </p>
              <p className="text-2xl font-semibold text-[#1A1A1A]">
                {formatCurrency(totalPurchaseValue)}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-[#E87A2E]/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-[#E87A2E]" />
            </div>
          </div>
        </div>

        {/* Valore Attuale */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-[#6B7280] font-medium">
                Valore Attuale
              </p>
              <p className="text-2xl font-semibold text-[#1A1A1A]">
                {formatCurrency(totalCurrentValue)}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-[#3B82F6]" />
            </div>
          </div>
        </div>

        {/* P&L Totale */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-[#6B7280] font-medium">P&L Totale</p>
              <p
                className={`text-2xl font-semibold ${totalPnL >= 0 ? "text-[#4ECDC4]" : "text-[#FF6B6B]"}`}
              >
                {totalPnL >= 0 ? "+" : ""}
                {formatCurrency(totalPnL)}
              </p>
            </div>
            <div
              className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                totalPnL >= 0 ? "bg-[#4ECDC4]/10" : "bg-[#FF6B6B]/10"
              }`}
            >
              {totalPnL >= 0 ? (
                <TrendingUp className="h-5 w-5 text-[#4ECDC4]" />
              ) : (
                <TrendingDown className="h-5 w-5 text-[#FF6B6B]" />
              )}
            </div>
          </div>
        </div>

        {/* P&L % */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-[#6B7280] font-medium">P&L %</p>
              <p
                className={`text-2xl font-semibold ${totalPnLPercent >= 0 ? "text-[#4ECDC4]" : "text-[#FF6B6B]"}`}
              >
                {formatPercent(totalPnLPercent)}
              </p>
            </div>
            <div
              className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                totalPnLPercent >= 0 ? "bg-[#4ECDC4]/10" : "bg-[#FF6B6B]/10"
              }`}
            >
              <Percent className="h-5 w-5 text-[#6B7280]" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart — Allocation Donut */}
      {pieData.length > 0 && (
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-[#E87A2E]" />
            Allocazione per Classe
          </h3>
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <ResponsiveContainer width="100%" height={280} className="max-w-sm">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  dataKey="value"
                  paddingAngle={2}
                  stroke="none"
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatCurrency(value as number), "Valore"]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {pieData.map((entry) => {
                const pct =
                  totalCurrentValue > 0
                    ? ((entry.value / totalCurrentValue) * 100).toFixed(1)
                    : "0.0";
                return (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1A]">
                        {entry.name}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {formatCurrency(entry.value)} ({pct}%)
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Grouped Tables */}
      {groupedAssets.length > 0 ? (
        groupedAssets.map((group, gIdx) => {
          const groupTotal = group.items.reduce(
            (s, a) => s + (a.current_value || 0),
            0
          );
          const icon = CLASS_ICONS[group.cls.name] || "●";

          return (
            <div key={group.cls.id} className="space-y-3">
              {/* Group Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2">
                  <span
                    className="text-lg"
                    style={{
                      color:
                        CHART_COLORS[gIdx % CHART_COLORS.length],
                    }}
                  >
                    {icon}
                  </span>
                  {group.cls.name}
                </h2>
                <span className="text-sm font-semibold text-[#1A1A1A]">
                  {formatCurrency(groupTotal)}
                </span>
              </div>

              {/* Table */}
              <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-x-auto shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[#6B7280]">Nome</TableHead>
                      <TableHead className="text-[#6B7280]">
                        Entit\u00e0
                      </TableHead>
                      <TableHead className="text-[#6B7280] text-right">
                        Valore Attuale
                      </TableHead>
                      <TableHead className="text-[#6B7280] text-right">
                        Valore Acquisto
                      </TableHead>
                      <TableHead className="text-[#6B7280] text-right">
                        P&L
                      </TableHead>
                      <TableHead className="text-[#6B7280] text-right">
                        P&L %
                      </TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.items.map((asset) => {
                      const pnl =
                        (asset.current_value || 0) -
                        (asset.purchase_value || 0);
                      const pnlPct =
                        asset.purchase_value && asset.purchase_value > 0
                          ? (pnl / asset.purchase_value) * 100
                          : 0;

                      return (
                        <TableRow
                          key={asset.id}
                          className="hover:bg-[#FAFAFA]"
                        >
                          <TableCell className="font-medium text-[#1A1A1A]">
                            {asset.name}
                          </TableCell>
                          <TableCell className="text-sm text-[#6B7280]">
                            {asset.entity?.name || "—"}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium text-[#1A1A1A]">
                            {formatCurrency(asset.current_value)}
                          </TableCell>
                          <TableCell className="text-right text-sm text-[#6B7280]">
                            {formatCurrency(asset.purchase_value)}
                          </TableCell>
                          <TableCell
                            className={`text-right text-sm font-medium ${pnl >= 0 ? "text-[#4ECDC4]" : "text-[#FF6B6B]"}`}
                          >
                            {pnl === 0
                              ? "—"
                              : `${pnl > 0 ? "+" : ""}${formatCurrency(pnl)}`}
                          </TableCell>
                          <TableCell
                            className={`text-right text-sm font-medium ${pnlPct >= 0 ? "text-[#4ECDC4]" : "text-[#FF6B6B]"}`}
                          >
                            {asset.purchase_value
                              ? formatPercent(pnlPct)
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEdit(asset)}
                            >
                              <Pencil className="h-3.5 w-3.5 text-[#6B7280]" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-[#E5E7EB]">
          <Briefcase className="h-8 w-8 text-[#D1D5DB] mb-2" />
          <p className="text-sm text-[#9CA3AF]">
            Nessun investimento registrato
          </p>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Aggiungi il tuo primo investimento
          </p>
        </div>
      )}

      {/* ── New / Edit Dialog ─────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editAsset ? "Modifica Investimento" : "Nuovo Investimento"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Nome */}
            <div>
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="es. ETF MSCI World"
                className="mt-1"
              />
            </div>

            {/* Asset class */}
            <div>
              <Label>Classe di attivo</Label>
              <Select
                value={form.asset_class_id}
                onValueChange={(v) =>
                  setForm({ ...form, asset_class_id: v })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleziona..." />
                </SelectTrigger>
                <SelectContent>
                  {investmentClasses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {CLASS_ICONS[c.name] || "●"} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Entity */}
            <div>
              <Label>Entit\u00e0</Label>
              <Select
                value={form.entity_id}
                onValueChange={(v) => setForm({ ...form, entity_id: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleziona..." />
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

            {/* Values */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Valore attuale (&euro;)</Label>
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
                <Label>Valore acquisto (&euro;)</Label>
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

            {/* Description */}
            <div>
              <Label>Descrizione</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Opzionale"
                className="mt-1"
              />
            </div>

            {/* Notes */}
            <div>
              <Label>Note</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Opzionale"
                className="mt-1"
              />
            </div>

            {/* Is liquid */}
            <div className="flex items-center gap-2">
              <input
                id="is_liquid"
                type="checkbox"
                checked={form.is_liquid}
                onChange={(e) =>
                  setForm({ ...form, is_liquid: e.target.checked })
                }
                className="h-4 w-4 rounded border-[#D1D5DB] text-[#E87A2E] focus:ring-[#E87A2E]"
              />
              <Label htmlFor="is_liquid" className="text-sm cursor-pointer">
                Attivo liquido
              </Label>
            </div>

            {/* Submit */}
            <Button
              className="w-full bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
              onClick={handleSave}
              disabled={!form.name}
            >
              {editAsset ? "Aggiorna" : "Crea Investimento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
