"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DEAL_TYPE_LABELS,
  DEAL_STATUS_LABELS,
  DEAL_STATUS_COLORS,
  DEAL_PRIORITY_LABELS,
  PRACTICE_AREA_LABELS,
  PRACTICE_AREA_COLORS,
  formatCurrency,
  formatDate,
} from "@/lib/utils/deal";
import type { DealWithRelations } from "@/types";

interface DealOverviewProps {
  deal: DealWithRelations;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide mb-0.5">
        {label}
      </dt>
      <dd className="text-sm text-[#1A1A1A]">{value || "—"}</dd>
    </div>
  );
}

export function DealOverview({ deal }: DealOverviewProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Main info */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">
          Informazioni Principali
        </h3>
        <dl className="grid grid-cols-2 gap-4">
          <Field label="Codice" value={<span className="font-mono text-[#6B7280]">{deal.code}</span>} />
          <Field label="Tipo" value={DEAL_TYPE_LABELS[deal.deal_type]} />
          <Field
            label="Status"
            value={
              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4", DEAL_STATUS_COLORS[deal.status])}>
                {DEAL_STATUS_LABELS[deal.status]}
              </Badge>
            }
          />
          <Field label="Priorità" value={DEAL_PRIORITY_LABELS[deal.priority]} />
          <Field label="Azienda" value={deal.company?.name} />
          {deal.practice_area && (
            <Field
              label="Practice Area"
              value={
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4 font-normal", PRACTICE_AREA_COLORS[deal.practice_area])}>
                  {PRACTICE_AREA_LABELS[deal.practice_area]}
                </Badge>
              }
            />
          )}
          {deal.sub_service && <Field label="Sub-Service" value={deal.sub_service} />}
          <Field label="Creato il" value={formatDate(deal.created_at)} />
        </dl>
      </div>

      {/* Financial info */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Valori e Fee</h3>
        <dl className="grid grid-cols-2 gap-4">
          <Field label="Valore Deal" value={formatCurrency(deal.deal_value)} />
          <Field label="Success Fee %" value={deal.success_fee_pct != null ? `${deal.success_fee_pct}%` : "—"} />
          <Field label="Fee Minima" value={formatCurrency(deal.success_fee_min)} />
          <Field label="Retainer Mensile" value={formatCurrency(deal.retainer_monthly)} />
        </dl>
      </div>

      {/* Dates */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Date</h3>
        <dl className="grid grid-cols-2 gap-4">
          <Field label="Data Mandato" value={formatDate(deal.mandate_date)} />
          <Field label="Chiusura Prevista" value={formatDate(deal.expected_close)} />
          <Field label="Chiusura Effettiva" value={formatDate(deal.actual_close)} />
        </dl>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Descrizione e Note</h3>
        <div className="space-y-3">
          <div>
            <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide mb-1">Descrizione</p>
            <p className="text-sm text-[#1A1A1A] whitespace-pre-wrap">
              {deal.description || "Nessuna descrizione"}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide mb-1">Note</p>
            <p className="text-sm text-[#1A1A1A] whitespace-pre-wrap">
              {deal.notes || "Nessuna nota"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
