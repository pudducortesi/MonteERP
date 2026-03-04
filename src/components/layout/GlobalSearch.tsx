"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { BarChart3, Building2, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SearchResult {
  id: string;
  label: string;
  subtitle?: string;
  href: string;
  type: "deal" | "company" | "contact";
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState("");

  const search = useCallback(
    async (q: string) => {
      if (!q || q.length < 2) {
        setResults([]);
        return;
      }

      const supabase = createClient();
      const pattern = `%${q}%`;

      const [dealsRes, companiesRes, contactsRes] = await Promise.all([
        supabase
          .from("deals")
          .select("id, code, title")
          .or(`title.ilike.${pattern},code.ilike.${pattern}`)
          .limit(5),
        supabase
          .from("companies")
          .select("id, name, sector")
          .ilike("name", pattern)
          .limit(5),
        supabase
          .from("contacts")
          .select("id, full_name, email")
          .or(`full_name.ilike.${pattern},email.ilike.${pattern}`)
          .limit(5),
      ]);

      const items: SearchResult[] = [];

      dealsRes.data?.forEach((d) => {
        items.push({
          id: d.id,
          label: d.title,
          subtitle: d.code || undefined,
          href: `/pipeline/${d.id}`,
          type: "deal",
        });
      });

      companiesRes.data?.forEach((c) => {
        items.push({
          id: c.id,
          label: c.name,
          subtitle: c.sector || undefined,
          href: `/crm/companies/${c.id}`,
          type: "company",
        });
      });

      contactsRes.data?.forEach((c) => {
        items.push({
          id: c.id,
          label: c.full_name,
          subtitle: c.email || undefined,
          href: `/crm/contacts`,
          type: "contact",
        });
      });

      setResults(items);
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => search(query), 200);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  // Keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  function handleSelect(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  const deals = results.filter((r) => r.type === "deal");
  const companies = results.filter((r) => r.type === "company");
  const contacts = results.filter((r) => r.type === "contact");

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Cerca deal, aziende, contatti..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {query.length < 2
            ? "Digita almeno 2 caratteri per cercare..."
            : "Nessun risultato trovato."}
        </CommandEmpty>

        {deals.length > 0 && (
          <CommandGroup heading="Deal">
            {deals.map((item) => (
              <CommandItem
                key={item.id}
                value={item.label}
                onSelect={() => handleSelect(item.href)}
                className="cursor-pointer"
              >
                <BarChart3 className="mr-2 h-4 w-4 text-[#E87A2E]" />
                <div className="flex flex-col">
                  <span className="text-sm">{item.label}</span>
                  {item.subtitle && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {item.subtitle}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {companies.length > 0 && (
          <CommandGroup heading="Aziende">
            {companies.map((item) => (
              <CommandItem
                key={item.id}
                value={item.label}
                onSelect={() => handleSelect(item.href)}
                className="cursor-pointer"
              >
                <Building2 className="mr-2 h-4 w-4 text-[#1A1A1A]" />
                <div className="flex flex-col">
                  <span className="text-sm">{item.label}</span>
                  {item.subtitle && (
                    <span className="text-xs text-muted-foreground">
                      {item.subtitle}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {contacts.length > 0 && (
          <CommandGroup heading="Contatti">
            {contacts.map((item) => (
              <CommandItem
                key={item.id}
                value={item.label}
                onSelect={() => handleSelect(item.href)}
                className="cursor-pointer"
              >
                <UserRound className="mr-2 h-4 w-4 text-[#1A1A1A]" />
                <div className="flex flex-col">
                  <span className="text-sm">{item.label}</span>
                  {item.subtitle && (
                    <span className="text-xs text-muted-foreground">
                      {item.subtitle}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
