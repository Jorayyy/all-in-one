"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui";
import {
  House,
  Users,
  Clock,
  CalendarBlank,
  Money,
  Package,
  ShoppingBag,
  Calculator,
  Folder,
  Headphones,
  Wrench,
  MapPin,
  GearSix,
  SignOut,
  Buildings,
  FileText,
  ChartBar,
  Bell,
  CaretLeft,
  CaretRight,
  Sun,
  Moon,
  Monitor,
} from "phosphor-react";
import { useState } from "react";
import { useTheme } from "next-themes";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <House className="h-4 w-4" /> },
    ],
  },
  {
    title: "People",
    items: [
      { label: "Employees", href: "/employees", icon: <Users className="h-4 w-4" /> },
      { label: "Attendance", href: "/attendance", icon: <Clock className="h-4 w-4" /> },
      { label: "Schedules", href: "/schedules", icon: <CalendarBlank className="h-4 w-4" /> },
      { label: "Leaves", href: "/leaves", icon: <FileText className="h-4 w-4" /> },
      { label: "Payroll", href: "/payroll", icon: <Money className="h-4 w-4" /> },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Inventory", href: "/inventory", icon: <Package className="h-4 w-4" /> },
      { label: "Assets", href: "/assets", icon: <Wrench className="h-4 w-4" /> },
      { label: "Projects", href: "/projects", icon: <Folder className="h-4 w-4" /> },
      { label: "Tickets", href: "/tickets", icon: <Headphones className="h-4 w-4" /> },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Sales", href: "/sales", icon: <ShoppingBag className="h-4 w-4" /> },
      { label: "Accounting", href: "/accounting", icon: <Calculator className="h-4 w-4" /> },
      { label: "Customers", href: "/customers", icon: <Users className="h-4 w-4" /> },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Reports", href: "/reports", icon: <ChartBar className="h-4 w-4" /> },
      { label: "Locations", href: "/locations", icon: <MapPin className="h-4 w-4" /> },
      { label: "Notifications", href: "/notifications", icon: <Bell className="h-4 w-4" /> },
      { label: "Settings", href: "/settings", icon: <GearSix className="h-4 w-4" /> },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-card transition-all duration-200",
        collapsed ? "w-14" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="flex h-12 items-center border-b border-border px-3">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground text-background text-xs font-bold">
              P
            </div>
            <span className="text-sm font-semibold">PRIME</span>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto flex h-6 w-6 items-center justify-center rounded bg-foreground text-background text-xs font-bold">
            P
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {navigation.map((group) => (
          <div key={group.title} className="mb-2">
            {!collapsed && (
              <p className="mb-1 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {group.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                        collapsed && "justify-center"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      {item.icon}
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Theme Toggle */}
      <div className="border-t border-border px-2 py-2">
        <div className={cn("flex items-center gap-1", collapsed ? "justify-center" : "px-2")}>
          <button
            onClick={() => setTheme("light")}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              theme === "light" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sun className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              theme === "dark" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Moon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setTheme("system")}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              theme === "system" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Monitor className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Collapse Toggle + Logout */}
      <div className="border-t border-border px-2 py-2 space-y-1">
        <button
          onClick={onToggle}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
            collapsed && "justify-center"
          )}
        >
          {collapsed ? <CaretRight className="h-4 w-4" /> : <CaretLeft className="h-4 w-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
              collapsed && "justify-center"
            )}
          >
            <SignOut className="h-4 w-4" />
            {!collapsed && <span>Logout</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
