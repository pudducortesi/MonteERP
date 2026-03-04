"use client";

import { LayoutGrid, Table2, Plus, Eye, EyeOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEAL_TYPE_LABELS,
  DEAL_PRIORITY_LABELS,
  PRACTICE_AREA_LABELS,
} from "@/lib/utils/deal";
import type { DealType, DealPriority, PracticeArea, User } from "@/types";

interface DealFiltersProps {
  view: "kanban" | "table";
  onViewChange: (view: "kanban" | "table") => void;
  showArchived: boolean;
  onShowArchivedChange: (show: boolean) => void;
  dealTypeFilter: DealType | "all";
  onDealTypeFilterChange: (type: DealType | "all") => void;
  priorityFilter: DealPriority | "all";
  onPriorityFilterChange: (priority: DealPriority | "all") => void;
  practiceAreaFilter?: PracticeArea | "all";
  onPracticeAreaFilterChange?: (area: PracticeArea | "all") => void;
  advisorFilter: string;
  onAdvisorFilterChange: (id: string) => void;
  advisors: User[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
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
  practiceAreaFilter = "all",
  onPracticeAreaFilterChange,
  advisorFilter,
  onAdvisorFilterChange,
  advisors,
  searchQuery = "",
  onSearchChange,
  onNewDeal,
}: DealFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
        {/* View toggle */}
        <div className="flex items-center gap-0.5 rounded-lg bg-white border border-[#E5E7EB] p-0.5">
          <Button
            variant={view === "kanban" ? "default" : "ghost"}
            size="sm"
            className={view === "kanban" ? "bg-[#E87A2E] hover:bg-[#D16A1E] text-white" : "text-[#6B7280]"}
            onClick={() => onViewChange("kanban")}
          >
            <LayoutGrid className="h-4 w-4 mr-1" />
            Kanban
          </Button>
          <Button
            variant={view === "table" ? "default" : "ghost"}
            size="sm"
            className={view === "table" ? "bg-[#E87A2E] hover:bg-[#D16A1E] text-white" : "text-[#6B7280]"}
            onClick={() => onViewChange("table")}
          >
            <Table2 className="h-4 w-4 mr-1" />
            Tabella
          </Button>
        </div>

        {/* Search */}
        {onSearchChange && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            <Input
              placeholder="Cerca deal..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-[200px] pl-8 h-9 bg-white border-[#E5E7EB]"
            />
          </div>
        )}

        {/* Filters */}
        {onPracticeAreaFilterChange && (
          <Select
            value={practiceAreaFilter}
            onValueChange={(v) => onPracticeAreaFilterChange(v as PracticeArea | "all")}
          >
            <SelectTrigger className="w-[180px] bg-white border-[#E5E7EB] h-9">
              <SelectValue placeholder="Practice Area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le aree</SelectItem>
              {(Object.entries(PRACTICE_AREA_LABELS) as [PracticeArea, string][]).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        )}

        <Select
          value={dealTypeFilter}
          onValueChange={(v) => onDealTypeFilterChange(v as DealType | "all")}
        >
          <SelectTrigger className="w-[140px] bg-white border-[#E5E7EB] h-9">
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
          <SelectTrigger className="w-[130px] bg-white border-[#E5E7EB] h-9">
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
            <SelectTrigger className="w-[160px] bg-white border-[#E5E7EB] h-9">
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
          className="text-[#6B7280] h-9"
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
          className="bg-[#E87A2E] hover:bg-[#D16A1E] text-white h-9"
          onClick={onNewDeal}
        >
          <Plus className="h-4 w-4 mr-1" />
          Nuovo Deal
        </Button>
      </div>
    </div>
  );
}
