"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Contact, Company, User } from "@/types";

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null;
  preselectedCompanyId?: string;
  onSaved: () => void;
}

export function ContactForm({
  open,
  onOpenChange,
  contact,
  preselectedCompanyId,
  onSaved,
}: ContactFormProps) {
  const isEdit = !!contact;
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [fullName, setFullName] = useState("");
  const [companyId, setCompanyId] = useState("none");
  const [roleTitle, setRoleTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isDecisionMaker, setIsDecisionMaker] = useState(false);
  const [linkedUserId, setLinkedUserId] = useState("none");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      const supabase = createClient();
      supabase
        .from("companies")
        .select("id, name")
        .order("name")
        .then(({ data }) => {
          if (data) setCompanies(data as Company[]);
        });
      supabase
        .from("users")
        .select("id, full_name, email, role")
        .eq("is_active", true)
        .order("full_name")
        .then(({ data }) => {
          if (data) setUsers(data as User[]);
        });
    }
  }, [open]);

  useEffect(() => {
    if (contact) {
      setFullName(contact.full_name);
      setCompanyId(contact.company_id || "none");
      setRoleTitle(contact.role_title || "");
      setEmail(contact.email || "");
      setPhone(contact.phone || "");
      setIsDecisionMaker(contact.is_decision_maker);
      setLinkedUserId(contact.linked_user_id || "none");
      setNotes(contact.notes || "");
    } else {
      setFullName("");
      setCompanyId(preselectedCompanyId || "none");
      setRoleTitle("");
      setEmail("");
      setPhone("");
      setIsDecisionMaker(false);
      setLinkedUserId("none");
      setNotes("");
    }
  }, [contact, preselectedCompanyId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    const payload = {
      full_name: fullName,
      company_id: companyId === "none" ? null : companyId,
      role_title: roleTitle || null,
      email: email || null,
      phone: phone || null,
      is_decision_maker: isDecisionMaker,
      linked_user_id: linkedUserId === "none" ? null : linkedUserId,
      notes: notes || null,
    };

    if (isEdit) {
      const { error } = await supabase
        .from("contacts")
        .update(payload)
        .eq("id", contact!.id);
      if (error) {
        toast.error("Errore nel salvataggio");
        setLoading(false);
        return;
      }
      toast.success("Contatto aggiornato");
    } else {
      const { error } = await supabase.from("contacts").insert(payload);
      if (error) {
        toast.error("Errore nella creazione");
        setLoading(false);
        return;
      }
      toast.success("Contatto creato");
    }

    setLoading(false);
    onOpenChange(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1A1A1A]">
            {isEdit ? "Modifica Contatto" : "Nuovo Contatto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Nome Completo *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Nome e cognome"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Azienda</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nessuna</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="roleTitle">Ruolo / Titolo</Label>
              <Input
                id="roleTitle"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="es. CEO, CFO"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@esempio.it"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+39 ..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isDecisionMaker"
              type="checkbox"
              checked={isDecisionMaker}
              onChange={(e) => setIsDecisionMaker(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isDecisionMaker" className="cursor-pointer">
              Decision maker
            </Label>
          </div>

          <div>
            <Label>Collega a Utente (opzionale)</Label>
            <Select value={linkedUserId} onValueChange={setLinkedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Nessuno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nessuno</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.full_name} ({u.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Note</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Note interne..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={loading || !fullName}
              className="bg-[#E87A2E] hover:bg-[#D16A1E]"
            >
              {loading
                ? "Salvataggio..."
                : isEdit
                  ? "Salva Modifiche"
                  : "Crea Contatto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
