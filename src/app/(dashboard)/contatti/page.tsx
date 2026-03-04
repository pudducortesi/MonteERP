"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ContactForm } from "@/components/crm/ContactForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, UserRound, Mail, Phone } from "lucide-react";
import type { Contact, Company } from "@/types";

type ContactWithCompany = Contact & { company?: Company | null };

export default function ContattiPage() {
  const [contacts, setContacts] = useState<ContactWithCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const supabase = createClient();

  const fetchContacts = useCallback(async () => {
    const { data } = await supabase
      .from("contacts")
      .select("*, company:companies(id, name)")
      .order("full_name");
    if (data) setContacts(data as unknown as ContactWithCompany[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const filtered = contacts.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(q) ||
      c.company?.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">Contatti</h1>
          <p className="text-sm text-[#6B7280]">{contacts.length} contatti</p>
        </div>
        <Button
          size="sm"
          className="bg-[#E87A2E] hover:bg-[#D16A1E] text-white"
          onClick={() => { setEditContact(null); setFormOpen(true); }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Nuovo Contatto
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
        <Input
          placeholder="Cerca per nome, azienda o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white border-[#E5E7EB] h-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-[#E5E7EB]">
          <UserRound className="h-8 w-8 text-[#D1D5DB] mb-2" />
          <p className="text-sm text-[#9CA3AF]">Nessun contatto trovato</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-x-auto shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[#6B7280]">Nome</TableHead>
                <TableHead className="text-[#6B7280]">Azienda</TableHead>
                <TableHead className="text-[#6B7280]">Ruolo</TableHead>
                <TableHead className="text-[#6B7280]">Email</TableHead>
                <TableHead className="text-[#6B7280]">Telefono</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((contact) => (
                <TableRow
                  key={contact.id}
                  className="cursor-pointer hover:bg-[#FAFAFA] transition-colors"
                  onClick={() => { setEditContact(contact); setFormOpen(true); }}
                >
                  <TableCell className="font-medium text-[#1A1A1A]">
                    {contact.full_name}
                  </TableCell>
                  <TableCell className="text-sm text-[#6B7280]">
                    {contact.company?.name || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-[#6B7280]">
                    {contact.role_title || "—"}
                  </TableCell>
                  <TableCell>
                    {contact.email ? (
                      <span className="flex items-center gap-1 text-xs text-[#6B7280]">
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </span>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    {contact.phone ? (
                      <span className="flex items-center gap-1 text-xs text-[#6B7280]">
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </span>
                    ) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ContactForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditContact(null);
        }}
        contact={editContact}
        onSaved={fetchContacts}
      />
    </div>
  );
}
