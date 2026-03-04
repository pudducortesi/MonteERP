"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { UploadZone } from "@/components/documents/UploadZone";
import { DocumentList } from "@/components/documents/DocumentList";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, FileText, FolderOpen, Eye } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { DOC_TYPE_LABELS } from "@/lib/utils/document";
import type { Document, Deal, User, DocType } from "@/types";

type DocumentWithRelations = Document & {
  deal?: Pick<Deal, "id" | "code" | "title"> | null;
  uploader?: Pick<User, "id" | "full_name"> | null;
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentWithRelations[]>([]);
  const [deals, setDeals] = useState<Pick<Deal, "id" | "code" | "title">[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dealFilter, setDealFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const supabase = createClient();

  const fetchDocuments = useCallback(async () => {
    const { data } = await supabase
      .from("documents")
      .select(
        "*, deal:deals(id, code, title), uploader:users!uploaded_by(id, full_name)"
      )
      .order("created_at", { ascending: false });

    if (data) setDocuments(data as unknown as DocumentWithRelations[]);
    setLoading(false);
  }, [supabase]);

  const fetchDeals = useCallback(async () => {
    const { data } = await supabase
      .from("deals")
      .select("id, code, title")
      .order("code");
    if (data) setDeals(data as Pick<Deal, "id" | "code" | "title">[]);
  }, [supabase]);

  useEffect(() => {
    fetchDocuments();
    fetchDeals();
  }, [fetchDocuments, fetchDeals]);

  const filtered = documents.filter((d) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !d.name.toLowerCase().includes(q) &&
        !d.deal?.code?.toLowerCase().includes(q) &&
        !d.deal?.title?.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (dealFilter !== "all" && d.deal_id !== dealFilter) return false;
    if (typeFilter !== "all" && d.doc_type !== typeFilter) return false;
    return true;
  });

  const totalDocs = documents.length;
  const uniqueDeals = new Set(documents.map((d) => d.deal_id).filter(Boolean)).size;
  const clientVisible = documents.filter((d) => d.is_client_visible).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Documenti</h1>
        <p className="text-sm text-[#6B7280]">
          {totalDocs} documenti nel sistema
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard label="Documenti Totali" value={totalDocs.toString()} description="Nel sistema" icon={FileText} />
        <KPICard label="Deal Collegati" value={uniqueDeals.toString()} description="Con documenti" icon={FolderOpen} />
        <KPICard label="Visibili ai Client" value={clientVisible.toString()} description="Condivisi" icon={Eye} />
      </div>

      <UploadZone deals={deals} onUploaded={fetchDocuments} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
          <Input
            placeholder="Cerca per nome o deal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-[#E5E7EB] h-9"
          />
        </div>
        <Select value={dealFilter} onValueChange={setDealFilter}>
          <SelectTrigger className="w-[200px] bg-white border-[#E5E7EB] h-9">
            <SelectValue placeholder="Deal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i deal</SelectItem>
            {deals.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.code} — {d.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px] bg-white border-[#E5E7EB] h-9">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i tipi</SelectItem>
            {Object.entries(DOC_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DocumentList
        documents={filtered}
        showDealColumn
        onVisibilityToggled={fetchDocuments}
      />
    </div>
  );
}
