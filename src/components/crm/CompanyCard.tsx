"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import type { Company } from "@/types";

interface CompanyCardProps {
  company: Company;
  onEdit: () => void;
}

export function CompanyCard({ company, onEdit }: CompanyCardProps) {
  const address = company.address;
  const addressStr = [address?.via, address?.cap, address?.citta, address?.provincia, address?.paese]
    .filter(Boolean)
    .join(", ");

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base text-[#1A1A1A]">
          Dati Azienda
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5 mr-1" />
          Modifica
        </Button>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-medium text-muted-foreground mb-0.5">
              Nome
            </dt>
            <dd className="text-sm text-[#1A1A1A] font-medium">
              {company.name}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground mb-0.5">
              Settore
            </dt>
            <dd className="text-sm">{company.sector || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground mb-0.5">
              Fatturato
            </dt>
            <dd className="text-sm">{company.revenue_range || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground mb-0.5">
              Dipendenti
            </dt>
            <dd className="text-sm">
              {company.employee_count != null ? company.employee_count : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground mb-0.5">
              Sito Web
            </dt>
            <dd className="text-sm">
              {company.website ? (
                <span className="text-[#1A1A1A] break-all">
                  {company.website}
                </span>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground mb-0.5">
              Indirizzo
            </dt>
            <dd className="text-sm">{addressStr || "—"}</dd>
          </div>
          {company.notes && (
            <div className="col-span-2">
              <dt className="text-xs font-medium text-muted-foreground mb-0.5">
                Note
              </dt>
              <dd className="text-sm whitespace-pre-wrap">{company.notes}</dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}
