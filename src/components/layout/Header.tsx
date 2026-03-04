"use client";

import { useRouter } from "next/navigation";
import { Menu, Bell, Search, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/types";

const roleLabels: Record<string, string> = {
  admin: "Amministratore",
  advisor: "Advisor",
  client: "Cliente",
  viewer: "Viewer",
};

interface HeaderProps {
  user: User;
  onMenuClick: () => void;
  onSearchClick: () => void;
}

export function Header({ user, onMenuClick, onSearchClick }: HeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 flex items-center h-14 gap-4 border-b border-[#E5E7EB] bg-white px-4 lg:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Apri menu</span>
      </Button>

      {/* Search trigger */}
      <button
        onClick={onSearchClick}
        className="flex-1 max-w-md flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#6B7280] hover:border-[#D1D5DB] transition-colors cursor-pointer"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">Cerca deal, aziende, contatti...</span>
        <span className="sm:hidden">Cerca...</span>
        <kbd className="hidden md:inline-flex ml-auto items-center gap-0.5 rounded border border-[#E5E7EB] bg-[#F9FAFB] px-1.5 py-0.5 text-[10px] font-mono text-[#9CA3AF]">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <div className="flex items-center gap-1">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-[18px] w-[18px] text-[#6B7280]" />
          <span className="sr-only">Notifiche</span>
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 h-9">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-[#E87A2E] text-white text-[10px] font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex md:flex-col md:items-start">
                <span className="text-sm font-medium text-[#1A1A1A]">{user.full_name}</span>
                <span className="text-[11px] text-[#6B7280] leading-none">
                  {roleLabels[user.role] || user.role}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm">{user.full_name}</span>
                <span className="text-xs font-normal text-[#6B7280]">
                  {user.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              Profilo
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Esci
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
