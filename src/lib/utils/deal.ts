import type { DealStatus, DealType, DealPriority, PracticeArea } from "@/types";

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  prospect: "Prospect",
  pitch: "Pitch",
  mandate_signed: "Mandato",
  analysis: "Analisi",
  marketing: "Marketing",
  negotiation: "Negoziazione",
  closing: "Closing",
  completed: "Completato",
  lost: "Perso",
  on_hold: "In Pausa",
};

export const DEAL_STATUS_COLORS: Record<DealStatus, string> = {
  prospect: "bg-gray-100 text-gray-700 border-gray-200",
  pitch: "bg-blue-50 text-blue-700 border-blue-200",
  mandate_signed: "bg-indigo-50 text-indigo-700 border-indigo-200",
  analysis: "bg-purple-50 text-purple-700 border-purple-200",
  marketing: "bg-cyan-50 text-cyan-700 border-cyan-200",
  negotiation: "bg-amber-50 text-amber-700 border-amber-200",
  closing: "bg-orange-50 text-orange-700 border-orange-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  lost: "bg-red-50 text-red-700 border-red-200",
  on_hold: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

export const KANBAN_COLUMNS: DealStatus[] = [
  "prospect",
  "pitch",
  "mandate_signed",
  "analysis",
  "marketing",
  "negotiation",
  "closing",
];

export const ARCHIVED_STATUSES: DealStatus[] = [
  "completed",
  "lost",
  "on_hold",
];

export const DEAL_TYPE_LABELS: Record<DealType, string> = {
  buy_side: "Buy Side",
  sell_side: "Sell Side",
  advisory: "Advisory",
  valuation: "Valuation",
  debt_advisory: "Debt Advisory",
  grant_funding: "Grant & Funding",
  transformation: "Transformation",
  corporate_protection: "Corporate Protection",
  communication: "Communication",
  public_affairs: "Public Affairs",
  leaders_factory: "Leaders Factory",
  patrimony: "Patrimonio",
};

export const DEAL_PRIORITY_LABELS: Record<DealPriority, string> = {
  low: "Bassa",
  medium: "Media",
  high: "Alta",
  critical: "Critica",
};

export const DEAL_PRIORITY_COLORS: Record<DealPriority, string> = {
  low: "bg-gray-400",
  medium: "bg-blue-400",
  high: "bg-orange-400",
  critical: "bg-red-500",
};

export const PRACTICE_AREA_LABELS: Record<PracticeArea, string> = {
  debt_grant: "Debt & Grant",
  ma_capital_markets: "M&A & Capital Markets",
  transformation: "Transformation",
  individuals_patrimony: "Individuals & Patrimony",
  corporate_protection: "Corporate Protection",
  communication: "Communication",
  public_affairs: "Public Affairs",
  leaders_factory: "The Leaders Factory",
};

export const PRACTICE_AREA_COLORS: Record<PracticeArea, string> = {
  debt_grant: "bg-blue-50 text-blue-700 border-blue-200",
  ma_capital_markets: "bg-orange-50 text-orange-700 border-orange-200",
  transformation: "bg-purple-50 text-purple-700 border-purple-200",
  individuals_patrimony: "bg-emerald-50 text-emerald-700 border-emerald-200",
  corporate_protection: "bg-red-50 text-red-700 border-red-200",
  communication: "bg-cyan-50 text-cyan-700 border-cyan-200",
  public_affairs: "bg-indigo-50 text-indigo-700 border-indigo-200",
  leaders_factory: "bg-amber-50 text-amber-700 border-amber-200",
};

export const PRACTICE_AREA_CHART_COLORS: Record<PracticeArea, string> = {
  debt_grant: "#3B82F6",
  ma_capital_markets: "#E87A2E",
  transformation: "#8B5CF6",
  individuals_patrimony: "#10B981",
  corporate_protection: "#EF4444",
  communication: "#06B6D4",
  public_affairs: "#6366F1",
  leaders_factory: "#F59E0B",
};

export const SUB_SERVICES: Record<PracticeArea, string[]> = {
  debt_grant: ["Strategic Debt", "Mini Bond", "Working Capital Facilities", "Private Debt", "Grant & Funding"],
  ma_capital_markets: ["Valuation Desk", "Due Diligence", "Sell-Side Advisory", "Buy-Side Advisory", "Real Estate", "Capital Markets"],
  transformation: ["BoD Strategic Advisory", "Business Planning", "Market Intelligence", "Financial Modelling", "Sustainability"],
  individuals_patrimony: ["Assessment & Evaluation", "Protection & Planning", "Governance Strategy", "Coaching & Induction", "Patrimony & Investments"],
  corporate_protection: ["Corporate Security", "Corporate Footprint", "Threat Intelligence", "Risk Management", "Awareness & Human Factor", "Incident Readiness & Response"],
  communication: ["Communication Strategy", "Media Relations", "Storytelling/Copywriting", "Content Creation", "Digital Marketing", "Social Media", "Eventi & PR", "Reputation Management", "Brand Identity", "Web Design", "CRM", "Monitoring & Analysis"],
  public_affairs: ["Monitoraggio Normativo", "Stakeholder Engagement", "Public Relations", "Comunicazione Istituzionale", "Drafting Legislativo", "Advisory Strategico", "Reputation Management"],
  leaders_factory: ["Personal Brand", "Strategic Positioning", "Public Speaking", "Networking Coaching", "Brand Monitoring", "Reputation Management", "Public Relations & Media"],
};

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyCompact(value: number | null | undefined): string {
  if (value == null) return "—";
  if (value >= 1_000_000) {
    return `€ ${(value / 1_000_000).toFixed(1).replace(".", ",")}M`;
  }
  if (value >= 1_000) {
    return `€ ${Math.round(value / 1_000)}k`;
  }
  return formatCurrency(value);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Adesso";
  if (diffMins < 60) return `${diffMins} min fa`;
  if (diffHours < 24) return `${diffHours}h fa`;
  if (diffDays < 7) return `${diffDays}g fa`;
  return formatDateShort(dateStr);
}

export function daysInStage(updatedAt: string): number {
  const updated = new Date(updatedAt);
  const now = new Date();
  return Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
}

export function daysRemaining(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function generateDealCode(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `MNT-${year}-${seq}`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buongiorno";
  if (hour < 18) return "Buon pomeriggio";
  return "Buonasera";
}
