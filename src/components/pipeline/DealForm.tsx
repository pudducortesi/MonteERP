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
import {
  DEAL_TYPE_LABELS,
  DEAL_PRIORITY_LABELS,
  DEAL_STATUS_LABELS,
  generateDealCode,
} from "@/lib/utils/deal";
import type {
  Deal,
  DealType,
  DealPriority,
  DealStatus,
  Company,
} from "@/types";

interface DealFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: Deal | null;
  onSaved: () => void;
}

export function DealForm({ open, onOpenChange, deal, onSaved }: DealFormProps) {
  const isEdit = !!deal;
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);

  const [code, setCode] = useState(deal?.code || generateDealCode());
  const [title, setTitle] = useState(deal?.title || "");
  const [companyId, setCompanyId] = useState(deal?.company_id || "none");
  const [dealType, setDealType] = useState<DealType>(
    deal?.deal_type || "advisory"
  );
  const [status, setStatus] = useState<DealStatus>(
    deal?.status || "prospect"
  );
  const [priority, setPriority] = useState<DealPriority>(
    deal?.priority || "medium"
  );
  const [dealValue, setDealValue] = useState(
    deal?.deal_value?.toString() || ""
  );
  const [successFeePct, setSuccessFeePct] = useState(
    deal?.success_fee_pct?.toString() || ""
  );
  const [successFeeMin, setSuccessFeeMin] = useState(
    deal?.success_fee_min?.toString() || ""
  );
  const [retainerMonthly, setRetainerMonthly] = useState(
    deal?.retainer_monthly?.toString() || ""
  );
  const [mandateDate, setMandateDate] = useState(deal?.mandate_date || "");
  const [expectedClose, setExpectedClose] = useState(
    deal?.expected_close || ""
  );
  const [description, setDescription] = useState(deal?.description || "");
  const [notes, setNotes] = useState(deal?.notes || "");

  useEffect(() => {
    if (open) {
      const supabase = createClient();
      supabase
        .from("companies")
        .select("id, name")
        .order("name")
        .then(({ data }) => {
          if (data) setCompanies(data as Company[]);
        });
    }
  }, [open]);

  // Reset form when deal prop changes
  useEffect(() => {
    if (deal) {
      setCode(deal.code || generateDealCode());
      setTitle(deal.title);
      setCompanyId(deal.company_id || "none");
      setDealType(deal.deal_type);
      setStatus(deal.status);
      setPriority(deal.priority);
      setDealValue(deal.deal_value?.toString() || "");
      setSuccessFeePct(deal.success_fee_pct?.toString() || "");
      setSuccessFeeMin(deal.success_fee_min?.toString() || "");
      setRetainerMonthly(deal.retainer_monthly?.toString() || "");
      setMandateDate(deal.mandate_date || "");
      setExpectedClose(deal.expected_close || "");
      setDescription(deal.description || "");
      setNotes(deal.notes || "");
    } else {
      setCode(generateDealCode());
      setTitle("");
      setCompanyId("none");
      setDealType("advisory");
      setStatus("prospect");
      setPriority("medium");
      setDealValue("");
      setSuccessFeePct("");
      setSuccessFeeMin("");
      setRetainerMonthly("");
      setMandateDate("");
      setExpectedClose("");
      setDescription("");
      setNotes("");
    }
  }, [deal]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    const payload = {
      code,
      title,
      company_id: companyId === "none" ? null : companyId,
      deal_type: dealType,
      status,
      priority,
      deal_value: dealValue ? parseFloat(dealValue) : null,
      success_fee_pct: successFeePct ? parseFloat(successFeePct) : null,
      success_fee_min: successFeeMin ? parseFloat(successFeeMin) : null,
      retainer_monthly: retainerMonthly ? parseFloat(retainerMonthly) : null,
      mandate_date: mandateDate || null,
      expected_close: expectedClose || null,
      description: description || null,
      notes: notes || null,
    };

    if (isEdit) {
      await supabase.from("deals").update(payload).eq("id", deal!.id);
    } else {
      const { data: newDeal } = await supabase
        .from("deals")
        .insert(payload)
        .select("id")
        .single();

      // Add current user as lead
      if (newDeal) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("deal_members").insert({
            deal_id: newDeal.id,
            user_id: user.id,
            role_in_deal: "lead",
          });
        }
      }
    }

    setLoading(false);
    onOpenChange(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1B2A4A]">
            {isEdit ? "Modifica Deal" : "Nuovo Deal"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Code + Title */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="code">Codice</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="MNT-2026-001"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="title">Titolo *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Nome dell'operazione"
              />
            </div>
          </div>

          {/* Row 2: Company + Type + Priority */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Azienda</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nessuna</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo *</Label>
              <Select
                value={dealType}
                onValueChange={(v) => setDealType(v as DealType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(DEAL_TYPE_LABELS) as [DealType, string][]
                  ).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priorità</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as DealPriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(DEAL_PRIORITY_LABELS) as [
                      DealPriority,
                      string,
                    ][]
                  ).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Status (only in edit mode) */}
          {isEdit && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as DealStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.entries(DEAL_STATUS_LABELS) as [
                        DealStatus,
                        string,
                      ][]
                    ).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Row 4: Values */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <Label htmlFor="dealValue">Valore Deal (€)</Label>
              <Input
                id="dealValue"
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="successFeePct">Fee %</Label>
              <Input
                id="successFeePct"
                type="number"
                step="0.001"
                value={successFeePct}
                onChange={(e) => setSuccessFeePct(e.target.value)}
                placeholder="0.000"
              />
            </div>
            <div>
              <Label htmlFor="successFeeMin">Fee Min (€)</Label>
              <Input
                id="successFeeMin"
                type="number"
                value={successFeeMin}
                onChange={(e) => setSuccessFeeMin(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="retainerMonthly">Retainer (€/mese)</Label>
              <Input
                id="retainerMonthly"
                type="number"
                value={retainerMonthly}
                onChange={(e) => setRetainerMonthly(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Row 5: Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="mandateDate">Data Mandato</Label>
              <Input
                id="mandateDate"
                type="date"
                value={mandateDate}
                onChange={(e) => setMandateDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="expectedClose">Chiusura Prevista</Label>
              <Input
                id="expectedClose"
                type="date"
                value={expectedClose}
                onChange={(e) => setExpectedClose(e.target.value)}
              />
            </div>
          </div>

          {/* Row 6: Description + Notes */}
          <div>
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Descrizione dell'operazione..."
            />
          </div>
          <div>
            <Label htmlFor="notes">Note</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Note interne..."
            />
          </div>

          {/* Actions */}
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
              disabled={loading || !title}
              className="bg-[#1B2A4A] hover:bg-[#253A5E]"
            >
              {loading
                ? "Salvataggio..."
                : isEdit
                  ? "Salva Modifiche"
                  : "Crea Deal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
