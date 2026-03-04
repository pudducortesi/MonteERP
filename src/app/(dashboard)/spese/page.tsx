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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Receipt, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils/deal";
import type { Transaction, Account, ExpenseCategory } from "@/types";

const DEFAULT_CATEGORIES = [
  { name: "Ristoranti", color: "#FF6B6B" },
  { name: "Shopping", color: "#4ECDC4" },
  { name: "Abbonamenti", color: "#45B7D1" },
  { name: "Energia", color: "#FFA07A" },
  { name: "Online/Tech", color: "#98D8C8" },
  { name: "Parcheggio", color: "#C9B1FF" },
  { name: "Tabaccherie", color: "#FFD93D" },
  { name: "Bar/Caffè", color: "#6BCB77" },
  { name: "Altro", color: "#95AFC0" },
];

export default function SpesePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    category: "",
    account_id: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const [txRes, accRes, catRes] = await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .eq("type", "expense")
        .order("date", { ascending: false })
        .limit(200),
      supabase.from("accounts").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("expense_categories").select("*").order("sort_order"),
    ]);

    if (txRes.data) setTransactions(txRes.data as Transaction[]);
    if (accRes.data) setAccounts(accRes.data as Account[]);
    if (catRes.data) setCategories(catRes.data as ExpenseCategory[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalExpenses = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Category breakdown
  const catMap: Record<string, number> = {};
  for (const tx of transactions) {
    const cat = tx.category || "Altro";
    catMap[cat] = (catMap[cat] || 0) + Math.abs(tx.amount);
  }
  const categoryBreakdown = Object.entries(catMap)
    .map(([name, value]) => ({
      name,
      value,
      pct: totalExpenses > 0 ? (value / totalExpenses) * 100 : 0,
      color: DEFAULT_CATEGORIES.find((c) => c.name === name)?.color || "#95AFC0",
    }))
    .sort((a, b) => b.value - a.value);

  // Monthly trend (last 6 months from transactions)
  const monthMap: Record<string, number> = {};
  for (const tx of transactions) {
    const d = new Date(tx.date);
    const key = d.toLocaleDateString("it-IT", { month: "short", year: "2-digit" });
    monthMap[key] = (monthMap[key] || 0) + Math.abs(tx.amount);
  }
  const monthlyTrend = Object.entries(monthMap)
    .slice(0, 6)
    .reverse()
    .map(([name, value]) => ({ name, value }));

  const categoryOptions = categories.length > 0
    ? categories.map((c) => ({ name: c.name, color: c.color }))
    : DEFAULT_CATEGORIES;

  async function handleCreateExpense() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const amount = parseFloat(form.amount.replace(",", "."));
    if (isNaN(amount) || amount <= 0) {
      toast.error("Importo non valido");
      return;
    }

    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      account_id: form.account_id || null,
      amount: -Math.abs(amount),
      type: "expense",
      category: form.category || null,
      description: form.description || null,
      date: form.date,
    });

    if (error) {
      toast.error("Errore nel salvataggio");
      return;
    }

    toast.success("Spesa registrata");
    setFormOpen(false);
    setForm({ amount: "", category: "", account_id: "", description: "", date: new Date().toISOString().split("T")[0] });
    fetchData();
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
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
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">Spese</h1>
          <p className="text-sm text-[#6B7280]">
            Totale: <span className="font-semibold text-[#FF6B6B]">{formatCurrency(totalExpenses)}</span>
          </p>
        </div>
        <Button
          size="sm"
          className="bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
          onClick={() => setFormOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Nuova Spesa
        </Button>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar chart per categoria */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Per Categoria</h3>
          {categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={categoryBreakdown}
                layout="vertical"
                margin={{ left: 0, right: 20, top: 0, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value as number), "Spesa"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                  {categoryBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Receipt className="h-8 w-8 text-[#D1D5DB] mb-2" />
              <p className="text-sm text-[#9CA3AF]">Nessun dato</p>
            </div>
          )}
        </div>

        {/* Trend mensile */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Trend Mensile</h3>
          {monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyTrend} margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value as number), "Spese"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }}
                />
                <Bar dataKey="value" fill="#FF6B6B" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Receipt className="h-8 w-8 text-[#D1D5DB] mb-2" />
              <p className="text-sm text-[#9CA3AF]">Nessun dato</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Table */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-x-auto shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[#6B7280]">Categoria</TableHead>
                <TableHead className="text-[#6B7280] text-right">Importo</TableHead>
                <TableHead className="text-[#6B7280] text-right">% Totale</TableHead>
                <TableHead className="text-[#6B7280] text-right">Media/Mese</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryBreakdown.map((cat) => {
                const months = Math.max(monthlyTrend.length, 1);
                return (
                  <TableRow key={cat.name} className="hover:bg-[#FAFAFA]">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-sm font-medium text-[#1A1A1A]">{cat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium text-[#1A1A1A]">
                      {formatCurrency(cat.value)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-[#6B7280]">
                      {cat.pct.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right text-sm text-[#6B7280]">
                      {formatCurrency(cat.value / months)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Import placeholder */}
      <div className="bg-white rounded-lg border-2 border-dashed border-[#E5E7EB] p-8 text-center">
        <Upload className="h-8 w-8 text-[#D1D5DB] mx-auto mb-2" />
        <p className="text-sm font-medium text-[#1A1A1A]">Carica estratto conto PDF</p>
        <p className="text-xs text-[#9CA3AF] mt-1">
          Carica nella chat Claude per importare automaticamente
        </p>
      </div>

      {/* New Expense Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuova Spesa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Importo (€)</Label>
              <Input
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0,00"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Conto</Label>
              <Select value={form.account_id} onValueChange={(v) => setForm({ ...form, account_id: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.bank} — {a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrizione</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
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
              onClick={handleCreateExpense}
              disabled={!form.amount}
            >
              Registra Spesa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
