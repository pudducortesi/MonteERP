"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User, UserRole } from "@/types";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  advisor: "Advisor",
  client: "Client",
  viewer: "Viewer",
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-purple-100 text-purple-700",
  advisor: "bg-blue-100 text-blue-700",
  client: "bg-green-100 text-green-700",
  viewer: "bg-gray-100 text-gray-700",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const supabase = createClient();

  const fetchUsers = useCallback(async () => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .order("full_name");

    if (data) setUsers(data as User[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter((u) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !u.full_name.toLowerCase().includes(q) &&
        !u.email.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    return true;
  });

  const activeCount = users.filter((u) => u.is_active).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Gestione Utenti</h1>
        <p className="text-sm text-muted-foreground">
          {users.length} utenti totali &middot; {activeCount} attivi
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px] bg-white">
            <SelectValue placeholder="Ruolo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i ruoli</SelectItem>
            {Object.entries(ROLE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border">
          <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">Nessun utente trovato</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ruolo</TableHead>
                <TableHead>Telefono</TableHead>
                <TableHead className="text-center">Stato</TableHead>
                <TableHead>Registrato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium text-[#1B2A4A]">
                        {user.full_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn("text-[10px]", ROLE_COLORS[user.role])}
                    >
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.phone || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px]",
                        user.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      )}
                    >
                      {user.is_active ? "Attivo" : "Disattivato"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString("it-IT", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
