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
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Company } from "@/types";

interface CompanyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company | null;
  onSaved: () => void;
}

export function CompanyForm({
  open,
  onOpenChange,
  company,
  onSaved,
}: CompanyFormProps) {
  const isEdit = !!company;
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [revenueRange, setRevenueRange] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [website, setWebsite] = useState("");
  const [via, setVia] = useState("");
  const [citta, setCitta] = useState("");
  const [cap, setCap] = useState("");
  const [provincia, setProvincia] = useState("");
  const [paese, setPaese] = useState("");
  const [notes, setNotes] = useState("");
  const [revenue, setRevenue] = useState("");
  const [ebitda, setEbitda] = useState("");
  const [netDebt, setNetDebt] = useState("");
  const [fiscalYear, setFiscalYear] = useState("");

  useEffect(() => {
    if (company) {
      setName(company.name);
      setSector(company.sector || "");
      setRevenueRange(company.revenue_range || "");
      setEmployeeCount(company.employee_count?.toString() || "");
      setWebsite(company.website || "");
      setVia(company.address?.via || "");
      setCitta(company.address?.citta || "");
      setCap(company.address?.cap || "");
      setProvincia(company.address?.provincia || "");
      setPaese(company.address?.paese || "");
      setNotes(company.notes || "");
      setRevenue(company.revenue?.toString() || "");
      setEbitda(company.ebitda?.toString() || "");
      setNetDebt(company.net_debt?.toString() || "");
      setFiscalYear(company.fiscal_year?.toString() || "");
    } else {
      setName("");
      setSector("");
      setRevenueRange("");
      setEmployeeCount("");
      setWebsite("");
      setVia("");
      setCitta("");
      setCap("");
      setProvincia("");
      setPaese("");
      setNotes("");
      setRevenue("");
      setEbitda("");
      setNetDebt("");
      setFiscalYear("");
    }
  }, [company]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    const address =
      via || citta || cap || provincia || paese
        ? { via, citta, cap, provincia, paese }
        : null;

    const payload: Record<string, unknown> = {
      name,
      sector: sector || null,
      revenue_range: revenueRange || null,
      employee_count: employeeCount ? parseInt(employeeCount) : null,
      website: website || null,
      address,
      notes: notes || null,
      revenue: revenue ? parseFloat(revenue) : null,
      ebitda: ebitda ? parseFloat(ebitda) : null,
      net_debt: netDebt ? parseFloat(netDebt) : null,
      fiscal_year: fiscalYear ? parseInt(fiscalYear) : null,
    };

    if (isEdit) {
      const { error } = await supabase
        .from("companies")
        .update(payload)
        .eq("id", company!.id);
      if (error) {
        toast.error("Errore nel salvataggio");
        setLoading(false);
        return;
      }
      toast.success("Azienda aggiornata");
    } else {
      const { error } = await supabase.from("companies").insert(payload);
      if (error) {
        toast.error("Errore nella creazione");
        setLoading(false);
        return;
      }
      toast.success("Azienda creata");
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
            {isEdit ? "Modifica Azienda" : "Nuova Azienda"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome Azienda *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nome dell'azienda"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sector">Settore</Label>
              <Input
                id="sector"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="es. Manufacturing"
              />
            </div>
            <div>
              <Label htmlFor="revenueRange">Fascia Fatturato</Label>
              <Input
                id="revenueRange"
                value={revenueRange}
                onChange={(e) => setRevenueRange(e.target.value)}
                placeholder="es. 10-50M €"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="employeeCount">Dipendenti</Label>
              <Input
                id="employeeCount"
                type="number"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="website">Sito Web</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Financial data */}
          <div>
            <Label className="text-xs text-[#6B7280] uppercase tracking-wider">
              Dati Finanziari
            </Label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <div>
                <Label htmlFor="revenue" className="text-xs">Revenue (€)</Label>
                <Input
                  id="revenue"
                  type="number"
                  step="0.01"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="ebitda" className="text-xs">EBITDA (€)</Label>
                <Input
                  id="ebitda"
                  type="number"
                  step="0.01"
                  value={ebitda}
                  onChange={(e) => setEbitda(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="netDebt" className="text-xs">Debito Netto (€)</Label>
                <Input
                  id="netDebt"
                  type="number"
                  step="0.01"
                  value={netDebt}
                  onChange={(e) => setNetDebt(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="fiscalYear" className="text-xs">Anno Fiscale</Label>
                <Input
                  id="fiscalYear"
                  type="number"
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                  placeholder="2024"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <Label className="text-xs text-[#6B7280] uppercase tracking-wider">
              Indirizzo
            </Label>
            <div className="grid grid-cols-1 gap-2 mt-1">
              <Input
                value={via}
                onChange={(e) => setVia(e.target.value)}
                placeholder="Via / Indirizzo"
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={citta}
                  onChange={(e) => setCitta(e.target.value)}
                  placeholder="Città"
                />
                <Input
                  value={cap}
                  onChange={(e) => setCap(e.target.value)}
                  placeholder="CAP"
                />
                <Input
                  value={provincia}
                  onChange={(e) => setProvincia(e.target.value)}
                  placeholder="Provincia"
                />
              </div>
              <Input
                value={paese}
                onChange={(e) => setPaese(e.target.value)}
                placeholder="Paese"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Note</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Note interne..."
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
              disabled={loading || !name}
              className="bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
            >
              {loading
                ? "Salvataggio..."
                : isEdit
                  ? "Salva Modifiche"
                  : "Crea Azienda"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
