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
import { formatCurrency } from "@/lib/utils/format";
import type { AssetWithRelations, Entity } from "@/types";

// ---------------------------------------------------------------------------
// Default bank colours (used when metadata.bank_color is missing)
// ---------------------------------------------------------------------------
const BANK_COLORS: Record<string, string> = {
  BNL: "#009639",
  Sella: "#0066CC",
  Fideuram: "#1B3C73",
  Unicredit: "#E30613",
  AMEX: "#006FCF",
  "Banca Generali": "#C8102E",
  Mediolanum: "#003DA5",
  Intesa: "#009B3A",
  "Monte Paschi": "#005C3C",
};

function bankColor(asset: AssetWithRelations): string {
  const meta = asset.metadata as Record<string, unknown> | null;
  if (meta?.bank_color && typeof meta.bank_color === "string") return meta.bank_color;
  const bank = (meta?.bank as string) ?? "";
  return BANK_COLORS[bank] || "#6B7280";
}

function bankName(asset: AssetWithRelations): string {
  const meta = asset.metadata as Record<string, unknown> | null;
  return (meta?.bank as string) ?? "";
}

export default function ContiPage() {
  const [accounts, setAccounts] = useState<AssetWithRelations[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialogs
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Update balance
  const [selectedAccount, setSelectedAccount] = useState<AssetWithRelations | null>(null);
  const [newBalance, setNewBalance] = useState("");

  // New account form
  const [newForm, setNewForm] = useState({
    name: "",
    bank: "",
    entity_id: "",
    initial_balance: "",
  });

  const supabase = createClient();

  // -----------------------------------------------------------------------
  // Fetch
  // -----------------------------------------------------------------------
  const fetchData = useCallback(async () => {
    const [assetsRes, entitiesRes] = await Promise.all([
      supabase
        .from("assets")
        .select("*, entity:entities(*), asset_class:asset_classes(*)")
        .eq("asset_class.name", "Conti Correnti")
        .order("created_at"),
      supabase
        .from("entities")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
    ]);

    if (assetsRes.data) {
      // Filter out rows where asset_class join was null (name didn't match)
      const filtered = (assetsRes.data as unknown as AssetWithRelations[]).filter(
        (a) => a.asset_class !== null && a.asset_class !== undefined
      );
      setAccounts(filtered);
    }
    if (entitiesRes.data) setEntities(entitiesRes.data as Entity[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // -----------------------------------------------------------------------
  // Derived data
  // -----------------------------------------------------------------------
  const totalLiquidity = accounts.reduce((sum, a) => sum + (a.current_value || 0), 0);

  // Group by entity
  const grouped = accounts.reduce<Record<string, AssetWithRelations[]>>((acc, a) => {
    const key = a.entity?.id ?? "__none__";
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  const entityOrder = Object.keys(grouped).sort((a, b) => {
    const ea = entities.find((e) => e.id === a);
    const eb = entities.find((e) => e.id === b);
    return (ea?.sort_order ?? 999) - (eb?.sort_order ?? 999);
  });

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------
  async function handleUpdateBalance() {
    if (!selectedAccount) return;
    const value = parseFloat(newBalance.replace(",", "."));
    if (isNaN(value)) {
      toast.error("Importo non valido");
      return;
    }
    const { error } = await supabase
      .from("assets")
      .update({
        current_value: value,
        last_valued_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedAccount.id);

    if (error) {
      toast.error("Errore nell'aggiornamento");
      return;
    }
    toast.success("Saldo aggiornato");
    setUpdateDialogOpen(false);
    setSelectedAccount(null);
    setNewBalance("");
    fetchData();
  }

  async function handleCreateAccount() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (!newForm.name || !newForm.bank) {
      toast.error("Nome e banca sono obbligatori");
      return;
    }

    // Resolve Conti Correnti asset class id
    const { data: acData } = await supabase
      .from("asset_classes")
      .select("id")
      .eq("name", "Conti Correnti")
      .single();

    if (!acData) {
      toast.error("Asset class 'Conti Correnti' non trovata");
      return;
    }

    const initialBalance = parseFloat(newForm.initial_balance.replace(",", ".")) || 0;
    const color = BANK_COLORS[newForm.bank] || "#6B7280";

    const { error } = await supabase.from("assets").insert({
      user_id: user.id,
      entity_id: newForm.entity_id || null,
      asset_class_id: acData.id,
      name: newForm.name,
      current_value: initialBalance,
      purchase_value: initialBalance,
      currency: "EUR",
      is_liquid: true,
      is_liability: false,
      metadata: { bank: newForm.bank, bank_color: color },
    });

    if (error) {
      toast.error("Errore nella creazione");
      return;
    }
    toast.success("Conto creato");
    setCreateDialogOpen(false);
    setNewForm({ name: "", bank: "", entity_id: "", initial_balance: "" });
    fetchData();
  }

  // -----------------------------------------------------------------------
  // Account card
  // -----------------------------------------------------------------------
  function renderAccountCard(account: AssetWithRelations) {
    const color = bankColor(account);
    const bank = bankName(account);
    const balance = account.current_value ?? 0;

    return (
      <div
        key={account.id}
        className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow"
        style={{ borderLeftWidth: 4, borderLeftColor: color }}
      >
        <div className="flex items-start justify-between">
          <div>
            {bank && (
              <p
                className="text-[11px] font-medium uppercase tracking-wider"
                style={{ color }}
              >
                {bank}
              </p>
            )}
            <p className="text-sm font-medium text-[#1A1A1A] mt-0.5">
              {account.name}
            </p>
          </div>
          <p
            className={`text-lg font-semibold ${
              balance > 0
                ? "text-[#4ECDC4]"
                : balance < 0
                ? "text-[#FF6B6B]"
                : "text-[#9CA3AF]"
            }`}
          >
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
              setNewBalance(String(balance).replace(".", ","));
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

  // -----------------------------------------------------------------------
  // Loading skeleton
  // -----------------------------------------------------------------------
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-64" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">
            Conti Bancari
          </h1>
          <p className="text-sm text-[#6B7280]">
            Liquidità totale:{" "}
            <span
              className={`font-semibold ${
                totalLiquidity >= 0 ? "text-[#4ECDC4]" : "text-[#FF6B6B]"
              }`}
            >
              {formatCurrency(totalLiquidity)}
            </span>
          </p>
        </div>
        <Button
          size="sm"
          className="bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Nuovo Conto
        </Button>
      </div>

      {/* Entity groups */}
      {entityOrder.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-[#E5E7EB]">
          <Wallet className="h-8 w-8 text-[#D1D5DB] mb-2" />
          <p className="text-sm text-[#9CA3AF]">Nessun conto registrato</p>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Aggiungi il tuo primo conto corrente
          </p>
        </div>
      )}

      {entityOrder.map((entityId) => {
        const groupAccounts = grouped[entityId];
        const entity = entities.find((e) => e.id === entityId);
        const entityName = entity?.name ?? "Senza Entità";
        const entityTotal = groupAccounts.reduce(
          (sum, a) => sum + (a.current_value ?? 0),
          0
        );

        return (
          <div key={entityId}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2">
                <Wallet className="h-4 w-4 text-[#E87A2E]" />
                {entityName}
              </h2>
              <span
                className={`text-sm font-semibold ${
                  entityTotal >= 0 ? "text-[#4ECDC4]" : "text-[#FF6B6B]"
                }`}
              >
                {formatCurrency(entityTotal)}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {groupAccounts.map(renderAccountCard)}
            </div>
          </div>
        );
      })}

      {/* ── Update Balance Dialog ───────────────────────────────── */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Aggiorna Saldo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-[#6B7280]">
              {bankName(selectedAccount!)} — {selectedAccount?.name}
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

      {/* ── New Account Dialog ──────────────────────────────────── */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuovo Conto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nome conto</Label>
              <Input
                value={newForm.name}
                onChange={(e) =>
                  setNewForm({ ...newForm, name: e.target.value })
                }
                placeholder="es. Conto Principale"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Banca</Label>
              <Input
                value={newForm.bank}
                onChange={(e) =>
                  setNewForm({ ...newForm, bank: e.target.value })
                }
                placeholder="es. BNL"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Entità</Label>
              <Select
                value={newForm.entity_id}
                onValueChange={(v) =>
                  setNewForm({ ...newForm, entity_id: v })
                }
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
            <div>
              <Label>Saldo iniziale (€)</Label>
              <Input
                value={newForm.initial_balance}
                onChange={(e) =>
                  setNewForm({ ...newForm, initial_balance: e.target.value })
                }
                placeholder="0,00"
                className="mt-1"
              />
            </div>
            <Button
              className="w-full bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
              onClick={handleCreateAccount}
              disabled={!newForm.name || !newForm.bank}
            >
              Crea Conto
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
