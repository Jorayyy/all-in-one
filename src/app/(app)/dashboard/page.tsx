import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, StatCard } from "@/components/ui";
import { formatDate, formatCurrency } from "@/lib/format";
import {
  Users,
  Money,
  Folder,
  Headphones,
  Package,
  Clock,
  ArrowRight,
} from "@/components/icons";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await requireAuth();

  const [
    totalEmployees,
    activeProjects,
    openTickets,
    lowStockItems,
    pendingLeaves,
    recentAttendance,
    pendingInvoices,
  ] = await Promise.all([
    db.employee.count({ where: { status: { not: "RESIGNED" } } }),
    db.project.count({ where: { status: { notIn: ["COMPLETED", "CANCELLED"] } } }),
    db.serviceTicket.count({ where: { status: { notIn: ["RESOLVED", "CLOSED"] } } }),
    db.stock.count({ where: { quantity: { lte: 10 } } }),
    db.leave.count({ where: { status: "PENDING" } }),
    db.attendance.findMany({
      take: 5,
      orderBy: { date: "desc" },
      include: { employee: true },
    }),
    db.invoice.count({ where: { status: { in: ["PENDING", "PARTIAL"] } } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">
          Welcome back, {session.user.employee?.firstName || "User"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Employees"
          value={totalEmployees}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Active Projects"
          value={activeProjects}
          icon={<Folder className="h-4 w-4" />}
        />
        <StatCard
          title="Open Tickets"
          value={openTickets}
          icon={<Headphones className="h-4 w-4" />}
        />
        <StatCard
          title="Low Stock"
          value={lowStockItems}
          icon={<Package className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Attendance */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium">Recent Attendance</h3>
              <Link
                href="/attendance"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {recentAttendance.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No attendance records
              </p>
            ) : (
              <div className="space-y-2">
                {recentAttendance.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between rounded-md border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {record.employee.firstName} {record.employee.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(record.date)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        record.status === "PRESENT"
                          ? "bg-success/10 text-success"
                          : record.status === "LATE"
                          ? "bg-warning/10 text-warning"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 text-sm font-medium">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/employees/new"
                className="flex flex-col items-center gap-2 rounded-md border border-border p-4 transition-colors hover:bg-secondary"
              >
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs font-medium">Add Employee</span>
              </Link>
              <Link
                href="/projects"
                className="flex flex-col items-center gap-2 rounded-md border border-border p-4 transition-colors hover:bg-secondary"
              >
                <Folder className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs font-medium">Projects</span>
              </Link>
              <Link
                href="/tickets"
                className="flex flex-col items-center gap-2 rounded-md border border-border p-4 transition-colors hover:bg-secondary"
              >
                <Headphones className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs font-medium">Tickets</span>
              </Link>
              <Link
                href="/sales"
                className="flex flex-col items-center gap-2 rounded-md border border-border p-4 transition-colors hover:bg-secondary"
              >
                <Money className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs font-medium">Invoices</span>
              </Link>
            </div>

            {/* Pending Items */}
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pending leaves</span>
                <span className="font-medium">{pendingLeaves}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pending invoices</span>
                <span className="font-medium">{pendingInvoices}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
