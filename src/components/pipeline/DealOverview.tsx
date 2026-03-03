"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEAL_TYPE_LABELS,
  DEAL_STATUS_LABELS,
  DEAL_PRIORITY_LABELS,
  formatCurrency,
} from "@/lib/utils/deal";
import type { DealWithRelations } from "@/types";

interface DealOverviewProps {
  deal: DealWithRelations;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground mb-0.5">
        {label}
      </dt>
      <dd className="text-sm text-[#1B2A4A]">{value || "—"}</dd>
    </div>
  );
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function DealOverview({ deal }: DealOverviewProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Main info */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#1B2A4A]">
            Informazioni Principali
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <Field label="Codice" value={deal.code} />
            <Field label="Tipo" value={DEAL_TYPE_LABELS[deal.deal_type]} />
            <Field label="Status" value={DEAL_STATUS_LABELS[deal.status]} />
            <Field
              label="Priorità"
              value={DEAL_PRIORITY_LABELS[deal.priority]}
            />
            <Field label="Azienda" value={deal.company?.name} />
            <Field
              label="Creato il"
              value={formatDate(deal.created_at)}
            />
          </dl>
        </CardContent>
      </Card>

      {/* Financial info */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#1B2A4A]">
            Valori e Fee
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <Field
              label="Valore Deal"
              value={formatCurrency(deal.deal_value)}
            />
            <Field
              label="Success Fee %"
              value={
                deal.success_fee_pct != null
                  ? `${deal.success_fee_pct}%`
                  : "—"
              }
            />
            <Field
              label="Fee Minima"
              value={formatCurrency(deal.success_fee_min)}
            />
            <Field
              label="Retainer Mensile"
              value={formatCurrency(deal.retainer_monthly)}
            />
          </dl>
        </CardContent>
      </Card>

      {/* Dates */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#1B2A4A]">Date</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <Field
              label="Data Mandato"
              value={formatDate(deal.mandate_date)}
            />
            <Field
              label="Chiusura Prevista"
              value={formatDate(deal.expected_close)}
            />
            <Field
              label="Chiusura Effettiva"
              value={formatDate(deal.actual_close)}
            />
          </dl>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#1B2A4A]">
            Descrizione e Note
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Descrizione
            </p>
            <p className="text-sm text-[#1B2A4A] whitespace-pre-wrap">
              {deal.description || "Nessuna descrizione"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Note
            </p>
            <p className="text-sm text-[#1B2A4A] whitespace-pre-wrap">
              {deal.notes || "Nessuna nota"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
