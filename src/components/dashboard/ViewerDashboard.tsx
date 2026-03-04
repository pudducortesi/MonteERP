"use client";

import { Briefcase, Clock } from "lucide-react";
import { getGreeting } from "@/lib/utils/deal";
import type { User } from "@/types";

interface ViewerDashboardProps {
  user: User;
}

export function ViewerDashboard({ user }: ViewerDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">
          {getGreeting()}, {user.full_name.split(" ")[0]}
        </h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          I deal assegnati in sola lettura
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">I Tuoi Deal</h3>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Briefcase className="h-8 w-8 text-[#D1D5DB] mb-2" />
            <p className="text-sm text-[#9CA3AF]">Nessun deal assegnato</p>
            <p className="text-xs text-[#9CA3AF] mt-1">I deal dove sei viewer appariranno qui</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Timeline Attività</h3>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-8 w-8 text-[#D1D5DB] mb-2" />
            <p className="text-sm text-[#9CA3AF]">Nessuna attività recente</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Le attività dei deal assegnati appariranno qui</p>
          </div>
        </div>
      </div>
    </div>
  );
}
