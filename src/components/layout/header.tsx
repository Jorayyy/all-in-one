"use client";

import { usePathname } from "next/navigation";
import { Avatar, DropdownMenu } from "@/components/ui";
import { getInitials, fullName } from "@/lib/format";
import { Bell, Search, Menu } from "lucide-react";

interface HeaderProps {
  user: {
    name: string;
    role: string;
    employee?: {
      firstName: string;
      lastName: string;
    } | null;
  };
  onMenuClick?: () => void;
}

export function Header({ user, onMenuClick }: HeaderProps) {
  const pathname = usePathname();

  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    const page = segments[segments.length - 1] || "dashboard";
    return page.charAt(0).toUpperCase() + page.slice(1).replace(/-/g, " ");
  };

  const userDropdownItems = [
    { label: "My Profile", onClick: () => {} },
    { label: "Settings", onClick: () => {} },
    { label: "Logout", onClick: () => {}, destructive: true },
  ];

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="h-10 w-64 rounded-lg border border-gray-300 bg-gray-50 pl-10 pr-4 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User Menu */}
        <DropdownMenu
          trigger={
            <button className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50">
              <Avatar
                initials={
                  user.employee
                    ? getInitials(user.employee.firstName, user.employee.lastName)
                    : user.name.slice(0, 2).toUpperCase()
                }
                size="sm"
              />
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-gray-900">
                  {user.employee
                    ? fullName(user.employee.firstName, user.employee.lastName)
                    : user.name}
                </p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </button>
          }
          items={userDropdownItems}
        />
      </div>
    </header>
  );
}
