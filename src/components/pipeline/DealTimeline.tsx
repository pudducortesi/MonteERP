"use client";

import { useState } from "react";
import {
  Phone,
  Users,
  Mail,
  StickyNote,
  ArrowRightLeft,
  Upload,
  Clock,
  Send,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils/deal";
import type { Activity, ActivityType, User } from "@/types";

const activityIcons: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  meeting: Users,
  email: Mail,
  note: StickyNote,
  status_change: ArrowRightLeft,
  document_upload: Upload,
};

const activityLabels: Record<ActivityType, string> = {
  call: "Chiamata",
  meeting: "Riunione",
  email: "Email",
  note: "Nota",
  status_change: "Cambio Status",
  document_upload: "Upload Documento",
};

interface DealTimelineProps {
  activities: (Activity & { user?: User })[];
  dealId?: string;
  onActivityAdded?: () => void;
}

export function DealTimeline({ activities, dealId, onActivityAdded }: DealTimelineProps) {
  const [noteContent, setNoteContent] = useState("");
  const [adding, setAdding] = useState(false);
  const supabase = createClient();

  async function addNote() {
    if (!noteContent.trim() || !dealId) return;
    setAdding(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from("activities").insert({
        deal_id: dealId,
        user_id: user.id,
        activity_type: "note",
        title: noteContent.trim(),
      });
      if (error) {
        toast.error("Errore nel salvataggio della nota");
      } else {
        toast.success("Nota aggiunta");
        setNoteContent("");
        onActivityAdded?.();
      }
    }
    setAdding(false);
  }

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {/* Quick add note */}
      {dealId && (
        <div className="mb-5 pb-5 border-b border-[#F3F4F6]">
          <Textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Aggiungi una nota..."
            rows={2}
            className="border-[#E5E7EB] mb-2 text-sm"
          />
          <div className="flex justify-end">
            <Button
              onClick={addNote}
              disabled={adding || !noteContent.trim()}
              size="sm"
              className="bg-[#E87A2E] hover:bg-[#D16A1E] text-white h-8"
            >
              <Send className="h-3.5 w-3.5 mr-1" />
              Aggiungi Nota
            </Button>
          </div>
        </div>
      )}

      {activities.length === 0 ? (
        <div className="py-8 text-center">
          <Clock className="h-8 w-8 text-[#D1D5DB] mx-auto mb-2" />
          <p className="text-sm text-[#9CA3AF]">Nessuna attività registrata</p>
        </div>
      ) : (
        <div className="space-y-0">
          {activities.map((activity, i) => {
            const Icon = activityIcons[activity.activity_type] || StickyNote;
            const isLast = i === activities.length - 1;
            const initials = activity.user?.full_name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) || "?";

            return (
              <div key={activity.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-[#F3F4F6] text-[#6B7280] text-[10px]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {!isLast && <div className="w-px flex-1 bg-[#E5E7EB] my-1" />}
                </div>

                <div className="pb-4 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-[#9CA3AF]" />
                    <span className="text-xs font-medium text-[#6B7280]">
                      {activityLabels[activity.activity_type]}
                    </span>
                    <span className="text-[10px] text-[#9CA3AF]">
                      {formatRelativeTime(activity.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-[#1A1A1A] mt-0.5">{activity.title}</p>
                  {activity.description && (
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{activity.description}</p>
                  )}
                  {activity.user && (
                    <p className="text-[10px] text-[#9CA3AF] mt-1">
                      di {activity.user.full_name}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
