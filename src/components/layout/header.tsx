"use client";

import { usePathname } from "next/navigation";
import { Avatar, DropdownMenu } from "@/components/ui";
import { getInitials, fullName } from "@/lib/format";
import { Bell, List } from "phosphor-react";

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
    <header className="flex h-12 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
        >
          <List className="h-4 w-4" />
        </button>
        <h1 className="text-sm font-medium">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu
          trigger={
            <button className="flex items-center gap-2 rounded-md p-1.5 hover:bg-secondary">
              <Avatar
                initials={
                  user.employee
                    ? getInitials(user.employee.firstName, user.employee.lastName)
                    : user.name.slice(0, 2).toUpperCase()
                }
                size="sm"
              />
              <div className="hidden text-left md:block">
                <p className="text-xs font-medium">
                  {user.employee
                    ? fullName(user.employee.firstName, user.employee.lastName)
                    : user.name}
                </p>
                <p className="text-[10px] text-muted-foreground">{user.role}</p>
              </div>
            </button>
          }
          items={userDropdownItems}
        />
      </div>
    </header>
  );
}
