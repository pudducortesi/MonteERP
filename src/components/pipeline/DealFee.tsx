"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, DollarSign } from "lucide-react";
import { FeeForm } from "@/components/fees/FeeForm";
import { formatCurrency } from "@/lib/utils/deal";
import {
  FEE_STATUS_LABELS,
  FEE_STATUS_COLORS,
  INVOICE_ENTITY_LABELS,
} from "@/lib/utils/fee";
import { cn } from "@/lib/utils";
import type { SuccessFee, Deal } from "@/types";

interface DealFeeProps {
  deal: Deal;
}

export function DealFee({ deal }: DealFeeProps) {
  const [fee, setFee] = useState<SuccessFee | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const supabase = createClient();

  const fetchFee = useCallback(async () => {
    const { data } = await supabase
      .from("success_fees")
      .select("*")
      .eq("deal_id", deal.id)
      .single();

    if (data) setFee(data as SuccessFee);
    else setFee(null);
    setLoading(false);
  }, [supabase, deal.id]);

  useEffect(() => {
    fetchFee();
  }, [fetchFee]);

  if (loading) {
    return <Skeleton className="h-[200px] w-full" />;
  }

  if (!fee) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border text-center">
          <DollarSign className="h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground mb-3">
            Nessuna success fee configurata per questo deal
          </p>
          <Button
            size="sm"
            className="bg-[#1B2A4A] hover:bg-[#253A5E]"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Crea Success Fee
          </Button>
        </div>

        <FeeForm
          open={formOpen}
          onOpenChange={setFormOpen}
          fee={null}
          dealId={deal.id}
          dealValueFinal={deal.deal_value}
          successFeePct={deal.success_fee_pct}
          successFeeMin={deal.success_fee_min}
          onSaved={fetchFee}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base text-[#1B2A4A]">
            Success Fee
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFormOpen(true)}
          >
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Modifica
          </Button>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <dt className="text-xs font-medium text-muted-foreground mb-0.5">
                Valore Deal Finale
              </dt>
              <dd className="text-sm font-medium text-[#1B2A4A]">
                {formatCurrency(fee.deal_value_final)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground mb-0.5">
                Fee %
              </dt>
              <dd className="text-sm">
                {deal.success_fee_pct != null
                  ? `${deal.success_fee_pct}%`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground mb-0.5">
                Fee Minima
              </dt>
              <dd className="text-sm">
                {formatCurrency(deal.success_fee_min)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground mb-0.5">
                Fee Calcolata
              </dt>
              <dd className="text-sm font-medium">
                {formatCurrency(fee.fee_calculated)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground mb-0.5">
                Fee Concordata
              </dt>
              <dd className="text-lg font-bold text-[#1B2A4A]">
                {formatCurrency(fee.fee_agreed)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground mb-0.5">
                Status
              </dt>
              <dd>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    FEE_STATUS_COLORS[fee.payment_status]
                  )}
                >
                  {FEE_STATUS_LABELS[fee.payment_status]}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground mb-0.5">
                Entità Fatturazione
              </dt>
              <dd className="text-sm">
                {fee.invoice_entity
                  ? INVOICE_ENTITY_LABELS[fee.invoice_entity]
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground mb-0.5">
                Importo Pagato
              </dt>
              <dd className="text-sm font-medium">
                {formatCurrency(fee.paid_amount)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground mb-0.5">
                Scadenza
              </dt>
              <dd className="text-sm">
                {fee.due_date
                  ? new Date(fee.due_date).toLocaleDateString("it-IT")
                  : "—"}
              </dd>
            </div>
            {fee.notes && (
              <div className="col-span-2 lg:col-span-3">
                <dt className="text-xs font-medium text-muted-foreground mb-0.5">
                  Note
                </dt>
                <dd className="text-sm whitespace-pre-wrap">{fee.notes}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <FeeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        fee={fee}
        dealId={deal.id}
        dealValueFinal={deal.deal_value}
        successFeePct={deal.success_fee_pct}
        successFeeMin={deal.success_fee_min}
        onSaved={fetchFee}
      />
    </div>
  );
}
