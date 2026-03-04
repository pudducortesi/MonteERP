"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CompanyForm } from "@/components/crm/CompanyForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Building2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/deal";
import type { Company } from "@/types";

interface CompanyRow extends Company {
  contact_count: number;
  deal_count: number;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [sectors, setSectors] = useState<string[]>([]);
  const supabase = createClient();

  const fetchCompanies = useCallback(async () => {
    const { data: companiesData } = await supabase
      .from("companies")
      .select("*")
      .order("name");

    if (!companiesData) {
      setLoading(false);
      return;
    }

    const { data: contactCounts } = await supabase.from("contacts").select("company_id");
    const { data: dealCounts } = await supabase.from("deals").select("company_id");

    const contactMap = new Map<string, number>();
    contactCounts?.forEach((c) => {
      if (c.company_id) contactMap.set(c.company_id, (contactMap.get(c.company_id) || 0) + 1);
    });

    const dealMap = new Map<string, number>();
    dealCounts?.forEach((d) => {
      if (d.company_id) dealMap.set(d.company_id, (dealMap.get(d.company_id) || 0) + 1);
    });

    const rows: CompanyRow[] = (companiesData as Company[]).map((c) => ({
      ...c,
      contact_count: contactMap.get(c.id) || 0,
      deal_count: dealMap.get(c.id) || 0,
    }));

    setCompanies(rows);
    const uniqueSectors = [...new Set((companiesData as Company[]).map((c) => c.sector).filter((s): s is string => !!s))].sort();
    setSectors(uniqueSectors);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const filtered = companies.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (sectorFilter !== "all" && c.sector !== sectorFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">Aziende</h1>
          <p className="text-sm text-[#6B7280]">{companies.length} aziende nel CRM</p>
        </div>
        <Button size="sm" className="bg-[#E87A2E] hover:bg-[#D16A1E] text-white h-9" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Nuova Azienda
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
          <Input placeholder="Cerca per nome..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-white border-[#E5E7EB] h-9" />
        </div>
        {sectors.length > 0 && (
          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-[160px] bg-white border-[#E5E7EB] h-9">
              <SelectValue placeholder="Settore" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i settori</SelectItem>
              {sectors.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-[#E5E7EB]">
          <Building2 className="h-8 w-8 text-[#D1D5DB] mb-2" />
          <p className="text-sm text-[#9CA3AF]">Nessuna azienda trovata</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-x-auto shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[#6B7280]">Nome</TableHead>
                <TableHead className="text-[#6B7280]">Settore</TableHead>
                <TableHead className="text-right text-[#6B7280]">Revenue</TableHead>
                <TableHead className="text-right text-[#6B7280]">EBITDA</TableHead>
                <TableHead className="text-right text-[#6B7280]">Dipendenti</TableHead>
                <TableHead className="text-right text-[#6B7280]">Contatti</TableHead>
                <TableHead className="text-right text-[#6B7280]">Deal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((company) => (
                <TableRow key={company.id} className="cursor-pointer hover:bg-[#FAFAFA] transition-colors">
                  <TableCell>
                    <Link href={`/crm/companies/${company.id}`} className="font-medium text-[#1A1A1A] hover:text-[#E87A2E] transition-colors">
                      {company.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-[#6B7280]">{company.sector || "—"}</TableCell>
                  <TableCell className="text-right text-sm text-[#1A1A1A]">{formatCurrency(company.revenue)}</TableCell>
                  <TableCell className="text-right text-sm text-[#1A1A1A]">{formatCurrency(company.ebitda)}</TableCell>
                  <TableCell className="text-right text-sm text-[#6B7280]">{company.employee_count ?? "—"}</TableCell>
                  <TableCell className="text-right text-sm text-[#6B7280]">{company.contact_count}</TableCell>
                  <TableCell className="text-right text-sm text-[#6B7280]">{company.deal_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CompanyForm open={formOpen} onOpenChange={setFormOpen} onSaved={fetchCompanies} />
    </div>
  );
}
