"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  FolderOpen,
  DollarSign,
  Calendar,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    roles: ["admin", "advisor", "client", "viewer"],
  },
  {
    label: "Pipeline",
    href: "/pipeline",
    icon: BarChart3,
    roles: ["admin", "advisor"],
  },
  {
    label: "CRM",
    href: "/crm",
    icon: Users,
    roles: ["admin", "advisor"],
  },
  {
    label: "Documenti",
    href: "/documents",
    icon: FolderOpen,
    roles: ["admin", "advisor", "client", "viewer"],
  },
  {
    label: "Success Fee",
    href: "/fees",
    icon: DollarSign,
    roles: ["admin", "advisor"],
  },
  {
    label: "Calendario",
    href: "/calendar",
    icon: Calendar,
    roles: ["admin", "advisor"],
  },
  {
    label: "Admin",
    href: "/admin/users",
    icon: Settings,
    roles: ["admin"],
  },
];

interface SidebarProps {
  userRole: UserRole;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-[#1B2A4A] text-white min-h-screen">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">Montesino</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {filteredItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-xs text-white/40">Montesino SpA</p>
      </div>
    </aside>
  );
}

export { navItems };
