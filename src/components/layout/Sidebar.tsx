"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Briefcase,
  Receipt,
  TrendingUp,
  Target,
  Calendar,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Conti", href: "/conti", icon: Wallet },
  { label: "Mandati", href: "/mandati", icon: Briefcase },
  { label: "Spese", href: "/spese", icon: Receipt },
  { label: "Investimenti", href: "/investimenti", icon: TrendingUp },
  { label: "Forecast", href: "/forecast", icon: Target },
  { label: "Calendario", href: "/calendar", icon: Calendar },
  { label: "Contatti", href: "/contatti", icon: Users },
];

interface SidebarProps {
  userRole: string;
  user?: User;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-[#FAFAFA] border-r border-[#E5E7EB] min-h-screen">
      {/* Logo */}
      <div className="flex flex-col h-16 px-6 justify-center border-b border-[#E5E7EB]">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-[0.12em] text-[#E87A2E]">
            PUDDU CORTESI
          </span>
        </Link>
        <span className="text-[10px] text-[#6B7280] tracking-wider uppercase -mt-0.5">
          Gestionale
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative",
                isActive
                  ? "text-[#E87A2E] bg-[#E87A2E]/5 font-medium"
                  : "text-[#6B7280] hover:bg-gray-100 hover:text-[#1A1A1A] font-normal"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#E87A2E] rounded-r-full" />
              )}
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      {user && (
        <div className="px-4 py-3 border-t border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#E87A2E] text-white text-xs font-medium">
              RC
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1A1A1A] truncate">
                {user.full_name}
              </p>
              <p className="text-[10px] text-[#9CA3AF]">
                Advisor M&A
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export { navItems };
