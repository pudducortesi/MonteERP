"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Settings,
  Building2,
  Palette,
  User,
  Download,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { Entity, AssetClass, EntityType, User as UserType } from "@/types";
import { ENTITY_TYPE_LABELS } from "@/types";

const DEFAULT_ENTITY_FORM = {
  name: "",
  type: "persona_fisica" as EntityType,
  jurisdiction: "",
  tax_id: "",
  color: "#E87A2E",
  notes: "",
};

const DEFAULT_CLASS_FORM = {
  name: "",
  icon: "",
  color: "#E87A2E",
};

export default function ImpostazioniPage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [assetClasses, setAssetClasses] = useState<AssetClass[]>([]);
  const [profile, setProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  // Entity dialog
  const [entityDialogOpen, setEntityDialogOpen] = useState(false);
  const [editEntity, setEditEntity] = useState<Entity | null>(null);
  const [entityForm, setEntityForm] = useState(DEFAULT_ENTITY_FORM);

  // Asset class dialog
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [editClass, setEditClass] = useState<AssetClass | null>(null);
  const [classForm, setClassForm] = useState(DEFAULT_CLASS_FORM);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ type: "entity" | "class"; id: string; name: string } | null>(null);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [entRes, classRes, profileRes] = await Promise.all([
      supabase.from("entities").select("*").order("sort_order").order("name"),
      supabase.from("asset_classes").select("*").order("sort_order").order("name"),
      supabase.from("users").select("*").eq("id", user.id).single(),
    ]);

    if (entRes.data) setEntities(entRes.data as Entity[]);
    if (classRes.data) setAssetClasses(classRes.data as AssetClass[]);
    if (profileRes.data) setProfile(profileRes.data as UserType);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Entity CRUD ──────────────────────────────────────

  function openNewEntity() {
    setEditEntity(null);
    setEntityForm(DEFAULT_ENTITY_FORM);
    setEntityDialogOpen(true);
  }

  function openEditEntity(entity: Entity) {
    setEditEntity(entity);
    setEntityForm({
      name: entity.name,
      type: entity.type,
      jurisdiction: entity.jurisdiction || "",
      tax_id: entity.tax_id || "",
      color: entity.color || "#E87A2E",
      notes: entity.notes || "",
    });
    setEntityDialogOpen(true);
  }

  async function handleSaveEntity() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      name: entityForm.name,
      type: entityForm.type,
      jurisdiction: entityForm.jurisdiction || null,
      tax_id: entityForm.tax_id || null,
      color: entityForm.color || null,
      notes: entityForm.notes || null,
    };

    if (editEntity) {
      const { error } = await supabase
        .from("entities")
        .update(payload)
        .eq("id", editEntity.id);
      if (error) {
        toast.error("Errore nell'aggiornamento dell'entit\u00e0");
        return;
      }
      toast.success("Entit\u00e0 aggiornata");
    } else {
      const { error } = await supabase.from("entities").insert(payload);
      if (error) {
        toast.error("Errore nella creazione dell'entit\u00e0");
        return;
      }
      toast.success("Entit\u00e0 creata");
    }

    setEntityDialogOpen(false);
    setEditEntity(null);
    setEntityForm(DEFAULT_ENTITY_FORM);
    fetchData();
  }

  // ── Asset Class CRUD ─────────────────────────────────

  function openNewClass() {
    setEditClass(null);
    setClassForm(DEFAULT_CLASS_FORM);
    setClassDialogOpen(true);
  }

  function openEditClass(ac: AssetClass) {
    setEditClass(ac);
    setClassForm({
      name: ac.name,
      icon: ac.icon || "",
      color: ac.color || "#E87A2E",
    });
    setClassDialogOpen(true);
  }

  async function handleSaveClass() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      name: classForm.name,
      icon: classForm.icon || null,
      color: classForm.color || null,
    };

    if (editClass) {
      const { error } = await supabase
        .from("asset_classes")
        .update(payload)
        .eq("id", editClass.id);
      if (error) {
        toast.error("Errore nell'aggiornamento della classe");
        return;
      }
      toast.success("Classe asset aggiornata");
    } else {
      const { error } = await supabase.from("asset_classes").insert(payload);
      if (error) {
        toast.error("Errore nella creazione della classe");
        return;
      }
      toast.success("Classe asset creata");
    }

    setClassDialogOpen(false);
    setEditClass(null);
    setClassForm(DEFAULT_CLASS_FORM);
    fetchData();
  }

  // ── Delete ───────────────────────────────────────────

  async function handleConfirmDelete() {
    if (!deleteTarget) return;

    const table = deleteTarget.type === "entity" ? "entities" : "asset_classes";
    const { error } = await supabase.from(table).delete().eq("id", deleteTarget.id);

    if (error) {
      toast.error(`Errore nell'eliminazione di "${deleteTarget.name}"`);
    } else {
      toast.success(`"${deleteTarget.name}" eliminato`);
      fetchData();
    }
    setDeleteTarget(null);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#1A1A1A] flex items-center gap-2">
          <Settings className="h-6 w-6 text-[#E87A2E]" />
          Impostazioni
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Gestisci entit&agrave;, classi asset e profilo
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="entities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entities" className="gap-1.5">
            <Building2 className="h-4 w-4" />
            Entit&agrave;
          </TabsTrigger>
          <TabsTrigger value="classes" className="gap-1.5">
            <Palette className="h-4 w-4" />
            Classi Asset
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-1.5">
            <User className="h-4 w-4" />
            Profilo
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-1.5">
            <Download className="h-4 w-4" />
            Dati
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: Entit&agrave; ───────────────────────────────── */}
        <TabsContent value="entities">
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">Entit&agrave;</h2>
              <Button
                size="sm"
                className="bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
                onClick={openNewEntity}
              >
                <Plus className="h-4 w-4 mr-1" />
                Nuova Entit&agrave;
              </Button>
            </div>
            {entities.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[#6B7280]">Nome</TableHead>
                    <TableHead className="text-[#6B7280]">Tipo</TableHead>
                    <TableHead className="text-[#6B7280]">Giurisdizione</TableHead>
                    <TableHead className="text-[#6B7280]">Codice Fiscale</TableHead>
                    <TableHead className="text-[#6B7280]">Colore</TableHead>
                    <TableHead className="text-[#6B7280]">Stato</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entities.map((entity) => (
                    <TableRow key={entity.id} className="hover:bg-[#FAFAFA]">
                      <TableCell className="font-medium text-[#1A1A1A]">
                        {entity.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {ENTITY_TYPE_LABELS[entity.type] || entity.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-[#6B7280]">
                        {entity.jurisdiction || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-[#6B7280]">
                        {entity.tax_id || "—"}
                      </TableCell>
                      <TableCell>
                        {entity.color ? (
                          <span
                            className="inline-block h-4 w-4 rounded-full border border-[#E5E7EB]"
                            style={{ backgroundColor: entity.color }}
                          />
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={entity.is_active ? "default" : "outline"}
                          className={
                            entity.is_active
                              ? "bg-[#16A34A] text-white text-xs"
                              : "text-[#9CA3AF] text-xs"
                          }
                        >
                          {entity.is_active ? "Attiva" : "Inattiva"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditEntity(entity)}
                          >
                            <Pencil className="h-3.5 w-3.5 text-[#6B7280]" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              setDeleteTarget({
                                type: "entity",
                                id: entity.id,
                                name: entity.name,
                              })
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5 text-[#DC2626]" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Building2 className="h-8 w-8 text-[#D1D5DB] mb-2" />
                <p className="text-sm text-[#9CA3AF]">Nessuna entit&agrave; configurata</p>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Aggiungi la tua prima entit&agrave;
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Tab: Classi Asset ────────────────────────────── */}
        <TabsContent value="classes">
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">Classi Asset</h2>
              <Button
                size="sm"
                className="bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
                onClick={openNewClass}
              >
                <Plus className="h-4 w-4 mr-1" />
                Nuova Classe
              </Button>
            </div>
            {assetClasses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[#6B7280]">Icona</TableHead>
                    <TableHead className="text-[#6B7280]">Nome</TableHead>
                    <TableHead className="text-[#6B7280]">Colore</TableHead>
                    <TableHead className="text-[#6B7280]">Ordine</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetClasses.map((ac) => (
                    <TableRow key={ac.id} className="hover:bg-[#FAFAFA]">
                      <TableCell className="text-xl">
                        {ac.icon || "—"}
                      </TableCell>
                      <TableCell className="font-medium text-[#1A1A1A]">
                        {ac.name}
                      </TableCell>
                      <TableCell>
                        {ac.color ? (
                          <span
                            className="inline-block h-4 w-4 rounded-full border border-[#E5E7EB]"
                            style={{ backgroundColor: ac.color }}
                          />
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-[#6B7280]">
                        {ac.sort_order}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditClass(ac)}
                          >
                            <Pencil className="h-3.5 w-3.5 text-[#6B7280]" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              setDeleteTarget({
                                type: "class",
                                id: ac.id,
                                name: ac.name,
                              })
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5 text-[#DC2626]" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Palette className="h-8 w-8 text-[#D1D5DB] mb-2" />
                <p className="text-sm text-[#9CA3AF]">Nessuna classe asset configurata</p>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Aggiungi la tua prima classe asset
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Tab: Profilo ─────────────────────────────────── */}
        <TabsContent value="profile">
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-6">
            <h2 className="text-lg font-semibold text-[#1A1A1A]">Profilo</h2>
            <Separator />
            <div className="grid gap-5 sm:grid-cols-2 max-w-lg">
              <div>
                <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wide">
                  Nome
                </p>
                <p className="text-sm text-[#1A1A1A] mt-1 font-medium">
                  {profile?.full_name || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wide">
                  Email
                </p>
                <p className="text-sm text-[#1A1A1A] mt-1 font-medium">
                  {profile?.email || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wide">
                  Ruolo
                </p>
                <p className="text-sm text-[#1A1A1A] mt-1 font-medium capitalize">
                  {profile?.role || "—"}
                </p>
              </div>
            </div>
            <Separator />
            <p className="text-xs text-[#9CA3AF]">
              Per modificare il profilo, contatta l&apos;amministratore
            </p>
          </div>
        </TabsContent>

        {/* ── Tab: Dati ────────────────────────────────────── */}
        <TabsContent value="data">
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-6">
            <h2 className="text-lg font-semibold text-[#1A1A1A]">Esporta Dati</h2>
            <Separator />
            <p className="text-sm text-[#6B7280]">
              Esporta i tuoi dati in formato CSV o PDF per archivio o analisi esterne.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Button variant="outline" disabled className="gap-2">
                  <Download className="h-4 w-4" />
                  Esporta CSV
                </Button>
                <span className="absolute -top-2 -right-2 bg-[#E87A2E] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                  Prossimamente
                </span>
              </div>
              <div className="relative">
                <Button variant="outline" disabled className="gap-2">
                  <Download className="h-4 w-4" />
                  Esporta PDF
                </Button>
                <span className="absolute -top-2 -right-2 bg-[#E87A2E] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                  Prossimamente
                </span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Entity Dialog ──────────────────────────────────── */}
      <Dialog open={entityDialogOpen} onOpenChange={setEntityDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editEntity ? "Modifica Entit\u00e0" : "Nuova Entit\u00e0"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nome</Label>
              <Input
                value={entityForm.name}
                onChange={(e) =>
                  setEntityForm({ ...entityForm, name: e.target.value })
                }
                placeholder="es. Mario Rossi"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select
                value={entityForm.type}
                onValueChange={(v) =>
                  setEntityForm({ ...entityForm, type: v as EntityType })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(ENTITY_TYPE_LABELS) as [EntityType, string][]
                  ).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Giurisdizione</Label>
              <Input
                value={entityForm.jurisdiction}
                onChange={(e) =>
                  setEntityForm({ ...entityForm, jurisdiction: e.target.value })
                }
                placeholder="es. Italia"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Codice Fiscale / P.IVA</Label>
              <Input
                value={entityForm.tax_id}
                onChange={(e) =>
                  setEntityForm({ ...entityForm, tax_id: e.target.value })
                }
                placeholder="Opzionale"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Colore</Label>
              <Input
                value={entityForm.color}
                onChange={(e) =>
                  setEntityForm({ ...entityForm, color: e.target.value })
                }
                placeholder="#E87A2E"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Note</Label>
              <Input
                value={entityForm.notes}
                onChange={(e) =>
                  setEntityForm({ ...entityForm, notes: e.target.value })
                }
                placeholder="Opzionale"
                className="mt-1"
              />
            </div>
            <Button
              className="w-full bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
              onClick={handleSaveEntity}
              disabled={!entityForm.name}
            >
              {editEntity ? "Aggiorna" : "Crea"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Asset Class Dialog ─────────────────────────────── */}
      <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editClass ? "Modifica Classe Asset" : "Nuova Classe Asset"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nome</Label>
              <Input
                value={classForm.name}
                onChange={(e) =>
                  setClassForm({ ...classForm, name: e.target.value })
                }
                placeholder="es. Immobili"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Icona (emoji)</Label>
              <Input
                value={classForm.icon}
                onChange={(e) =>
                  setClassForm({ ...classForm, icon: e.target.value })
                }
                placeholder="es. \uD83C\uDFE0"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Colore</Label>
              <Input
                value={classForm.color}
                onChange={(e) =>
                  setClassForm({ ...classForm, color: e.target.value })
                }
                placeholder="#E87A2E"
                className="mt-1"
              />
            </div>
            <Button
              className="w-full bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
              onClick={handleSaveClass}
              disabled={!classForm.name}
            >
              {editClass ? "Aggiorna" : "Crea"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ─────────────────────── */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Conferma eliminazione</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#6B7280] py-2">
            Sei sicuro di voler eliminare{" "}
            <span className="font-semibold text-[#1A1A1A]">
              &ldquo;{deleteTarget?.name}&rdquo;
            </span>
            ? Questa azione non pu&ograve; essere annullata.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
            >
              Annulla
            </Button>
            <Button
              size="sm"
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white"
              onClick={handleConfirmDelete}
            >
              Elimina
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
