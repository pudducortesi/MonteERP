-- ============================================================
-- 003: Personal Finance Tables
-- Gestionale Personale Puddu Cortesi
-- ============================================================

-- Tabella conti bancari
CREATE TABLE accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  bank text NOT NULL,
  entity text NOT NULL,
  account_type text DEFAULT 'checking',
  balance numeric DEFAULT 0,
  color text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_accounts" ON accounts FOR ALL USING (user_id = auth.uid());

-- Tabella transazioni/spese
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  account_id uuid REFERENCES accounts(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  type text NOT NULL DEFAULT 'expense',
  category text,
  description text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_transactions" ON transactions FOR ALL USING (user_id = auth.uid());

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);

-- Tabella investimenti
CREATE TABLE investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  current_value numeric DEFAULT 0,
  purchase_value numeric DEFAULT 0,
  purchase_date date,
  notes text,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_investments" ON investments FOR ALL USING (user_id = auth.uid());

-- Tabella forecast/budget mensile
CREATE TABLE monthly_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  month text NOT NULL,
  year integer NOT NULL,
  month_number integer NOT NULL,
  income numeric DEFAULT 0,
  expenses numeric DEFAULT 0,
  fee_earned numeric DEFAULT 0,
  entity text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, year, month_number)
);

ALTER TABLE monthly_summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_summary" ON monthly_summary FOR ALL USING (user_id = auth.uid());

-- Tabella categorie spese personalizzabili
CREATE TABLE expense_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#6B7280',
  icon text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_categories" ON expense_categories FOR ALL USING (user_id = auth.uid());
