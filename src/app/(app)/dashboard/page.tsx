import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, StatCard } from "@/components/ui";
import { formatDate } from "@/lib/format";
import {
  Users,
  DollarSign,
  FolderKanban,
  HeadphonesIcon,
  Package,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await requireAuth();

  const [
    totalEmployees,
    activeProjects,
    openTickets,
    lowStockItems,
    pendingLeaves,
    recentAttendance,
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
  ]);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {session.user.employee?.firstName || "User"}!
        </h2>
        <p className="text-gray-500">
          Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={totalEmployees}
          icon={<Users className="h-5 w-5" />}
          trend="up"
          trendValue="+2 this month"
        />
        <StatCard
          title="Active Projects"
          value={activeProjects}
          icon={<FolderKanban className="h-5 w-5" />}
        />
        <StatCard
          title="Open Tickets"
          value={openTickets}
          icon={<HeadphonesIcon className="h-5 w-5" />}
          trend={openTickets > 5 ? "down" : "neutral"}
          trendValue={openTickets > 5 ? "Needs attention" : "Under control"}
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockItems}
          icon={<Package className="h-5 w-5" />}
          trend={lowStockItems > 0 ? "down" : "up"}
          trendValue={lowStockItems > 0 ? "Restock needed" : "All good"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAttendance.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No attendance records yet</p>
            ) : (
              <div className="space-y-3">
                {recentAttendance.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {record.employee.firstName} {record.employee.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(record.date)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        record.status === "PRESENT"
                          ? "bg-green-100 text-green-800"
                          : record.status === "LATE"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
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

        {/* Pending Leaves */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Pending Leave Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingLeaves === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No pending leave requests
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  You have <span className="font-semibold">{pendingLeaves}</span>{" "}
                  pending leave request(s) that need your attention.
                </p>
                <a
                  href="/leaves"
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View all requests →
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/employees/new"
                className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:bg-gray-50"
              >
                <Users className="h-6 w-6 text-blue-600" />
                <span className="text-sm font-medium">Add Employee</span>
              </a>
              <a
                href="/projects/new"
                className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:bg-gray-50"
              >
                <FolderKanban className="h-6 w-6 text-green-600" />
                <span className="text-sm font-medium">New Project</span>
              </a>
              <a
                href="/tickets/new"
                className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:bg-gray-50"
              >
                <HeadphonesIcon className="h-6 w-6 text-orange-600" />
                <span className="text-sm font-medium">Create Ticket</span>
              </a>
              <a
                href="/sales/new"
                className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:bg-gray-50"
              >
                <DollarSign className="h-6 w-6 text-purple-600" />
                <span className="text-sm font-medium">New Invoice</span>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Your Role</span>
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                  {session.user.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Login</span>
                <span className="text-sm text-gray-900">
                  {session.user.lastLoginAt
                    ? formatDate(session.user.lastLoginAt)
                    : "First login"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
