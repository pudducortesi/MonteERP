// ────────────────────────────────────────────────────────────
// Enum Types
// ────────────────────────────────────────────────────────────

export type UserRole = "admin" | "advisor" | "client" | "viewer";

export type DealType = "buy_side" | "sell_side" | "advisory" | "valuation";

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
