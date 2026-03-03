import type { DealStatus, DealType, DealPriority } from "@/types";

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
};

export const DEAL_PRIORITY_LABELS: Record<DealPriority, string> = {
  low: "Bassa",
  medium: "Media",
  high: "Alta",
  critical: "Critica",
};

export const DEAL_PRIORITY_COLORS: Record<DealPriority, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
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

export function daysInStage(updatedAt: string): number {
  const updated = new Date(updatedAt);
  const now = new Date();
  return Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
}

export function generateDealCode(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `MNT-${year}-${seq}`;
}
