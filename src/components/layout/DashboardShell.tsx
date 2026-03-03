"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Toaster } from "@/components/ui/sonner";
import type { User } from "@/types";

interface DashboardShellProps {
  user: User;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar userRole={user.role} />
      <MobileNav
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        userRole={user.role}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <Header user={user} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 bg-[#F5F3EF] p-4 lg:p-6">{children}</main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
