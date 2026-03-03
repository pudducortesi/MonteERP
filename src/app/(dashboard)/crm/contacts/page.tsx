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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, UserRound } from "lucide-react";
import type { Contact, Company } from "@/types";

type ContactWithCompany = Contact & { company?: Company | null };

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactWithCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const supabase = createClient();

  const fetchContacts = useCallback(async () => {
    const { data } = await supabase
      .from("contacts")
      .select(
        `
        *,
        company:companies(id, name)
      `
      )
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

  function handleEdit(contact: Contact) {
    setEditContact(contact);
    setFormOpen(true);
  }

  function handleNew() {
    setEditContact(null);
    setFormOpen(true);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Contatti</h1>
          <p className="text-sm text-muted-foreground">
            {contacts.length} contatti nel CRM
          </p>
        </div>
        <Button
          size="sm"
          className="bg-[#1B2A4A] hover:bg-[#253A5E]"
          onClick={handleNew}
        >
          <Plus className="h-4 w-4 mr-1" />
          Nuovo Contatto
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca per nome, azienda o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border">
          <UserRound className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">
            Nessun contatto trovato
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Crea un nuovo contatto per iniziare
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Azienda</TableHead>
                <TableHead>Ruolo</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefono</TableHead>
                <TableHead className="text-center">Decisore</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((contact) => (
                <TableRow
                  key={contact.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleEdit(contact)}
                >
                  <TableCell className="font-medium text-[#1B2A4A]">
                    {contact.full_name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {contact.company?.name || "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {contact.role_title || "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {contact.email || "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {contact.phone || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    {contact.is_decision_maker && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 text-[10px]"
                      >
                        DM
                      </Badge>
                    )}
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
