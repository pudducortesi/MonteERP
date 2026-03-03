"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { UserPlus, Trash2, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { DealMember, DealMemberRole, User } from "@/types";

const MEMBER_ROLE_LABELS: Record<DealMemberRole, string> = {
  lead: "Lead",
  member: "Membro",
  viewer: "Viewer",
  client: "Cliente",
};

interface DealTeamProps {
  dealId: string;
  members: (DealMember & { user?: User })[];
  onMemberChanged: () => void;
}

export function DealTeam({ dealId, members, onMemberChanged }: DealTeamProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<DealMemberRole>("member");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (addOpen) {
      supabase
        .from("users")
        .select("*")
        .in("role", ["admin", "advisor", "viewer"])
        .eq("is_active", true)
        .order("full_name")
        .then(({ data }) => {
          if (data) {
            const memberIds = new Set(members.map((m) => m.user_id));
            setAvailableUsers(
              (data as User[]).filter((u) => !memberIds.has(u.id))
            );
          }
        });
    }
  }, [addOpen, members, supabase]);

  async function handleAdd() {
    if (!selectedUserId) return;
    setSaving(true);

    const { error } = await supabase.from("deal_members").insert({
      deal_id: dealId,
      user_id: selectedUserId,
      role_in_deal: selectedRole,
    });

    if (error) {
      toast.error("Errore nell'aggiunta del membro");
    } else {
      toast.success("Membro aggiunto al team");
      setAddOpen(false);
      setSelectedUserId("");
      onMemberChanged();
    }
    setSaving(false);
  }

  async function handleRemove(userId: string) {
    const { error } = await supabase
      .from("deal_members")
      .delete()
      .eq("deal_id", dealId)
      .eq("user_id", userId);

    if (error) {
      toast.error("Errore nella rimozione del membro");
    } else {
      toast.success("Membro rimosso dal team");
      onMemberChanged();
    }
  }

  return (
    <>
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base text-[#1B2A4A]">
            Team del Deal
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
            <UserPlus className="h-4 w-4 mr-1" />
            Aggiungi
          </Button>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Nessun membro nel team
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => {
                const u = member.user;
                const initials = u?.full_name
                  ? u.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "?";

                return (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-[#1B2A4A] text-white text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {u?.full_name || "Utente sconosciuto"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {u?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white border font-medium">
                        {MEMBER_ROLE_LABELS[member.role_in_deal]}
                      </span>
                      {member.role_in_deal !== "lead" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-red-600"
                          onClick={() => handleRemove(member.user_id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add member dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1B2A4A]">
              Aggiungi Membro al Team
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Utente</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona utente..." />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.full_name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Ruolo nel Deal
              </label>
              <Select
                value={selectedRole}
                onValueChange={(v) => setSelectedRole(v as DealMemberRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(MEMBER_ROLE_LABELS) as [
                      DealMemberRole,
                      string,
                    ][]
                  ).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddOpen(false)}>
                Annulla
              </Button>
              <Button
                onClick={handleAdd}
                disabled={!selectedUserId || saving}
                className="bg-[#1B2A4A] hover:bg-[#253A5E]"
              >
                {saving ? "Aggiunta..." : "Aggiungi"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
