-- ============================================================
-- 004_wealth_platform.sql — Wealth Tracker Platform
-- ============================================================
-- New tables for wealth management: entities, assets, liabilities, etc.

-- ────────────────────────────────────────────────────────────
-- 1. ENTITIES (strutture di proprietà)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('persona_fisica', 'societa', 'trust', 'fiduciaria', 'fondazione', 'holding', 'altro')),
  jurisdiction text,
  tax_id text,
  notes text,
  color text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 2. ASSET CLASSES (tipologie asset configurabili)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS asset_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text,
  color text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 3. ASSETS (tutti gli asset — il cuore del sistema)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_id uuid REFERENCES entities(id) ON DELETE SET NULL,
  asset_class_id uuid REFERENCES asset_classes(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  current_value numeric DEFAULT 0,
  purchase_value numeric,
  purchase_date date,
  currency text DEFAULT 'EUR',
  metadata jsonb DEFAULT '{}'::jsonb,
  is_liquid boolean DEFAULT false,
  is_liability boolean DEFAULT false,
  notes text,
  last_valued_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 4. ASSET HISTORY (storico valori per grafico net worth)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS asset_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  value numeric NOT NULL,
  date date NOT NULL,
  source text DEFAULT 'manual',
  created_at timestamptz DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 5. ASSET TRANSACTIONS (movimenti su qualsiasi asset)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS asset_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense', 'transfer_in', 'transfer_out', 'valuation', 'dividend', 'interest', 'capital_call', 'distribution')),
  category text,
  description text,
  counterparty text,
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 6. LIABILITIES (debiti, mutui, finanziamenti)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS liabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_id uuid REFERENCES entities(id) ON DELETE SET NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('mutuo', 'finanziamento', 'leasing', 'carta_credito', 'prestito', 'altro')),
  original_amount numeric,
  current_balance numeric DEFAULT 0,
  interest_rate numeric,
  monthly_payment numeric,
  start_date date,
  end_date date,
  lender text,
  collateral text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 7. RLS POLICIES
-- ────────────────────────────────────────────────────────────

ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE liabilities ENABLE ROW LEVEL SECURITY;

-- Entities
CREATE POLICY "entities_user_access" ON entities
  FOR ALL USING (user_id = auth.uid());

-- Asset Classes
CREATE POLICY "asset_classes_user_access" ON asset_classes
  FOR ALL USING (user_id = auth.uid());

-- Assets
CREATE POLICY "assets_user_access" ON assets
  FOR ALL USING (user_id = auth.uid());

-- Asset History (via asset ownership)
CREATE POLICY "asset_history_user_access" ON asset_history
  FOR ALL USING (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = asset_history.asset_id AND assets.user_id = auth.uid())
  );

-- Asset Transactions
CREATE POLICY "asset_transactions_user_access" ON asset_transactions
  FOR ALL USING (user_id = auth.uid());

-- Liabilities
CREATE POLICY "liabilities_user_access" ON liabilities
  FOR ALL USING (user_id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- 8. INDEXES
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_entities_user ON entities(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_classes_user ON asset_classes(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_user ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_entity ON assets(entity_id);
CREATE INDEX IF NOT EXISTS idx_assets_class ON assets(asset_class_id);
CREATE INDEX IF NOT EXISTS idx_asset_history_asset ON asset_history(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_history_date ON asset_history(date);
CREATE INDEX IF NOT EXISTS idx_asset_transactions_user ON asset_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_transactions_asset ON asset_transactions(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_transactions_date ON asset_transactions(date);
CREATE INDEX IF NOT EXISTS idx_liabilities_user ON liabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_liabilities_entity ON liabilities(entity_id);
