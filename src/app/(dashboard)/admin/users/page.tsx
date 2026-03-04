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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { KPICard } from "@/components/dashboard/KPICard";
import { Search, Users, Shield, UserCheck, UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User, UserRole } from "@/types";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  advisor: "Advisor",
  client: "Client",
  viewer: "Viewer",
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-[#E87A2E]/10 text-[#E87A2E] border-[#E87A2E]/20",
  advisor: "bg-blue-50 text-blue-600 border-blue-200",
  client: "bg-green-50 text-green-600 border-green-200",
  viewer: "bg-gray-50 text-gray-600 border-gray-200",
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
  const inactiveCount = users.filter((u) => !u.is_active).length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Gestione Utenti</h1>
        <p className="text-sm text-[#6B7280]">
          {users.length} utenti nel sistema
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Utenti Totali" value={users.length.toString()} description="Nel sistema" icon={Users} />
        <KPICard label="Attivi" value={activeCount.toString()} description="Account attivi" icon={UserCheck} />
        <KPICard label="Disattivati" value={inactiveCount.toString()} description="Account sospesi" icon={UserX} />
        <KPICard label="Admin" value={adminCount.toString()} description="Ruolo amministratore" icon={Shield} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
          <Input
            placeholder="Cerca per nome o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-[#E5E7EB] h-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px] bg-white border-[#E5E7EB] h-9">
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
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-[#E5E7EB]">
          <Users className="h-8 w-8 text-[#D1D5DB] mb-2" />
          <p className="text-sm text-[#9CA3AF]">Nessun utente trovato</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-x-auto shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[#6B7280]">Utente</TableHead>
                <TableHead className="text-[#6B7280]">Email</TableHead>
                <TableHead className="text-[#6B7280]">Ruolo</TableHead>
                <TableHead className="text-[#6B7280]">Telefono</TableHead>
                <TableHead className="text-center text-[#6B7280]">Stato</TableHead>
                <TableHead className="text-[#6B7280]">Registrato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => {
                const initials = user.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "U";
                return (
                  <TableRow key={user.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-[#E87A2E] text-white text-[10px] font-medium">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-[#1A1A1A]">
                          {user.full_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-[#6B7280]">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] px-1.5 py-0 h-4", ROLE_COLORS[user.role])}
                      >
                        {ROLE_LABELS[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-[#6B7280]">
                      {user.phone || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0 h-4",
                          user.is_active
                            ? "bg-green-50 text-green-600 border-green-200"
                            : "bg-red-50 text-red-600 border-red-200"
                        )}
                      >
                        {user.is_active ? "Attivo" : "Disattivato"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-[#6B7280]">
                      {new Date(user.created_at).toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
