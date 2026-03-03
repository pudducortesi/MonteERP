"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { DOC_TYPE_LABELS } from "@/lib/utils/document";
import type { DocType, Deal } from "@/types";

interface UploadZoneProps {
  deals?: Pick<Deal, "id" | "code" | "title">[];
  preselectedDealId?: string;
  onUploaded: () => void;
}

export function UploadZone({
  deals,
  preselectedDealId,
  onUploaded,
}: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dealId, setDealId] = useState(preselectedDealId || "");
  const [docType, setDocType] = useState<DocType>("other");
  const [docName, setDocName] = useState("");
  const [isClientVisible, setIsClientVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      setSelectedFile(file);
      setDocName(file.name);
      setDealId(preselectedDealId || "");
      setDocType("other");
      setIsClientVisible(false);
      setDialogOpen(true);
    },
    [preselectedDealId]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  async function handleUpload() {
    if (!selectedFile || !dealId) {
      toast.error("Seleziona un file e un deal");
      return;
    }
    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("deal_id", dealId);
    formData.append("doc_type", docType);
    formData.append("name", docName || selectedFile.name);
    formData.append("is_client_visible", String(isClientVisible));

    const res = await fetch("/api/documents", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    setUploading(false);

    if (!res.ok) {
      toast.error(result.error || "Errore nel caricamento");
      return;
    }

    toast.success("Documento caricato");
    setDialogOpen(false);
    setSelectedFile(null);
    onUploaded();
  }

  return (
    <>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            dragOver
              ? "border-[#1B2A4A] bg-[#1B2A4A]/5"
              : "border-gray-200 hover:border-gray-300 bg-gray-50"
          }
        `}
      >
        <Upload className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm font-medium text-[#1B2A4A]">
          Trascina un file qui o clicca per selezionare
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          PDF, documenti, immagini fino a 50MB
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1B2A4A]">
              Carica Documento
            </DialogTitle>
          </DialogHeader>

          {selectedFile && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <FileText className="h-5 w-5 text-[#1B2A4A] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setSelectedFile(null);
                  setDialogOpen(false);
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <Label htmlFor="docName">Nome Documento</Label>
              <Input
                id="docName"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
              />
            </div>

            {!preselectedDealId && deals && (
              <div>
                <Label>Deal</Label>
                <Select value={dealId} onValueChange={setDealId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona deal..." />
                  </SelectTrigger>
                  <SelectContent>
                    {deals.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.code} — {d.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Tipo Documento</Label>
              <Select
                value={docType}
                onValueChange={(v) => setDocType(v as DocType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOC_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="clientVisible"
                type="checkbox"
                checked={isClientVisible}
                onChange={(e) => setIsClientVisible(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="clientVisible" className="cursor-pointer">
                Visibile ai client
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Annulla
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploading || !dealId}
                className="bg-[#1B2A4A] hover:bg-[#253A5E]"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Caricamento...
                  </>
                ) : (
                  "Carica"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
