import type { FeeStatus, InvoiceEntity } from "@/types";

export const FEE_STATUS_LABELS: Record<FeeStatus, string> = {
  pending: "In Attesa",
  partial: "Parziale",
  paid: "Pagata",
  overdue: "Scaduta",
};

export const FEE_STATUS_COLORS: Record<FeeStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  partial: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
};

export const INVOICE_ENTITY_LABELS: Record<InvoiceEntity, string> = {
  piva_forfettaria: "P.IVA Forfettaria",
  assets_spa: "Assets S.p.A.",
};

export function calculateFee(
  dealValueFinal: number | null,
  successFeePct: number | null,
  successFeeMin: number | null
): number | null {
  if (dealValueFinal == null || successFeePct == null) return null;
  const calculated = dealValueFinal * (successFeePct / 100);
  if (successFeeMin != null && calculated < successFeeMin) {
    return successFeeMin;
  }
  return calculated;
}
