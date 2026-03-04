"use client";

import { FolderOpen, Briefcase } from "lucide-react";
import { getGreeting } from "@/lib/utils/deal";
import type { User } from "@/types";

interface ClientDashboardProps {
  user: User;
}

export function ClientDashboard({ user }: ClientDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">
          {getGreeting()}, {user.full_name.split(" ")[0]}
        </h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          I tuoi documenti e lo stato dei deal
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">I Tuoi Documenti</h3>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FolderOpen className="h-8 w-8 text-[#D1D5DB] mb-2" />
            <p className="text-sm text-[#9CA3AF]">Nessun documento condiviso</p>
            <p className="text-xs text-[#9CA3AF] mt-1">I documenti condivisi con te appariranno qui</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Stato Deal</h3>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Briefcase className="h-8 w-8 text-[#D1D5DB] mb-2" />
            <p className="text-sm text-[#9CA3AF]">Nessun deal associato</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Lo stato dei deal dove sei coinvolto apparirà qui</p>
          </div>
        </div>
      </div>
    </div>
  );
}
