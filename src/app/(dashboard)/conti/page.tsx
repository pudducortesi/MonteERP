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
import { Wallet, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils/deal";
import type { Account } from "@/types";

const BANK_COLORS: Record<string, string> = {
  BNL: "#009639",
  Sella: "#0066CC",
  Fideuram: "#1B3C73",
  Unicredit: "#E30613",
  AMEX: "#006FCF",
};

export default function ContiPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [newBalance, setNewBalance] = useState("");
  const [newAccountForm, setNewAccountForm] = useState({
    name: "",
    bank: "",
    entity: "piva" as "piva" | "spa",
    account_type: "checking",
  });
  const supabase = createClient();

  const fetchAccounts = useCallback(async () => {
    const { data } = await supabase
      .from("accounts")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (data) setAccounts(data as Account[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const totalLiquidity = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const pivaAccounts = accounts.filter((a) => a.entity === "piva");
  const spaAccounts = accounts.filter((a) => a.entity === "spa");

  async function handleUpdateBalance() {
    if (!selectedAccount) return;
    const balance = parseFloat(newBalance.replace(",", "."));
    if (isNaN(balance)) {
      toast.error("Importo non valido");
      return;
    }
    const { error } = await supabase
      .from("accounts")
      .update({ balance, updated_at: new Date().toISOString() })
      .eq("id", selectedAccount.id);
    if (error) {
      toast.error("Errore nell'aggiornamento");
      return;
    }
    toast.success("Saldo aggiornato");
    setUpdateDialogOpen(false);
    setSelectedAccount(null);
    setNewBalance("");
    fetchAccounts();
  }

  async function handleCreateAccount() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const color = BANK_COLORS[newAccountForm.bank] || "#6B7280";
    const { error } = await supabase.from("accounts").insert({
      user_id: user.id,
      name: newAccountForm.name,
      bank: newAccountForm.bank,
      entity: newAccountForm.entity,
      account_type: newAccountForm.account_type,
      color,
      sort_order: accounts.length,
    });
    if (error) {
      toast.error("Errore nella creazione");
      return;
    }
    toast.success("Conto creato");
    setDialogOpen(false);
    setNewAccountForm({ name: "", bank: "", entity: "piva", account_type: "checking" });
    fetchAccounts();
  }

  function renderAccountCard(account: Account) {
    const borderColor = account.color || BANK_COLORS[account.bank] || "#E5E7EB";
    const balance = account.balance || 0;

    return (
      <div
        key={account.id}
        className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow"
        style={{ borderLeftWidth: 4, borderLeftColor: borderColor }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: borderColor }}>
              {account.bank}
            </p>
            <p className="text-sm font-medium text-[#1A1A1A] mt-0.5">{account.name}</p>
          </div>
          <p className={`text-lg font-semibold ${balance > 0 ? "text-[#4ECDC4]" : balance < 0 ? "text-[#FF6B6B]" : "text-[#9CA3AF]"}`}>
            {balance === 0 ? "—" : formatCurrency(balance)}
          </p>
        </div>
        <div className="mt-3 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-[#6B7280] hover:text-[#E87A2E]"
            onClick={() => {
              setSelectedAccount(account);
              setNewBalance(String(account.balance || 0).replace(".", ","));
              setUpdateDialogOpen(true);
            }}
          >
            <Pencil className="h-3 w-3 mr-1" />
            Aggiorna Saldo
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">Conti Bancari</h1>
          <p className="text-sm text-[#6B7280]">
            Liquidità totale: <span className={`font-semibold ${totalLiquidity >= 0 ? "text-[#4ECDC4]" : "text-[#FF6B6B]"}`}>{formatCurrency(totalLiquidity)}</span>
          </p>
        </div>
        <Button
          size="sm"
          className="bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Nuovo Conto
        </Button>
      </div>

      {/* P.IVA Forfettaria */}
      <div>
        <h2 className="text-sm font-semibold text-[#1A1A1A] mb-3 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-[#E87A2E]" />
          P.IVA Forfettaria
        </h2>
        {pivaAccounts.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {pivaAccounts.map(renderAccountCard)}
          </div>
        ) : (
          <p className="text-sm text-[#9CA3AF] py-4">Nessun conto per P.IVA Forfettaria</p>
        )}
      </div>

      {/* Assets SpA */}
      <div>
        <h2 className="text-sm font-semibold text-[#1A1A1A] mb-3 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-[#E87A2E]" />
          Assets SpA
        </h2>
        {spaAccounts.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {spaAccounts.map(renderAccountCard)}
          </div>
        ) : (
          <p className="text-sm text-[#9CA3AF] py-4">Nessun conto per Assets SpA</p>
        )}
      </div>

      {/* Update Balance Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Aggiorna Saldo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-[#6B7280]">
              {selectedAccount?.bank} — {selectedAccount?.name}
            </p>
            <div>
              <Label>Nuovo saldo (€)</Label>
              <Input
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                placeholder="0,00"
                className="mt-1"
              />
            </div>
            <Button
              className="w-full bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
              onClick={handleUpdateBalance}
            >
              Aggiorna
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Account Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuovo Conto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nome conto</Label>
              <Input
                value={newAccountForm.name}
                onChange={(e) => setNewAccountForm({ ...newAccountForm, name: e.target.value })}
                placeholder="es. BNL CC"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Banca</Label>
              <Input
                value={newAccountForm.bank}
                onChange={(e) => setNewAccountForm({ ...newAccountForm, bank: e.target.value })}
                placeholder="es. BNL"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Entità</Label>
              <Select
                value={newAccountForm.entity}
                onValueChange={(v) => setNewAccountForm({ ...newAccountForm, entity: v as "piva" | "spa" })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="piva">P.IVA Forfettaria</SelectItem>
                  <SelectItem value="spa">Assets SpA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo conto</Label>
              <Select
                value={newAccountForm.account_type}
                onValueChange={(v) => setNewAccountForm({ ...newAccountForm, account_type: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Conto Corrente</SelectItem>
                  <SelectItem value="credit_card">Carta di Credito</SelectItem>
                  <SelectItem value="investment">Investimento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
              onClick={handleCreateAccount}
              disabled={!newAccountForm.name || !newAccountForm.bank}
            >
              Crea Conto
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
