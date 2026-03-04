// ────────────────────────────────────────────────────────────
// Enum Types
// ────────────────────────────────────────────────────────────

export type UserRole = "admin" | "advisor" | "client" | "viewer";

export type PracticeArea =
  | "debt_grant"
  | "ma_capital_markets"
  | "transformation"
  | "individuals_patrimony"
  | "corporate_protection"
  | "communication"
  | "public_affairs"
  | "leaders_factory";

export type DealType =
  | "buy_side"
  | "sell_side"
  | "advisory"
  | "valuation"
  | "debt_advisory"
  | "grant_funding"
  | "transformation"
  | "corporate_protection"
  | "communication"
  | "public_affairs"
  | "leaders_factory"
  | "patrimony";

export type DealStatus =
  | "prospect"
  | "pitch"
  | "mandate_signed"
  | "analysis"
  | "marketing"
  | "negotiation"
  | "closing"
  | "completed"
  | "lost"
  | "on_hold";

export type DealPriority = "low" | "medium" | "high" | "critical";

export type DealMemberRole = "lead" | "member" | "viewer" | "client";

export type DocType =
  | "im"
  | "business_plan"
  | "contract"
  | "nda"
  | "teaser"
  | "financial"
  | "other";

export type ActivityType =
  | "call"
  | "meeting"
  | "email"
  | "note"
  | "status_change"
  | "document_upload";

export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";

export type TaskPriority = "low" | "medium" | "high";

export type FeeStatus = "pending" | "partial" | "paid" | "overdue";

export type InvoiceEntity = "piva_forfettaria" | "assets_spa";

export type CounterpartyRole = "buyer" | "investor" | "lender" | "partner" | "target";

export type CounterpartyStatus =
  | "contacted"
  | "interested"
  | "nda_signed"
  | "in_dd"
  | "offer_made"
  | "declined"
  | "closed";

// ────────────────────────────────────────────────────────────
// Table Types
// ────────────────────────────────────────────────────────────

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

export interface CompanyAddress {
  via?: string;
  citta?: string;
  cap?: string;
  provincia?: string;
  paese?: string;
}

export interface Company {
  id: string;
  name: string;
  sector: string | null;
  revenue_range: string | null;
  employee_count: number | null;
  website: string | null;
  address: CompanyAddress | null;
  notes: string | null;
  revenue: number | null;
  ebitda: number | null;
  net_debt: number | null;
  fiscal_year: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  company_id: string | null;
  full_name: string;
  role_title: string | null;
  email: string | null;
  phone: string | null;
  is_decision_maker: boolean;
  linked_user_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  code: string | null;
  title: string;
  company_id: string | null;
  deal_type: DealType;
  status: DealStatus;
  priority: DealPriority;
  practice_area: PracticeArea | null;
  sub_service: string | null;
  deal_value: number | null;
  success_fee_pct: number | null;
  success_fee_min: number | null;
  retainer_monthly: number | null;
  mandate_date: string | null;
  expected_close: string | null;
  actual_close: string | null;
  description: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DealMember {
  deal_id: string;
  user_id: string;
  role_in_deal: DealMemberRole;
  joined_at: string;
}

export interface Document {
  id: string;
  deal_id: string;
  name: string;
  doc_type: DocType;
  storage_path: string;
  version: number;
  is_client_visible: boolean;
  uploaded_by: string | null;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
}

export interface SuccessFee {
  id: string;
  deal_id: string;
  deal_value_final: number | null;
  fee_calculated: number | null;
  fee_agreed: number | null;
  payment_status: FeeStatus;
  invoice_entity: InvoiceEntity | null;
  paid_amount: number;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  deal_id: string;
  user_id: string | null;
  activity_type: ActivityType;
  title: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Task {
  id: string;
  deal_id: string | null;
  assigned_to: string | null;
  created_by: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
}

export interface DealNote {
  id: string;
  deal_id: string;
  user_id: string | null;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface DealCounterparty {
  id: string;
  deal_id: string;
  company_id: string | null;
  contact_id: string | null;
  role: CounterpartyRole | null;
  status: CounterpartyStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ────────────────────────────────────────────────────────────
// Composite / Joined Types
// ────────────────────────────────────────────────────────────

export interface DealWithRelations extends Deal {
  company?: Company | null;
  deal_members?: (DealMember & { user?: User })[];
}

export interface DealCounterpartyWithRelations extends DealCounterparty {
  company?: Company | null;
  contact?: Contact | null;
}

export interface DealNoteWithUser extends DealNote {
  user?: User | null;
}

export interface ContactWithCompany extends Contact {
  company?: Company | null;
}

export interface SuccessFeeWithDeal extends SuccessFee {
  deal?: DealWithRelations | null;
}

export interface ActivityWithUser extends Activity {
  user?: User | null;
}

export interface TaskWithRelations extends Task {
  deal?: Deal | null;
  assigned_user?: User | null;
}

// ────────────────────────────────────────────────────────────
// Personal Finance Types
// ────────────────────────────────────────────────────────────

export type AccountEntity = "piva" | "spa";
export type AccountType = "checking" | "credit_card" | "investment";
export type TransactionType = "expense" | "income" | "transfer";
export type InvestmentCategory = "immobili" | "titoli" | "crypto" | "liquidita" | "altro";

export interface Account {
  id: string;
  user_id: string;
  name: string;
  bank: string;
  entity: AccountEntity;
  account_type: AccountType;
  balance: number;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  updated_at: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string | null;
  amount: number;
  type: TransactionType;
  category: string | null;
  description: string | null;
  date: string;
  created_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  category: InvestmentCategory;
  current_value: number;
  purchase_value: number;
  purchase_date: string | null;
  notes: string | null;
  updated_at: string;
  created_at: string;
}

export interface MonthlySummary {
  id: string;
  user_id: string;
  month: string;
  year: number;
  month_number: number;
  income: number;
  expenses: number;
  fee_earned: number;
  entity: string | null;
  created_at: string;
}

export interface ExpenseCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
}
