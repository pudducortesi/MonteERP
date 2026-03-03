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
import type { Company } from "@/types";

interface CompanyRow extends Company {
  contact_count: number;
  deal_count: number;
}

const REVENUE_RANGES = [
  "< 1M €",
  "1-5M €",
  "5-10M €",
  "10-50M €",
  "50-100M €",
  "> 100M €",
];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [revenueFilter, setRevenueFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [sectors, setSectors] = useState<string[]>([]);
  const supabase = createClient();

  const fetchCompanies = useCallback(async () => {
    // Fetch companies with counts
    const { data: companiesData } = await supabase
      .from("companies")
      .select("*")
      .order("name");

    if (!companiesData) {
      setLoading(false);
      return;
    }

    // Fetch contact counts
    const { data: contactCounts } = await supabase
      .from("contacts")
      .select("company_id");

    // Fetch deal counts
    const { data: dealCounts } = await supabase
      .from("deals")
      .select("company_id");

    const contactMap = new Map<string, number>();
    contactCounts?.forEach((c) => {
      if (c.company_id) {
        contactMap.set(c.company_id, (contactMap.get(c.company_id) || 0) + 1);
      }
    });

    const dealMap = new Map<string, number>();
    dealCounts?.forEach((d) => {
      if (d.company_id) {
        dealMap.set(d.company_id, (dealMap.get(d.company_id) || 0) + 1);
      }
    });

    const rows: CompanyRow[] = (companiesData as Company[]).map((c) => ({
      ...c,
      contact_count: contactMap.get(c.id) || 0,
      deal_count: dealMap.get(c.id) || 0,
    }));

    setCompanies(rows);

    // Collect unique sectors
    const uniqueSectors = [
      ...new Set(
        (companiesData as Company[])
          .map((c) => c.sector)
          .filter((s): s is string => !!s)
      ),
    ].sort();
    setSectors(uniqueSectors);

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const filtered = companies.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (sectorFilter !== "all" && c.sector !== sectorFilter) return false;
    if (revenueFilter !== "all" && c.revenue_range !== revenueFilter)
      return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Aziende</h1>
          <p className="text-sm text-muted-foreground">
            {companies.length} aziende nel CRM
          </p>
        </div>
        <Button
          size="sm"
          className="bg-[#1B2A4A] hover:bg-[#253A5E]"
          onClick={() => setFormOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Nuova Azienda
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        {sectors.length > 0 && (
          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="Settore" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i settori</SelectItem>
              {sectors.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={revenueFilter} onValueChange={setRevenueFilter}>
          <SelectTrigger className="w-[160px] bg-white">
            <SelectValue placeholder="Fatturato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            {REVENUE_RANGES.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border">
          <Building2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">
            Nessuna azienda trovata
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Crea una nuova azienda per iniziare
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Settore</TableHead>
                <TableHead>Fatturato</TableHead>
                <TableHead className="text-right">Dipendenti</TableHead>
                <TableHead className="text-right">Contatti</TableHead>
                <TableHead className="text-right">Deal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((company) => (
                <TableRow
                  key={company.id}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>
                    <Link
                      href={`/crm/companies/${company.id}`}
                      className="font-medium text-[#1B2A4A] hover:underline"
                    >
                      {company.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {company.sector || "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {company.revenue_range || "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {company.employee_count ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {company.contact_count}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {company.deal_count}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CompanyForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={fetchCompanies}
      />
    </div>
  );
}
