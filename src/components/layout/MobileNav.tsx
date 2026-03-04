"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { navItems } from "@/components/layout/Sidebar";
import type { UserRole } from "@/types";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: UserRole;
}

export function MobileNav({ open, onOpenChange, userRole }: MobileNavProps) {
  const pathname = usePathname();

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 bg-white p-0 border-r border-[#E5E7EB]">
        <SheetHeader className="px-6 h-16 flex justify-center border-b border-[#E5E7EB]">
          <SheetTitle className="text-lg font-semibold tracking-[0.15em] text-[#E87A2E]">
            MONTESINO
          </SheetTitle>
        </SheetHeader>

        <nav className="px-3 py-4 space-y-0.5">
          {filteredItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
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

        <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-[#E5E7EB]">
          <p className="text-xs text-[#9CA3AF]">Montesino S.p.A. Società Benefit</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
