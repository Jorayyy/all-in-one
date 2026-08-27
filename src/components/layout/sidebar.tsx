"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui";
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  DollarSign,
  Package,
  ShoppingCart,
  Calculator,
  FolderKanban,
  HeadphonesIcon,
  Wrench,
  MapPin,
  Settings,
  LogOut,
  Building2,
  FileText,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    ],
  },
  {
    title: "People",
    items: [
      { label: "Employees", href: "/employees", icon: <Users className="h-5 w-5" /> },
      { label: "Attendance", href: "/attendance", icon: <Clock className="h-5 w-5" /> },
      { label: "Schedules", href: "/schedules", icon: <Calendar className="h-5 w-5" /> },
      { label: "Leaves", href: "/leaves", icon: <FileText className="h-5 w-5" /> },
      { label: "Payroll", href: "/payroll", icon: <DollarSign className="h-5 w-5" /> },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Inventory", href: "/inventory", icon: <Package className="h-5 w-5" /> },
      { label: "Assets", href: "/assets", icon: <Wrench className="h-5 w-5" /> },
      { label: "Projects", href: "/projects", icon: <FolderKanban className="h-5 w-5" /> },
      { label: "Tickets", href: "/tickets", icon: <HeadphonesIcon className="h-5 w-5" /> },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Sales", href: "/sales", icon: <ShoppingCart className="h-5 w-5" /> },
      { label: "Accounting", href: "/accounting", icon: <Calculator className="h-5 w-5" /> },
    ],
  },
  {
    title: "Reports",
    items: [
      { label: "Reports", href: "/reports", icon: <BarChart3 className="h-5 w-5" /> },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Locations", href: "/locations", icon: <MapPin className="h-5 w-5" /> },
      { label: "Notifications", href: "/notifications", icon: <Bell className="h-5 w-5" /> },
      { label: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" /> },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">PRIME</span>
          </Link>
        )}
        {collapsed && <Building2 className="h-8 w-8 text-blue-600" />}
        <button
          onClick={onToggle}
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navigation.map((group) => (
          <div key={group.title} className="mb-4">
            {!collapsed && (
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {group.title}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
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

      {/* Logout */}
      <div className="border-t border-gray-200 p-3">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-700",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
