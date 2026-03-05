"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Landmark,
  Plus,
  Pencil,
  CalendarClock,
  Percent,
  CreditCard,
  TrendingDown,
  Scale,
  Clock,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import {
  formatCurrency,
  formatDate,
  formatPercent,
} from "@/lib/utils/format";
import type {
  Entity,
  Liability,
  LiabilityWithRelations,
  LiabilityType,
} from "@/types";
import { LIABILITY_TYPE_LABELS } from "@/types";

// ── Component ───────────────────────────────────────────────
export default function DebitiPage() {
  const [liabilities, setLiabilities] = useState<LiabilityWithRelations[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [totalAssetsValue, setTotalAssetsValue] = useState(0);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editLiability, setEditLiability] =
    useState<LiabilityWithRelations | null>(null);
  const [form, setForm] = useState({
    name: "",
    entity_id: "",
    type: "mutuo" as LiabilityType,
    original_amount: "",
    current_balance: "",
    interest_rate: "",
    monthly_payment: "",
    start_date: "",
    end_date: "",
    lender: "",
    collateral: "",
    notes: "",
  });

  const supabase = createClient();

  // ── Fetch ───────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    const [liabRes, entitiesRes, assetsRes] = await Promise.all([
      supabase
        .from("liabilities")
        .select("*, entity:entities(*)")
        .order("current_balance", { ascending: false }),
      supabase
        .from("entities")
        .select("*")
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("assets")
        .select("current_value"),
    ]);

    if (liabRes.data)
      setLiabilities(liabRes.data as LiabilityWithRelations[]);
    if (entitiesRes.data) setEntities(entitiesRes.data as Entity[]);
    if (assetsRes.data) {
      const total = (assetsRes.data as { current_value: number }[]).reduce(
        (s, a) => s + (a.current_value || 0),
        0
      );
      setTotalAssetsValue(total);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Derived KPIs ──────────────────────────────────────────
  const totalDebt = useMemo(
    () => liabilities.reduce((s, l) => s + (l.current_balance || 0), 0),
    [liabilities]
  );

  const totalMonthlyPayment = useMemo(
    () => liabilities.reduce((s, l) => s + (l.monthly_payment || 0), 0),
    [liabilities]
  );

  const debtToAssetRatio = useMemo(
    () => (totalAssetsValue > 0 ? (totalDebt / totalAssetsValue) * 100 : 0),
    [totalDebt, totalAssetsValue]
  );

  const nextMaturity = useMemo(() => {
    const now = new Date().toISOString();
    const future = liabilities
      .filter((l) => l.end_date && l.end_date >= now.slice(0, 10))
      .sort((a, b) => (a.end_date! > b.end_date! ? 1 : -1));
    return future.length > 0 ? future[0].end_date : null;
  }, [liabilities]);

  // ── Handlers ──────────────────────────────────────────────
  function openNew() {
    setEditLiability(null);
    setForm({
      name: "",
      entity_id: "",
      type: "mutuo",
      original_amount: "",
      current_balance: "",
      interest_rate: "",
      monthly_payment: "",
      start_date: "",
      end_date: "",
      lender: "",
      collateral: "",
      notes: "",
    });
    setDialogOpen(true);
  }

  function openEdit(liability: LiabilityWithRelations) {
    setEditLiability(liability);
    setForm({
      name: liability.name,
      entity_id: liability.entity_id || "",
      type: liability.type,
      original_amount: String(liability.original_amount || 0).replace(".", ","),
      current_balance: String(liability.current_balance || 0).replace(".", ","),
      interest_rate: String(liability.interest_rate || 0).replace(".", ","),
      monthly_payment: String(liability.monthly_payment || 0).replace(
        ".",
        ","
      ),
      start_date: liability.start_date || "",
      end_date: liability.end_date || "",
      lender: liability.lender || "",
      collateral: liability.collateral || "",
      notes: liability.notes || "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const parseNum = (v: string) =>
      parseFloat(v.replace(",", ".")) || 0;

    const payload = {
      user_id: user.id,
      name: form.name,
      entity_id: form.entity_id || null,
      type: form.type,
      original_amount: parseNum(form.original_amount) || null,
      current_balance: parseNum(form.current_balance),
      interest_rate: parseNum(form.interest_rate) || null,
      monthly_payment: parseNum(form.monthly_payment) || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      lender: form.lender || null,
      collateral: form.collateral || null,
      notes: form.notes || null,
    };

    if (editLiability) {
      const { error } = await supabase
        .from("liabilities")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", editLiability.id);
      if (error) {
        toast.error("Errore nell'aggiornamento");
        return;
      }
      toast.success("Debito aggiornato");
    } else {
      const { error } = await supabase.from("liabilities").insert(payload);
      if (error) {
        toast.error("Errore nel salvataggio");
        return;
      }
      toast.success("Debito creato");
    }

    setDialogOpen(false);
    setEditLiability(null);
    fetchData();
  }

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
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
            Debiti e Finanziamenti
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Gestione passivit\u00e0 e finanziamenti attivi
          </p>
        </div>
        <Button
          size="sm"
          className="bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
          onClick={openNew}
        >
          <Plus className="h-4 w-4 mr-1" />
          Nuovo Debito
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Debito Totale */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-[#6B7280] font-medium">
                Debito Totale
              </p>
              <p className="text-2xl font-semibold text-[#FF6B6B]">
                {formatCurrency(totalDebt)}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-[#FF6B6B]/10 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-[#FF6B6B]" />
            </div>
          </div>
        </div>

        {/* Rata Mensile Totale */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-[#6B7280] font-medium">
                Rata Mensile Totale
              </p>
              <p className="text-2xl font-semibold text-[#1A1A1A]">
                {formatCurrency(totalMonthlyPayment)}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-[#E87A2E]/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-[#E87A2E]" />
            </div>
          </div>
        </div>

        {/* Debt-to-Asset Ratio */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-[#6B7280] font-medium">
                Debt-to-Asset Ratio
              </p>
              <p
                className={`text-2xl font-semibold ${
                  debtToAssetRatio > 50
                    ? "text-[#FF6B6B]"
                    : debtToAssetRatio > 30
                      ? "text-[#F59E0B]"
                      : "text-[#4ECDC4]"
                }`}
              >
                {debtToAssetRatio.toFixed(1)}%
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
              <Scale className="h-5 w-5 text-[#3B82F6]" />
            </div>
          </div>
        </div>

        {/* Prossima Scadenza */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-[#6B7280] font-medium">
                Prossima Scadenza
              </p>
              <p className="text-2xl font-semibold text-[#1A1A1A]">
                {nextMaturity ? formatDate(nextMaturity) : "—"}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-[#8B5CF6]" />
            </div>
          </div>
        </div>
      </div>

      {/* Liability Cards */}
      {liabilities.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {liabilities.map((liability) => {
            const paidPercent =
              liability.original_amount && liability.original_amount > 0
                ? ((liability.original_amount - liability.current_balance) /
                    liability.original_amount) *
                  100
                : 0;

            return (
              <div
                key={liability.id}
                className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-[#1A1A1A]">
                        {liability.name}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-medium"
                      >
                        {LIABILITY_TYPE_LABELS[liability.type] || liability.type}
                      </Badge>
                    </div>
                    {liability.lender && (
                      <p className="text-xs text-[#6B7280] flex items-center gap-1">
                        <Landmark className="h-3 w-3" />
                        {liability.lender}
                      </p>
                    )}
                    {liability.entity && (
                      <p className="text-xs text-[#9CA3AF]">
                        {liability.entity.name}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(liability)}
                  >
                    <Pencil className="h-3.5 w-3.5 text-[#6B7280]" />
                  </Button>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wider">
                      Saldo residuo
                    </p>
                    <p className="text-lg font-semibold text-[#FF6B6B]">
                      {formatCurrency(liability.current_balance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wider">
                      Rata mensile
                    </p>
                    <p className="text-lg font-semibold text-[#1A1A1A]">
                      {formatCurrency(liability.monthly_payment)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wider">
                      Tasso
                    </p>
                    <p className="text-sm font-medium text-[#1A1A1A] flex items-center gap-1">
                      <Percent className="h-3 w-3 text-[#6B7280]" />
                      {liability.interest_rate != null
                        ? `${liability.interest_rate.toFixed(2)}%`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wider">
                      Scadenza
                    </p>
                    <p className="text-sm font-medium text-[#1A1A1A] flex items-center gap-1">
                      <CalendarClock className="h-3 w-3 text-[#6B7280]" />
                      {formatDate(liability.end_date)}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                {liability.original_amount && liability.original_amount > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-[#9CA3AF] uppercase tracking-wider">
                        Pagato
                      </span>
                      <span className="text-xs font-medium text-[#4ECDC4]">
                        {paidPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4ECDC4] rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(paidPercent, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-[#9CA3AF]">
                        {formatCurrency(
                          (liability.original_amount || 0) -
                            liability.current_balance
                        )}{" "}
                        pagati
                      </span>
                      <span className="text-[10px] text-[#9CA3AF]">
                        di {formatCurrency(liability.original_amount)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Collateral */}
                {liability.collateral && (
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7280] border-t border-[#F3F4F6] pt-3">
                    <Shield className="h-3 w-3 text-[#E87A2E]" />
                    <span className="font-medium">Garanzia:</span>{" "}
                    {liability.collateral}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-[#E5E7EB]">
          <Landmark className="h-8 w-8 text-[#D1D5DB] mb-2" />
          <p className="text-sm text-[#9CA3AF]">
            Nessun debito o finanziamento registrato
          </p>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Aggiungi il tuo primo finanziamento
          </p>
        </div>
      )}

      {/* ── New / Edit Dialog ─────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editLiability ? "Modifica Debito" : "Nuovo Debito"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Nome */}
            <div>
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="es. Mutuo Casa Milano"
                className="mt-1"
              />
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

            {/* Type */}
            <div>
              <Label>Tipo</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm({ ...form, type: v as LiabilityType })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(LIABILITY_TYPE_LABELS) as [
                      LiabilityType,
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

            {/* Amounts */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Importo originale (&euro;)</Label>
                <Input
                  value={form.original_amount}
                  onChange={(e) =>
                    setForm({ ...form, original_amount: e.target.value })
                  }
                  placeholder="0,00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Saldo residuo (&euro;)</Label>
                <Input
                  value={form.current_balance}
                  onChange={(e) =>
                    setForm({ ...form, current_balance: e.target.value })
                  }
                  placeholder="0,00"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Rate & Payment */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tasso interesse (%)</Label>
                <Input
                  value={form.interest_rate}
                  onChange={(e) =>
                    setForm({ ...form, interest_rate: e.target.value })
                  }
                  placeholder="0,00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Rata mensile (&euro;)</Label>
                <Input
                  value={form.monthly_payment}
                  onChange={(e) =>
                    setForm({ ...form, monthly_payment: e.target.value })
                  }
                  placeholder="0,00"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data inizio</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) =>
                    setForm({ ...form, start_date: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Data scadenza</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) =>
                    setForm({ ...form, end_date: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            {/* Lender */}
            <div>
              <Label>Finanziatore</Label>
              <Input
                value={form.lender}
                onChange={(e) => setForm({ ...form, lender: e.target.value })}
                placeholder="es. Intesa Sanpaolo"
                className="mt-1"
              />
            </div>

            {/* Collateral */}
            <div>
              <Label>Garanzia / Collaterale</Label>
              <Input
                value={form.collateral}
                onChange={(e) =>
                  setForm({ ...form, collateral: e.target.value })
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

            {/* Submit */}
            <Button
              className="w-full bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
              onClick={handleSave}
              disabled={!form.name}
            >
              {editLiability ? "Aggiorna" : "Crea Debito"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
