import { requireAuth } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <AppShell
      user={{
        name: session.user.email,
        role: session.user.role,
        employee: session.user.employee,
      }}
    >
      {children}
    </AppShell>
  );
}
