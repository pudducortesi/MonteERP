// ============================================================
// Wealth Tracker Platform — TypeScript Types
// ============================================================

// ── User ──────────────────────────────────────────────────

export type UserRole = "admin" | "advisor" | "client" | "viewer";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Entities ──────────────────────────────────────────────

export type EntityType = "persona_fisica" | "societa" | "trust" | "fiduciaria" | "fondazione" | "holding" | "altro";

export interface Entity {
  id: string;
  user_id: string;
  name: string;
  type: EntityType;
  jurisdiction: string | null;
  tax_id: string | null;
  notes: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Asset Classes ──────────────────────────────────────────

export interface AssetClass {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  sort_order: number;
  created_at: string;
}

// ── Assets ──────────────────────────────────────────────────

export interface Asset {
  id: string;
  user_id: string;
  entity_id: string | null;
  asset_class_id: string | null;
  name: string;
  description: string | null;
  current_value: number;
  purchase_value: number | null;
  purchase_date: string | null;
  currency: string;
  metadata: Record<string, unknown>;
  is_liquid: boolean;
  is_liability: boolean;
  notes: string | null;
  last_valued_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetWithRelations extends Asset {
  entity?: Entity;
  asset_class?: AssetClass;
}

// ── Asset History ─────────────────────────────────────────

export interface AssetHistory {
  id: string;
  asset_id: string;
  value: number;
  date: string;
  source: string;
  created_at: string;
}

// ── Asset Transactions ────────────────────────────────────

export type AssetTransactionType = "income" | "expense" | "transfer_in" | "transfer_out" | "valuation" | "dividend" | "interest" | "capital_call" | "distribution";

export interface AssetTransaction {
  id: string;
  user_id: string;
  asset_id: string | null;
  amount: number;
  type: AssetTransactionType;
  category: string | null;
  description: string | null;
  counterparty: string | null;
  date: string;
  created_at: string;
}

export interface AssetTransactionWithRelations extends AssetTransaction {
  asset?: Asset & { entity?: Entity };
}

// ── Liabilities ──────────────────────────────────────────

export type LiabilityType = "mutuo" | "finanziamento" | "leasing" | "carta_credito" | "prestito" | "altro";

export interface Liability {
  id: string;
  user_id: string;
  entity_id: string | null;
  name: string;
  type: LiabilityType;
  original_amount: number | null;
  current_balance: number;
  interest_rate: number | null;
  monthly_payment: number | null;
  start_date: string | null;
  end_date: string | null;
  lender: string | null;
  collateral: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LiabilityWithRelations extends Liability {
  entity?: Entity;
}

// ── Label Maps ──────────────────────────────────────────

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  persona_fisica: "Persona Fisica",
  societa: "Società",
  trust: "Trust",
  fiduciaria: "Fiduciaria",
  fondazione: "Fondazione",
  holding: "Holding",
  altro: "Altro",
};

export const LIABILITY_TYPE_LABELS: Record<LiabilityType, string> = {
  mutuo: "Mutuo",
  finanziamento: "Finanziamento",
  leasing: "Leasing",
  carta_credito: "Carta di Credito",
  prestito: "Prestito",
  altro: "Altro",
};

export const TRANSACTION_TYPE_LABELS: Record<AssetTransactionType, string> = {
  income: "Entrata",
  expense: "Uscita",
  transfer_in: "Trasferimento In",
  transfer_out: "Trasferimento Out",
  valuation: "Rivalutazione",
  dividend: "Dividendo",
  interest: "Interessi",
  capital_call: "Capital Call",
  distribution: "Distribuzione",
};
