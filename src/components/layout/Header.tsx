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
    <header className="sticky top-0 z-30 flex items-center h-16 gap-4 border-b bg-white px-4 lg:px-6">
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
        className="flex-1 max-w-md flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F3EF] text-sm text-muted-foreground hover:bg-[#ebe8e1] transition-colors cursor-pointer"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">Cerca deal, aziende, contatti...</span>
        <span className="sm:hidden">Cerca...</span>
        <kbd className="hidden md:inline-flex ml-auto items-center gap-0.5 rounded border bg-white px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="sr-only">Notifiche</span>
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#1B2A4A] text-white text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex md:flex-col md:items-start">
                <span className="text-sm font-medium">{user.full_name}</span>
                <span className="text-xs text-muted-foreground">
                  {roleLabels[user.role] || user.role}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user.full_name}</span>
                <span className="text-xs font-normal text-muted-foreground">
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
