-- ============================================================
-- Montesino Gestionale — Migration 002: Practice Areas & Extensions
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. PRACTICE AREA ENUM
-- ────────────────────────────────────────────────────────────

CREATE TYPE practice_area AS ENUM (
  'debt_grant',
  'ma_capital_markets',
  'transformation',
  'individuals_patrimony',
  'corporate_protection',
  'communication',
  'public_affairs',
  'leaders_factory'
);

-- ────────────────────────────────────────────────────────────
-- 2. EXTEND DEAL_TYPE ENUM
-- ────────────────────────────────────────────────────────────

ALTER TYPE deal_type ADD VALUE 'debt_advisory';
ALTER TYPE deal_type ADD VALUE 'grant_funding';
ALTER TYPE deal_type ADD VALUE 'transformation';
ALTER TYPE deal_type ADD VALUE 'corporate_protection';
ALTER TYPE deal_type ADD VALUE 'communication';
ALTER TYPE deal_type ADD VALUE 'public_affairs';
ALTER TYPE deal_type ADD VALUE 'leaders_factory';
ALTER TYPE deal_type ADD VALUE 'patrimony';

-- ────────────────────────────────────────────────────────────
-- 3. ADD COLUMNS TO DEALS
-- ────────────────────────────────────────────────────────────

ALTER TABLE deals ADD COLUMN practice_area practice_area;
ALTER TABLE deals ADD COLUMN sub_service text;

CREATE INDEX idx_deals_practice_area ON deals(practice_area);

-- ────────────────────────────────────────────────────────────
-- 4. ADD FINANCIAL COLUMNS TO COMPANIES
-- ────────────────────────────────────────────────────────────

ALTER TABLE companies ADD COLUMN revenue numeric;
ALTER TABLE companies ADD COLUMN ebitda numeric;
ALTER TABLE companies ADD COLUMN net_debt numeric;
ALTER TABLE companies ADD COLUMN fiscal_year text;

-- ────────────────────────────────────────────────────────────
-- 5. DEAL NOTES TABLE
-- ────────────────────────────────────────────────────────────

CREATE TABLE deal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  content text NOT NULL,
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_deal_notes_deal_id ON deal_notes(deal_id);
CREATE INDEX idx_deal_notes_user_id ON deal_notes(user_id);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON deal_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS for deal_notes
ALTER TABLE deal_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access" ON deal_notes
  FOR ALL USING (is_admin());

CREATE POLICY "member_read_deal_notes" ON deal_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_members
      WHERE deal_id = deal_notes.deal_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "member_insert_deal_notes" ON deal_notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM deal_members
      WHERE deal_id = deal_notes.deal_id
      AND user_id = auth.uid()
      AND role_in_deal IN ('lead', 'member')
    )
  );

CREATE POLICY "author_update_deal_notes" ON deal_notes
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "author_delete_deal_notes" ON deal_notes
  FOR DELETE USING (user_id = auth.uid() OR is_admin());

-- ────────────────────────────────────────────────────────────
-- 6. DEAL COUNTERPARTIES TABLE
-- ────────────────────────────────────────────────────────────

CREATE TABLE deal_counterparties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id),
  contact_id uuid REFERENCES contacts(id),
  role text, -- 'buyer', 'investor', 'lender', 'partner', 'target'
  status text DEFAULT 'contacted', -- 'contacted', 'interested', 'nda_signed', 'in_dd', 'offer_made', 'declined', 'closed'
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_deal_counterparties_deal_id ON deal_counterparties(deal_id);
CREATE INDEX idx_deal_counterparties_company_id ON deal_counterparties(company_id);
CREATE INDEX idx_deal_counterparties_contact_id ON deal_counterparties(contact_id);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON deal_counterparties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS for deal_counterparties
ALTER TABLE deal_counterparties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access" ON deal_counterparties
  FOR ALL USING (is_admin());

CREATE POLICY "member_read_counterparties" ON deal_counterparties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_members
      WHERE deal_id = deal_counterparties.deal_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "member_insert_counterparties" ON deal_counterparties
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM deal_members
      WHERE deal_id = deal_counterparties.deal_id
      AND user_id = auth.uid()
      AND role_in_deal IN ('lead', 'member')
    )
  );

CREATE POLICY "member_update_counterparties" ON deal_counterparties
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM deal_members
      WHERE deal_id = deal_counterparties.deal_id
      AND user_id = auth.uid()
      AND role_in_deal IN ('lead', 'member')
    )
  );

CREATE POLICY "lead_delete_counterparties" ON deal_counterparties
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM deal_members
      WHERE deal_id = deal_counterparties.deal_id
      AND user_id = auth.uid()
      AND role_in_deal = 'lead'
    )
  );
