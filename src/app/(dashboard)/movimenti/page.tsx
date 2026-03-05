"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeftRight, Plus } from "lucide-react";
import { toast } from "sonner";
import type {
  Entity,
  Asset,
  AssetTransaction,
  AssetTransactionWithRelations,
  AssetTransactionType,
} from "@/types";
import { TRANSACTION_TYPE_LABELS } from "@/types";

const DEFAULT_FORM = {
  asset_id: "",
  type: "income" as AssetTransactionType,
  amount: "",
  category: "",
  description: "",
  counterparty: "",
  date: new Date().toISOString().slice(0, 10),
};

export default function MovimentiPage() {
  const [transactions, setTransactions] = useState<AssetTransactionWithRelations[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterEntity, setFilterEntity] = useState("");
  const [filterAsset, setFilterAsset] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");

  // Dialog
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const [txRes, entRes, assetRes] = await Promise.all([
      supabase
        .from("asset_transactions")
        .select("*, asset:assets(*, entity:entities(*))")
        .order("date", { ascending: false }),
      supabase
        .from("entities")
        .select("*")
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("assets")
        .select("*")
        .order("name"),
    ]);

    if (txRes.data) setTransactions(txRes.data as AssetTransactionWithRelations[]);
    if (entRes.data) setEntities(entRes.data as Entity[]);
    if (assetRes.data) setAssets(assetRes.data as Asset[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (filterEntity && tx.asset?.entity?.id !== filterEntity) return false;
      if (filterAsset && tx.asset_id !== filterAsset) return false;
      if (filterType && tx.type !== filterType) return false;
      if (filterDateStart && tx.date < filterDateStart) return false;
      if (filterDateEnd && tx.date > filterDateEnd) return false;
      return true;
    });
  }, [transactions, filterEntity, filterAsset, filterType, filterDateStart, filterDateEnd]);

  // Summary
  const totaleEntrate = useMemo(
    () => filtered.filter((tx) => tx.amount > 0).reduce((s, tx) => s + tx.amount, 0),
    [filtered]
  );
  const totaleUscite = useMemo(
    () => filtered.filter((tx) => tx.amount < 0).reduce((s, tx) => s + tx.amount, 0),
    [filtered]
  );

  function resetFilters() {
    setFilterEntity("");
    setFilterAsset("");
    setFilterType("");
    setFilterDateStart("");
    setFilterDateEnd("");
  }

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const amount = parseFloat(form.amount.replace(",", "."));
    if (isNaN(amount)) {
      toast.error("Importo non valido");
      return;
    }

    const payload = {
      user_id: user.id,
      asset_id: form.asset_id || null,
      type: form.type,
      amount,
      category: form.category || null,
      description: form.description || null,
      counterparty: form.counterparty || null,
      date: form.date,
    };

    const { error } = await supabase.from("asset_transactions").insert(payload);
    if (error) {
      toast.error("Errore nel salvataggio del movimento");
      return;
    }

    toast.success("Movimento registrato");
    setFormOpen(false);
    setForm(DEFAULT_FORM);
    fetchData();
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">Movimenti</h1>
          <p className="text-sm text-[#6B7280]">
            Timeline di tutte le transazioni cross-entit&agrave;
          </p>
        </div>
        <Button
          size="sm"
          className="bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
          onClick={() => {
            setForm(DEFAULT_FORM);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Nuovo Movimento
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap items-end gap-3">
          {/* Entity filter */}
          <div className="min-w-[160px]">
            <Label className="text-xs text-[#6B7280]">Entit&agrave;</Label>
            <Select value={filterEntity} onValueChange={setFilterEntity}>
              <SelectTrigger className="mt-1 h-9">
                <SelectValue placeholder="Tutte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Tutte</SelectItem>
                {entities.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Asset filter */}
          <div className="min-w-[160px]">
            <Label className="text-xs text-[#6B7280]">Asset</Label>
            <Select value={filterAsset} onValueChange={setFilterAsset}>
              <SelectTrigger className="mt-1 h-9">
                <SelectValue placeholder="Tutti" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Tutti</SelectItem>
                {assets.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type filter */}
          <div className="min-w-[160px]">
            <Label className="text-xs text-[#6B7280]">Tipo</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="mt-1 h-9">
                <SelectValue placeholder="Tutti" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Tutti</SelectItem>
                {(Object.entries(TRANSACTION_TYPE_LABELS) as [AssetTransactionType, string][]).map(
                  ([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Date range */}
          <div className="min-w-[140px]">
            <Label className="text-xs text-[#6B7280]">Da</Label>
            <Input
              type="date"
              value={filterDateStart}
              onChange={(e) => setFilterDateStart(e.target.value)}
              className="mt-1 h-9"
            />
          </div>
          <div className="min-w-[140px]">
            <Label className="text-xs text-[#6B7280]">A</Label>
            <Input
              type="date"
              value={filterDateEnd}
              onChange={(e) => setFilterDateEnd(e.target.value)}
              className="mt-1 h-9"
            />
          </div>

          {/* Reset */}
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={resetFilters}
          >
            Resetta filtri
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-sm text-[#6B7280] font-medium">Totale Entrate</p>
          <p className="text-2xl font-semibold text-[#16A34A] mt-1">
            {formatCurrency(totaleEntrate)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-sm text-[#6B7280] font-medium">Totale Uscite</p>
          <p className="text-2xl font-semibold text-[#DC2626] mt-1">
            {formatCurrency(totaleUscite)}
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      {filtered.length > 0 ? (
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-x-auto shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[#6B7280]">Data</TableHead>
                <TableHead className="text-[#6B7280]">Descrizione</TableHead>
                <TableHead className="text-[#6B7280] text-right">Importo</TableHead>
                <TableHead className="text-[#6B7280]">Asset</TableHead>
                <TableHead className="text-[#6B7280]">Entit&agrave;</TableHead>
                <TableHead className="text-[#6B7280]">Categoria</TableHead>
                <TableHead className="text-[#6B7280]">Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-[#FAFAFA]">
                  <TableCell className="text-sm text-[#1A1A1A] whitespace-nowrap">
                    {formatDate(tx.date)}
                  </TableCell>
                  <TableCell className="text-sm text-[#1A1A1A]">
                    {tx.description || "—"}
                  </TableCell>
                  <TableCell
                    className={`text-sm font-medium text-right whitespace-nowrap ${
                      tx.amount >= 0 ? "text-[#16A34A]" : "text-[#DC2626]"
                    }`}
                  >
                    {tx.amount >= 0 ? "+" : ""}
                    {formatCurrency(tx.amount)}
                  </TableCell>
                  <TableCell className="text-sm text-[#6B7280]">
                    {tx.asset?.name || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-[#6B7280]">
                    {tx.asset?.entity?.name || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-[#6B7280]">
                    {tx.category || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs font-medium">
                      {TRANSACTION_TYPE_LABELS[tx.type] || tx.type}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-[#E5E7EB]">
          <ArrowLeftRight className="h-8 w-8 text-[#D1D5DB] mb-2" />
          <p className="text-sm text-[#9CA3AF]">Nessun movimento trovato</p>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Aggiungi il tuo primo movimento o modifica i filtri
          </p>
        </div>
      )}

      {/* New Transaction Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuovo Movimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Asset</Label>
              <Select
                value={form.asset_id}
                onValueChange={(v) => setForm({ ...form, asset_id: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleziona asset" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm({ ...form, type: v as AssetTransactionType })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(TRANSACTION_TYPE_LABELS) as [
                      AssetTransactionType,
                      string,
                    ][]
                  ).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Importo (&euro;)</Label>
              <Input
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0,00"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="es. Affitto, Stipendio"
                className="mt-1"
              />
            </div>
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
            <div>
              <Label>Controparte</Label>
              <Input
                value={form.counterparty}
                onChange={(e) =>
                  setForm({ ...form, counterparty: e.target.value })
                }
                placeholder="Opzionale"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Data</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="mt-1"
              />
            </div>
            <Button
              className="w-full bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
              onClick={handleSave}
              disabled={!form.amount}
            >
              Registra Movimento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
