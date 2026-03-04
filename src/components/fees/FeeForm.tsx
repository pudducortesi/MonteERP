"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { FEE_STATUS_LABELS } from "@/lib/utils/fee";
import { INVOICE_ENTITY_LABELS, calculateFee } from "@/lib/utils/fee";
import type { SuccessFee, FeeStatus, InvoiceEntity } from "@/types";

interface FeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fee: SuccessFee | null;
  dealId: string;
  dealValueFinal?: number | null;
  successFeePct?: number | null;
  successFeeMin?: number | null;
  onSaved: () => void;
}

export function FeeForm({
  open,
  onOpenChange,
  fee,
  dealId,
  dealValueFinal: propDealValueFinal,
  successFeePct: propSuccessFeePct,
  successFeeMin: propSuccessFeeMin,
  onSaved,
}: FeeFormProps) {
  const isEdit = !!fee;
  const [loading, setLoading] = useState(false);

  const [dealValueFinal, setDealValueFinal] = useState("");
  const [feeCalculated, setFeeCalculated] = useState("");
  const [feeAgreed, setFeeAgreed] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<FeeStatus>("pending");
  const [invoiceEntity, setInvoiceEntity] = useState("none");
  const [paidAmount, setPaidAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (fee) {
      setDealValueFinal(fee.deal_value_final?.toString() || "");
      setFeeCalculated(fee.fee_calculated?.toString() || "");
      setFeeAgreed(fee.fee_agreed?.toString() || "");
      setPaymentStatus(fee.payment_status);
      setInvoiceEntity(fee.invoice_entity || "none");
      setPaidAmount(fee.paid_amount?.toString() || "0");
      setDueDate(fee.due_date || "");
      setNotes(fee.notes || "");
    } else {
      const dvf = propDealValueFinal ?? null;
      setDealValueFinal(dvf?.toString() || "");
      const calc = calculateFee(dvf, propSuccessFeePct ?? null, propSuccessFeeMin ?? null);
      setFeeCalculated(calc?.toString() || "");
      setFeeAgreed("");
      setPaymentStatus("pending");
      setInvoiceEntity("none");
      setPaidAmount("0");
      setDueDate("");
      setNotes("");
    }
  }, [fee, propDealValueFinal, propSuccessFeePct, propSuccessFeeMin]);

  // Auto-calculate fee when deal value changes
  useEffect(() => {
    const dvf = parseFloat(dealValueFinal) || null;
    const calc = calculateFee(dvf, propSuccessFeePct ?? null, propSuccessFeeMin ?? null);
    setFeeCalculated(calc?.toString() || "");
  }, [dealValueFinal, propSuccessFeePct, propSuccessFeeMin]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    const payload = {
      deal_id: dealId,
      deal_value_final: parseFloat(dealValueFinal) || null,
      fee_calculated: parseFloat(feeCalculated) || null,
      fee_agreed: parseFloat(feeAgreed) || null,
      payment_status: paymentStatus,
      invoice_entity: invoiceEntity === "none" ? null : invoiceEntity,
      paid_amount: parseFloat(paidAmount) || 0,
      due_date: dueDate || null,
      notes: notes || null,
    };

    if (isEdit) {
      const { error } = await supabase
        .from("success_fees")
        .update(payload)
        .eq("id", fee!.id);
      if (error) {
        toast.error("Errore nel salvataggio");
        setLoading(false);
        return;
      }
      toast.success("Fee aggiornata");
    } else {
      const { error } = await supabase.from("success_fees").insert(payload);
      if (error) {
        toast.error("Errore nella creazione");
        setLoading(false);
        return;
      }
      toast.success("Fee creata");
    }

    setLoading(false);
    onOpenChange(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1A1A1A]">
            {isEdit ? "Modifica Success Fee" : "Nuova Success Fee"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="dealValueFinal">Valore Deal Finale (€)</Label>
              <Input
                id="dealValueFinal"
                type="number"
                step="0.01"
                value={dealValueFinal}
                onChange={(e) => setDealValueFinal(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="feeCalculated">Fee Calcolata (€)</Label>
              <Input
                id="feeCalculated"
                type="number"
                step="0.01"
                value={feeCalculated}
                readOnly
                className="bg-gray-50"
                placeholder="Auto-calcolata"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="feeAgreed">Fee Concordata (€)</Label>
              <Input
                id="feeAgreed"
                type="number"
                step="0.01"
                value={feeAgreed}
                onChange={(e) => setFeeAgreed(e.target.value)}
                placeholder="Opzionale"
              />
            </div>
            <div>
              <Label htmlFor="paidAmount">Importo Pagato (€)</Label>
              <Input
                id="paidAmount"
                type="number"
                step="0.01"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Status Pagamento</Label>
              <Select
                value={paymentStatus}
                onValueChange={(v) => setPaymentStatus(v as FeeStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FEE_STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Entità Fatturazione</Label>
              <Select value={invoiceEntity} onValueChange={setInvoiceEntity}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nessuna</SelectItem>
                  {Object.entries(INVOICE_ENTITY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="dueDate">Scadenza</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="feeNotes">Note</Label>
            <Textarea
              id="feeNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Note sulla fee..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
            >
              {loading
                ? "Salvataggio..."
                : isEdit
                  ? "Salva Modifiche"
                  : "Crea Fee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
