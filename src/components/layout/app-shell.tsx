"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface AppShellProps {
  user: {
    name: string;
    role: string;
    employee?: { firstName: string; lastName: string } | null;
  };
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("prime-sidebar-collapsed");
    if (saved) setCollapsed(saved === "true");
  }, []);

  const handleToggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("prime-sidebar-collapsed", String(next));
      return next;
    });
  };

  if (!mounted) {
    // Avoid hydration mismatch — render expanded initially
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar collapsed={false} onToggle={handleToggle} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header user={user} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar collapsed={collapsed} onToggle={handleToggle} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
