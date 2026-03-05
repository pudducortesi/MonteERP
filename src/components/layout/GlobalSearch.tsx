"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Landmark, Wallet, Home, TrendingUp, CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils/format";

interface SearchResult {
  id: string;
  name: string;
  type: "asset" | "entity" | "liability";
  subtitle?: string;
  value?: number;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const search = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setResults([]);
        return;
      }
      const pattern = `%${q}%`;

      const [assetsRes, entitiesRes, liabilitiesRes] = await Promise.all([
        supabase.from("assets").select("id, name, current_value, description").ilike("name", pattern).limit(5),
        supabase.from("entities").select("id, name, type").ilike("name", pattern).limit(5),
        supabase.from("liabilities").select("id, name, current_balance, lender").ilike("name", pattern).limit(5),
      ]);

      const items: SearchResult[] = [];
      if (assetsRes.data) {
        for (const a of assetsRes.data) {
          items.push({ id: a.id, name: a.name, type: "asset", subtitle: a.description || undefined, value: a.current_value });
        }
      }
      if (entitiesRes.data) {
        for (const e of entitiesRes.data) {
          items.push({ id: e.id, name: e.name, type: "entity", subtitle: e.type });
        }
      }
      if (liabilitiesRes.data) {
        for (const l of liabilitiesRes.data) {
          items.push({ id: l.id, name: l.name, type: "liability", subtitle: l.lender || undefined, value: l.current_balance });
        }
      }
      setResults(items);
    },
    [supabase]
  );

  useEffect(() => {
    const timer = setTimeout(() => search(query), 200);
    return () => clearTimeout(timer);
  }, [query, search]);

  function handleSelect(item: SearchResult) {
    onOpenChange(false);
    setQuery("");
    if (item.type === "asset") router.push("/patrimonio");
    else if (item.type === "entity") router.push("/patrimonio");
    else if (item.type === "liability") router.push("/debiti");
  }

  const iconMap = {
    asset: TrendingUp,
    entity: Landmark,
    liability: CreditCard,
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Cerca asset, entità, debiti..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>Nessun risultato trovato.</CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading="Risultati">
            {results.map((item) => {
              const Icon = iconMap[item.type];
              return (
                <CommandItem
                  key={`${item.type}-${item.id}`}
                  value={`${item.name} ${item.subtitle || ""}`}
                  onSelect={() => handleSelect(item)}
                  className="flex items-center gap-3 py-2"
                >
                  <Icon className="h-4 w-4 text-[#6B7280] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">{item.name}</p>
                    {item.subtitle && (
                      <p className="text-xs text-[#9CA3AF] truncate">{item.subtitle}</p>
                    )}
                  </div>
                  {item.value != null && (
                    <span className="text-xs text-[#6B7280] whitespace-nowrap">
                      {formatCurrency(item.value)}
                    </span>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
