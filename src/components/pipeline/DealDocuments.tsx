"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { UploadZone } from "@/components/documents/UploadZone";
import { DocumentList } from "@/components/documents/DocumentList";
import { Skeleton } from "@/components/ui/skeleton";
import type { Document, Deal, User } from "@/types";

type DocumentWithRelations = Document & {
  deal?: Pick<Deal, "id" | "code" | "title"> | null;
  uploader?: Pick<User, "id" | "full_name"> | null;
};

interface DealDocumentsProps {
  dealId: string;
}

export function DealDocuments({ dealId }: DealDocumentsProps) {
  const [documents, setDocuments] = useState<DocumentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchDocuments = useCallback(async () => {
    const { data } = await supabase
      .from("documents")
      .select(
        "*, deal:deals(id, code, title), uploader:users!uploaded_by(id, full_name)"
      )
      .eq("deal_id", dealId)
      .order("created_at", { ascending: false });

    if (data) setDocuments(data as unknown as DocumentWithRelations[]);
    setLoading(false);
  }, [supabase, dealId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  if (loading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  return (
    <div className="space-y-4">
      <UploadZone preselectedDealId={dealId} onUploaded={fetchDocuments} />
      <DocumentList
        documents={documents}
        showDealColumn={false}
        onVisibilityToggled={fetchDocuments}
      />
    </div>
  );
}
