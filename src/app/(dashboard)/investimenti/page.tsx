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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, Plus, Upload, Pencil } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils/deal";
import type { Investment, Account } from "@/types";

const CATEGORY_ICONS: Record<string, string> = {
  liquidita: "◈",
  immobili: "▣",
  titoli: "◆",
  crypto: "◎",
  altro: "○",
};

const CATEGORY_LABELS: Record<string, string> = {
  liquidita: "Liquidità",
  immobili: "Immobili",
  titoli: "Titoli/ETF",
  crypto: "Crypto",
  altro: "Altro",
};

export default function InvestimentiPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editInvestment, setEditInvestment] = useState<Investment | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: "titoli",
    current_value: "",
    purchase_value: "",
    purchase_date: "",
    notes: "",
  });
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const [invRes, accRes] = await Promise.all([
      supabase.from("investments").select("*").order("category").order("current_value", { ascending: false }),
      supabase.from("accounts").select("*").eq("is_active", true).order("sort_order"),
    ]);
    if (invRes.data) setInvestments(invRes.data as Investment[]);
    if (accRes.data) setAccounts(accRes.data as Account[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalLiquidity = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalInvestments = investments.reduce((sum, i) => sum + (i.current_value || 0), 0);
  const totalPatrimony = totalLiquidity + totalInvestments;

  // Per category
  const categoryTotals: Record<string, number> = { liquidita: totalLiquidity };
  for (const inv of investments) {
    categoryTotals[inv.category] = (categoryTotals[inv.category] || 0) + (inv.current_value || 0);
  }

  const kpiCards = [
    { key: "liquidita", label: "Liquidità", icon: "◈" },
    { key: "immobili", label: "Immobili", icon: "▣" },
    { key: "titoli", label: "Titoli/ETF", icon: "◆" },
    { key: "crypto", label: "Crypto", icon: "◎" },
  ];

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const currentVal = parseFloat(form.current_value.replace(",", ".")) || 0;
    const purchaseVal = parseFloat(form.purchase_value.replace(",", ".")) || 0;

    const payload = {
      user_id: user.id,
      name: form.name,
      category: form.category,
      current_value: currentVal,
      purchase_value: purchaseVal,
      purchase_date: form.purchase_date || null,
      notes: form.notes || null,
    };

    if (editInvestment) {
      const { error } = await supabase
        .from("investments")
        .update(payload)
        .eq("id", editInvestment.id);
      if (error) { toast.error("Errore nell'aggiornamento"); return; }
      toast.success("Investimento aggiornato");
    } else {
      const { error } = await supabase.from("investments").insert(payload);
      if (error) { toast.error("Errore nel salvataggio"); return; }
      toast.success("Investimento creato");
    }

    setFormOpen(false);
    setEditInvestment(null);
    setForm({ name: "", category: "titoli", current_value: "", purchase_value: "", purchase_date: "", notes: "" });
    fetchData();
  }

  function openEdit(inv: Investment) {
    setEditInvestment(inv);
    setForm({
      name: inv.name,
      category: inv.category,
      current_value: String(inv.current_value || 0).replace(".", ","),
      purchase_value: String(inv.purchase_value || 0).replace(".", ","),
      purchase_date: inv.purchase_date || "",
      notes: inv.notes || "",
    });
    setFormOpen(true);
  }

  function openNew() {
    setEditInvestment(null);
    setForm({ name: "", category: "titoli", current_value: "", purchase_value: "", purchase_date: "", notes: "" });
    setFormOpen(true);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">Investimenti</h1>
          <p className="text-sm text-[#6B7280]">
            Patrimonio totale: <span className="font-semibold text-[#1A1A1A]">{formatCurrency(totalPatrimony)}</span>
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
        {kpiCards.map((card) => {
          const value = categoryTotals[card.key] || 0;
          const pct = totalPatrimony > 0 ? (value / totalPatrimony) * 100 : 0;
          return (
            <div key={card.key} className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-[#6B7280] font-medium">{card.label}</p>
                  <p className="text-2xl font-semibold text-[#1A1A1A]">
                    {value === 0 ? "—" : formatCurrency(value)}
                  </p>
                  <span className="text-xs text-[#9CA3AF]">
                    {value === 0 ? "Da configurare" : `${pct.toFixed(1)}% del portafoglio`}
                  </span>
                </div>
                <span className="text-2xl text-[#E87A2E]">{card.icon}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Import placeholder */}
      <div className="bg-white rounded-lg border-2 border-dashed border-[#E5E7EB] p-8 text-center">
        <Upload className="h-8 w-8 text-[#D1D5DB] mx-auto mb-2" />
        <p className="text-sm font-medium text-[#1A1A1A]">Carica estratti conto e report portafoglio</p>
        <p className="text-xs text-[#9CA3AF] mt-1">
          Carica nella chat Claude per importare automaticamente
        </p>
      </div>

      {/* Investments Table */}
      {investments.length > 0 ? (
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-x-auto shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[#6B7280]">Nome</TableHead>
                <TableHead className="text-[#6B7280]">Categoria</TableHead>
                <TableHead className="text-[#6B7280] text-right">Valore Attuale</TableHead>
                <TableHead className="text-[#6B7280] text-right">Valore Acquisto</TableHead>
                <TableHead className="text-[#6B7280]">Data</TableHead>
                <TableHead className="text-[#6B7280] text-right">P&L</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.map((inv) => {
                const pnl = (inv.current_value || 0) - (inv.purchase_value || 0);
                return (
                  <TableRow key={inv.id} className="hover:bg-[#FAFAFA]">
                    <TableCell className="font-medium text-[#1A1A1A]">{inv.name}</TableCell>
                    <TableCell className="text-sm text-[#6B7280]">
                      <span className="mr-1">{CATEGORY_ICONS[inv.category] || "○"}</span>
                      {CATEGORY_LABELS[inv.category] || inv.category}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium text-[#1A1A1A]">
                      {formatCurrency(inv.current_value)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-[#6B7280]">
                      {formatCurrency(inv.purchase_value)}
                    </TableCell>
                    <TableCell className="text-sm text-[#6B7280]">
                      {inv.purchase_date ? new Date(inv.purchase_date).toLocaleDateString("it-IT") : "—"}
                    </TableCell>
                    <TableCell className={`text-right text-sm font-medium ${pnl >= 0 ? "text-[#4ECDC4]" : "text-[#FF6B6B]"}`}>
                      {pnl === 0 ? "—" : `${pnl > 0 ? "+" : ""}${formatCurrency(pnl)}`}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(inv)}>
                        <Pencil className="h-3.5 w-3.5 text-[#6B7280]" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-[#E5E7EB]">
          <TrendingUp className="h-8 w-8 text-[#D1D5DB] mb-2" />
          <p className="text-sm text-[#9CA3AF]">Nessun investimento registrato</p>
          <p className="text-xs text-[#9CA3AF] mt-1">Aggiungi il tuo primo investimento</p>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editInvestment ? "Modifica Investimento" : "Nuovo Investimento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="es. ETF MSCI World"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="immobili">▣ Immobili</SelectItem>
                  <SelectItem value="titoli">◆ Titoli/ETF</SelectItem>
                  <SelectItem value="crypto">◎ Crypto</SelectItem>
                  <SelectItem value="liquidita">◈ Liquidità</SelectItem>
                  <SelectItem value="altro">○ Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Valore attuale (€)</Label>
                <Input
                  value={form.current_value}
                  onChange={(e) => setForm({ ...form, current_value: e.target.value })}
                  placeholder="0,00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Valore acquisto (€)</Label>
                <Input
                  value={form.purchase_value}
                  onChange={(e) => setForm({ ...form, purchase_value: e.target.value })}
                  placeholder="0,00"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Data acquisto</Label>
              <Input
                type="date"
                value={form.purchase_date}
                onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Note</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Opzionale"
                className="mt-1"
              />
            </div>
            <Button
              className="w-full bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
              onClick={handleSave}
              disabled={!form.name}
            >
              {editInvestment ? "Aggiorna" : "Crea"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
