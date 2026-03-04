-- ============================================================
-- Montesino Gestionale — Initial Database Schema
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. ENUM TYPES
-- ────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('admin', 'advisor', 'client', 'viewer');
CREATE TYPE deal_type AS ENUM ('buy_side', 'sell_side', 'advisory', 'valuation');
CREATE TYPE deal_status AS ENUM ('prospect', 'pitch', 'mandate_signed', 'analysis', 'marketing', 'negotiation', 'closing', 'completed', 'lost', 'on_hold');
CREATE TYPE deal_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE deal_member_role AS ENUM ('lead', 'member', 'viewer', 'client');
CREATE TYPE doc_type AS ENUM ('im', 'business_plan', 'contract', 'nda', 'teaser', 'financial', 'other');
CREATE TYPE activity_type AS ENUM ('call', 'meeting', 'email', 'note', 'status_change', 'document_upload');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE fee_status AS ENUM ('pending', 'partial', 'paid', 'overdue');
CREATE TYPE invoice_entity AS ENUM ('piva_forfettaria', 'assets_spa');

-- ────────────────────────────────────────────────────────────
-- 2. TABLES
-- ────────────────────────────────────────────────────────────

-- users
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  phone text,
  avatar_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- companies
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sector text,
  revenue_range text,
  employee_count integer,
  website text,
  address jsonb, -- {via, citta, cap, provincia, paese}
  notes text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- contacts
CREATE TABLE contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  role_title text,
  email text,
  phone text,
  is_decision_maker boolean DEFAULT false,
  linked_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  notes text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- deals
CREATE TABLE deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE,
  title text NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  deal_type deal_type NOT NULL,
  status deal_status NOT NULL DEFAULT 'prospect',
  priority deal_priority DEFAULT 'medium',
  deal_value numeric,
  success_fee_pct numeric(5,3),
  success_fee_min numeric,
  retainer_monthly numeric,
  mandate_date date,
  expected_close date,
  actual_close date,
  description text,
  notes text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- deal_members
CREATE TABLE deal_members (
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role_in_deal deal_member_role NOT NULL DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (deal_id, user_id)
);

-- documents
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  name text NOT NULL,
  doc_type doc_type DEFAULT 'other',
  storage_path text NOT NULL,
  version integer DEFAULT 1,
  is_client_visible boolean DEFAULT false,
  uploaded_by uuid REFERENCES users(id),
  file_size bigint,
  mime_type text,
  created_at timestamptz DEFAULT now()
);

-- success_fees
CREATE TABLE success_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid UNIQUE REFERENCES deals(id) ON DELETE CASCADE,
  deal_value_final numeric,
  fee_calculated numeric,
  fee_agreed numeric,
  payment_status fee_status DEFAULT 'pending',
  invoice_entity invoice_entity,
  paid_amount numeric DEFAULT 0,
  due_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- activities
CREATE TABLE activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  activity_type activity_type NOT NULL,
  title text NOT NULL,
  description text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- tasks
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES users(id),
  created_by uuid REFERENCES users(id),
  title text NOT NULL,
  description text,
  due_date timestamptz,
  status task_status DEFAULT 'todo',
  priority task_priority DEFAULT 'medium',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 3. UPDATED_AT TRIGGER
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON success_fees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ────────────────────────────────────────────────────────────
-- 4. INDEXES
-- ────────────────────────────────────────────────────────────

-- users
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- companies
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_sector ON companies(sector);
CREATE INDEX idx_companies_created_by ON companies(created_by);

-- contacts
CREATE INDEX idx_contacts_company_id ON contacts(company_id);
CREATE INDEX idx_contacts_full_name ON contacts(full_name);
CREATE INDEX idx_contacts_linked_user_id ON contacts(linked_user_id);
CREATE INDEX idx_contacts_created_by ON contacts(created_by);

-- deals
CREATE INDEX idx_deals_company_id ON deals(company_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_deal_type ON deals(deal_type);
CREATE INDEX idx_deals_priority ON deals(priority);
CREATE INDEX idx_deals_created_by ON deals(created_by);
CREATE INDEX idx_deals_expected_close ON deals(expected_close);

-- deal_members
CREATE INDEX idx_deal_members_user_id ON deal_members(user_id);
CREATE INDEX idx_deal_members_deal_id ON deal_members(deal_id);

-- documents
CREATE INDEX idx_documents_deal_id ON documents(deal_id);
CREATE INDEX idx_documents_doc_type ON documents(doc_type);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);

-- success_fees
CREATE INDEX idx_success_fees_deal_id ON success_fees(deal_id);
CREATE INDEX idx_success_fees_payment_status ON success_fees(payment_status);
CREATE INDEX idx_success_fees_invoice_entity ON success_fees(invoice_entity);

-- activities
CREATE INDEX idx_activities_deal_id ON activities(deal_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_activity_type ON activities(activity_type);
CREATE INDEX idx_activities_created_at ON activities(created_at);

-- tasks
CREATE INDEX idx_tasks_deal_id ON tasks(deal_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- ────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

-- Helper: check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if user is member of a deal
CREATE OR REPLACE FUNCTION is_deal_member(p_deal_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM deal_members WHERE deal_id = p_deal_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── users ──

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access" ON users
  FOR ALL USING (is_admin());

CREATE POLICY "users_read_own" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ── companies ──

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access" ON companies
  FOR ALL USING (is_admin());

CREATE POLICY "advisor_read_companies" ON companies
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'advisor')
  );

CREATE POLICY "advisor_insert_companies" ON companies
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'advisor')
  );

CREATE POLICY "advisor_update_companies" ON companies
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'advisor')
  );

-- ── contacts ──

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access" ON contacts
  FOR ALL USING (is_admin());

CREATE POLICY "advisor_read_contacts" ON contacts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'advisor')
  );

CREATE POLICY "advisor_insert_contacts" ON contacts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'advisor')
  );

CREATE POLICY "advisor_update_contacts" ON contacts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'advisor')
  );

-- ── deals ──

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access" ON deals
  FOR ALL USING (is_admin());

CREATE POLICY "member_read_deals" ON deals
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM deal_members WHERE deal_id = deals.id
    )
  );

CREATE POLICY "advisor_insert_deals" ON deals
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'advisor')
  );

CREATE POLICY "lead_update_deals" ON deals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM deal_members
      WHERE deal_id = deals.id
      AND user_id = auth.uid()
      AND role_in_deal IN ('lead', 'member')
    )
  );

-- ── deal_members ──

ALTER TABLE deal_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access" ON deal_members
  FOR ALL USING (is_admin());

CREATE POLICY "member_read_deal_members" ON deal_members
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM deal_members dm WHERE dm.deal_id = deal_members.deal_id
    )
  );

CREATE POLICY "lead_manage_deal_members" ON deal_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM deal_members dm
      WHERE dm.deal_id = deal_members.deal_id
      AND dm.user_id = auth.uid()
      AND dm.role_in_deal = 'lead'
    )
  );

CREATE POLICY "lead_delete_deal_members" ON deal_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM deal_members dm
      WHERE dm.deal_id = deal_members.deal_id
      AND dm.user_id = auth.uid()
      AND dm.role_in_deal = 'lead'
    )
  );

-- ── documents ──

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access" ON documents
  FOR ALL USING (is_admin());

CREATE POLICY "member_read_documents" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_members
      WHERE deal_id = documents.deal_id
      AND user_id = auth.uid()
      AND role_in_deal IN ('lead', 'member', 'viewer')
    )
  );

CREATE POLICY "client_read_visible_documents" ON documents
  FOR SELECT USING (
    is_client_visible = true AND
    EXISTS (
      SELECT 1 FROM deal_members
      WHERE deal_id = documents.deal_id
      AND user_id = auth.uid()
      AND role_in_deal = 'client'
    )
  );

CREATE POLICY "advisor_insert_documents" ON documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM deal_members
      WHERE deal_id = documents.deal_id
      AND user_id = auth.uid()
      AND role_in_deal IN ('lead', 'member')
    )
  );

CREATE POLICY "lead_update_documents" ON documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM deal_members
      WHERE deal_id = documents.deal_id
      AND user_id = auth.uid()
      AND role_in_deal IN ('lead', 'member')
    )
  );

CREATE POLICY "lead_delete_documents" ON documents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM deal_members
      WHERE deal_id = documents.deal_id
      AND user_id = auth.uid()
      AND role_in_deal = 'lead'
    )
  );

-- ── success_fees ──

ALTER TABLE success_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access" ON success_fees
  FOR ALL USING (is_admin());

CREATE POLICY "member_read_fees" ON success_fees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_members
      WHERE deal_id = success_fees.deal_id
      AND user_id = auth.uid()
      AND role_in_deal IN ('lead', 'member')
    )
  );

CREATE POLICY "lead_manage_fees" ON success_fees
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM deal_members
      WHERE deal_id = success_fees.deal_id
      AND user_id = auth.uid()
      AND role_in_deal = 'lead'
    )
  );

CREATE POLICY "lead_update_fees" ON success_fees
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM deal_members
      WHERE deal_id = success_fees.deal_id
      AND user_id = auth.uid()
      AND role_in_deal = 'lead'
    )
  );

-- ── activities ──

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access" ON activities
  FOR ALL USING (is_admin());

CREATE POLICY "member_read_activities" ON activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_members
      WHERE deal_id = activities.deal_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "member_insert_activities" ON activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM deal_members
      WHERE deal_id = activities.deal_id
      AND user_id = auth.uid()
      AND role_in_deal IN ('lead', 'member')
    )
  );

-- ── tasks ──

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access" ON tasks
  FOR ALL USING (is_admin());

CREATE POLICY "assignee_read_tasks" ON tasks
  FOR SELECT USING (
    assigned_to = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM deal_members
      WHERE deal_id = tasks.deal_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "member_insert_tasks" ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'advisor'))
  );

CREATE POLICY "assignee_update_tasks" ON tasks
  FOR UPDATE USING (
    assigned_to = auth.uid()
    OR created_by = auth.uid()
    OR is_admin()
  );

CREATE POLICY "creator_delete_tasks" ON tasks
  FOR DELETE USING (
    created_by = auth.uid() OR is_admin()
  );
