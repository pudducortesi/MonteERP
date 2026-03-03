"use client";

import {
  Phone,
  Users,
  Mail,
  StickyNote,
  ArrowRightLeft,
  Upload,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}

function formatDateTime(d: string): string {
  return new Date(d).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DealTimeline({ activities }: DealTimelineProps) {
  if (activities.length === 0) {
    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="py-12 text-center">
          <Clock className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Nessuna attività registrata
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Le attività appariranno qui quando verranno create
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-[#1B2A4A]">
          Timeline Attività
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {activities.map((activity, i) => {
            const Icon = activityIcons[activity.activity_type] || StickyNote;
            const isLast = i === activities.length - 1;

            return (
              <div key={activity.id} className="flex gap-3">
                {/* Dot + line */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#1B2A4A]/10 shrink-0">
                    <Icon className="h-4 w-4 text-[#1B2A4A]" />
                  </div>
                  {!isLast && (
                    <div className="w-px flex-1 bg-gray-200 my-1" />
                  )}
                </div>

                {/* Content */}
                <div className={`pb-4 ${isLast ? "" : ""}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#1B2A4A]">
                      {activityLabels[activity.activity_type]}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDateTime(activity.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mt-0.5">
                    {activity.title}
                  </p>
                  {activity.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activity.description}
                    </p>
                  )}
                  {activity.user && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      di {activity.user.full_name}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
