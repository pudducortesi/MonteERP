"use client";

import { LayoutGrid, Table2, Plus, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEAL_TYPE_LABELS, DEAL_PRIORITY_LABELS } from "@/lib/utils/deal";
import type { DealType, DealPriority, User } from "@/types";

interface DealFiltersProps {
  view: "kanban" | "table";
  onViewChange: (view: "kanban" | "table") => void;
  showArchived: boolean;
  onShowArchivedChange: (show: boolean) => void;
  dealTypeFilter: DealType | "all";
  onDealTypeFilterChange: (type: DealType | "all") => void;
  priorityFilter: DealPriority | "all";
  onPriorityFilterChange: (priority: DealPriority | "all") => void;
  advisorFilter: string;
  onAdvisorFilterChange: (id: string) => void;
  advisors: User[];
  onNewDeal: () => void;
}

export function DealFilters({
  view,
  onViewChange,
  showArchived,
  onShowArchivedChange,
  dealTypeFilter,
  onDealTypeFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  advisorFilter,
  onAdvisorFilterChange,
  advisors,
  onNewDeal,
}: DealFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
      {/* View toggle */}
      <div className="flex items-center gap-1 rounded-lg bg-white border p-0.5">
        <Button
          variant={view === "kanban" ? "default" : "ghost"}
          size="sm"
          className={view === "kanban" ? "bg-[#1B2A4A] hover:bg-[#253A5E]" : ""}
          onClick={() => onViewChange("kanban")}
        >
          <LayoutGrid className="h-4 w-4 mr-1" />
          Kanban
        </Button>
        <Button
          variant={view === "table" ? "default" : "ghost"}
          size="sm"
          className={view === "table" ? "bg-[#1B2A4A] hover:bg-[#253A5E]" : ""}
          onClick={() => onViewChange("table")}
        >
          <Table2 className="h-4 w-4 mr-1" />
          Tabella
        </Button>
      </div>

      {/* Filters */}
      <Select
        value={dealTypeFilter}
        onValueChange={(v) => onDealTypeFilterChange(v as DealType | "all")}
      >
        <SelectTrigger className="w-[140px] bg-white">
          <SelectValue placeholder="Tipo deal" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tutti i tipi</SelectItem>
          {(Object.entries(DEAL_TYPE_LABELS) as [DealType, string][]).map(
            ([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>

      <Select
        value={priorityFilter}
        onValueChange={(v) =>
          onPriorityFilterChange(v as DealPriority | "all")
        }
      >
        <SelectTrigger className="w-[140px] bg-white">
          <SelectValue placeholder="Priorità" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tutte</SelectItem>
          {(
            Object.entries(DEAL_PRIORITY_LABELS) as [DealPriority, string][]
          ).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {advisors.length > 0 && (
        <Select
          value={advisorFilter}
          onValueChange={onAdvisorFilterChange}
        >
          <SelectTrigger className="w-[160px] bg-white">
            <SelectValue placeholder="Advisor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            {advisors.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Show archived toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onShowArchivedChange(!showArchived)}
        className="text-muted-foreground"
      >
        {showArchived ? (
          <EyeOff className="h-4 w-4 mr-1" />
        ) : (
          <Eye className="h-4 w-4 mr-1" />
        )}
        {showArchived ? "Nascondi archivio" : "Mostra archivio"}
      </Button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* New deal button */}
      <Button
        size="sm"
        className="bg-[#1B2A4A] hover:bg-[#253A5E]"
        onClick={onNewDeal}
      >
        <Plus className="h-4 w-4 mr-1" />
        Nuovo Deal
      </Button>
    </div>
  );
}
