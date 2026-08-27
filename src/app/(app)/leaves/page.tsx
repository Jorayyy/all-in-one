import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { Plus, Filter, Check, X } from "lucide-react";

export default async function LeavesPage() {
  await requireAuth();

  const leaves = await db.leave.findMany({
    include: {
      employee: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    pending: leaves.filter((l) => l.status === "PENDING").length,
    approved: leaves.filter((l) => l.status === "APPROVED").length,
    rejected: leaves.filter((l) => l.status === "REJECTED").length,
  };

  const statusColors: Record<string, string> = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "destructive",
    CANCELLED: "secondary",
  };

  const leaveTypeLabels: Record<string, string> = {
    VL: "Vacation Leave",
    SL: "Sick Leave",
    SPL: "Special Leave",
    MATERNITY: "Maternity Leave",
    PATERNITY: "Paternity Leave",
    BEREAVEMENT: "Bereavement Leave",
    OTHER: "Other",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leave Management</h2>
          <p className="text-gray-500">Manage employee leave requests</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Badge variant="warning">{stats.pending}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <Badge variant="success">{stats.approved}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <Badge variant="destructive">{stats.rejected}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leave Requests</CardTitle>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaves.length === 0 ? (
              <p className="py-8 text-center text-gray-500">No leave requests found</p>
            ) : (
              leaves.map((leave) => (
                <div
                  key={leave.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-800">
                      {leave.employee.firstName.charAt(0)}
                      {leave.employee.lastName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {leave.employee.firstName} {leave.employee.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {leaveTypeLabels[leave.type]} • {leave.days} day(s)
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Reason</p>
                      <p className="max-w-xs text-sm">{leave.reason}</p>
                    </div>
                    <Badge variant={statusColors[leave.status] as any}>
                      {leave.status}
                    </Badge>
                    {leave.status === "PENDING" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="success">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
