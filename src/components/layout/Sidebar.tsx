"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  Users,
  FolderOpen,
  DollarSign,
  Calendar,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { UserRole, User } from "@/types";

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
    icon: GitBranch,
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
    icon: Shield,
    roles: ["admin"],
  },
];

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  advisor: "Advisor",
  client: "Cliente",
  viewer: "Viewer",
};

const roleBadgeColors: Record<UserRole, string> = {
  admin: "bg-[#E87A2E]/10 text-[#E87A2E] border-[#E87A2E]/20",
  advisor: "bg-blue-50 text-blue-600 border-blue-200",
  client: "bg-green-50 text-green-600 border-green-200",
  viewer: "bg-gray-50 text-gray-600 border-gray-200",
};

interface SidebarProps {
  userRole: UserRole;
  user?: User;
}

export function Sidebar({ userRole, user }: SidebarProps) {
  const pathname = usePathname();

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const initials = user?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-[#FAFAFA] border-r border-[#E5E7EB] min-h-screen">
      {/* Logo */}
      <div className="flex flex-col h-16 px-6 justify-center border-b border-[#E5E7EB]">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-[0.15em] text-[#E87A2E]">
            MONTESINO
          </span>
        </Link>
        <span className="text-[10px] text-[#6B7280] tracking-wider uppercase -mt-0.5">
          Gestionale
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
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
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[#E87A2E] text-white text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1A1A1A] truncate">
                {user.full_name}
              </p>
              <Badge
                variant="outline"
                className={cn("text-[10px] px-1.5 py-0 h-4 font-normal", roleBadgeColors[userRole])}
              >
                {roleLabels[userRole]}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export { navItems };
