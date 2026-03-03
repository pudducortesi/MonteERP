"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye, EyeOff, FileText, Image, File } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { DOC_TYPE_LABELS, formatFileSize, isPreviewable } from "@/lib/utils/document";
import type { Document, Deal, User } from "@/types";

type DocumentWithRelations = Document & {
  deal?: Pick<Deal, "id" | "code" | "title"> | null;
  uploader?: Pick<User, "id" | "full_name"> | null;
};

interface DocumentListProps {
  documents: DocumentWithRelations[];
  showDealColumn?: boolean;
  onVisibilityToggled?: () => void;
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return File;
  if (mimeType === "application/pdf") return FileText;
  if (mimeType.startsWith("image/")) return Image;
  return File;
}

export function DocumentList({
  documents,
  showDealColumn = true,
  onVisibilityToggled,
}: DocumentListProps) {
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleDownload(doc: DocumentWithRelations) {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.storage_path, 60);

    if (error || !data?.signedUrl) {
      toast.error("Errore nel download");
      return;
    }

    window.open(data.signedUrl, "_blank");
  }

  async function handlePreview(doc: DocumentWithRelations) {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.storage_path, 300);

    if (error || !data?.signedUrl) {
      toast.error("Errore nell'anteprima");
      return;
    }

    window.open(data.signedUrl, "_blank");
  }

  async function toggleVisibility(doc: DocumentWithRelations) {
    setTogglingId(doc.id);

    const res = await fetch("/api/documents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: doc.id,
        is_client_visible: !doc.is_client_visible,
      }),
    });

    setTogglingId(null);

    if (!res.ok) {
      toast.error("Errore nell'aggiornamento");
      return;
    }

    toast.success(
      doc.is_client_visible
        ? "Documento nascosto ai client"
        : "Documento visibile ai client"
    );
    onVisibilityToggled?.();
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Nessun documento</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            {showDealColumn && <TableHead>Deal</TableHead>}
            <TableHead>Tipo</TableHead>
            <TableHead className="text-center">Ver.</TableHead>
            <TableHead>Dimensione</TableHead>
            <TableHead>Caricato da</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-center">Client</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => {
            const Icon = getFileIcon(doc.mime_type);
            return (
              <TableRow key={doc.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium text-[#1B2A4A] truncate max-w-[200px]">
                      {doc.name}
                    </span>
                  </div>
                </TableCell>
                {showDealColumn && (
                  <TableCell className="text-sm text-muted-foreground">
                    {doc.deal?.code || "—"}
                  </TableCell>
                )}
                <TableCell>
                  <Badge variant="secondary" className="text-[10px]">
                    {DOC_TYPE_LABELS[doc.doc_type]}
                  </Badge>
                </TableCell>
                <TableCell className="text-center text-sm">
                  v{doc.version}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatFileSize(doc.file_size)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {doc.uploader?.full_name || "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(doc.created_at).toLocaleDateString("it-IT", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={togglingId === doc.id}
                    onClick={() => toggleVisibility(doc)}
                  >
                    {doc.is_client_visible ? (
                      <Eye className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {isPreviewable(doc.mime_type) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handlePreview(doc)}
                        title="Anteprima"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDownload(doc)}
                      title="Scarica"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
