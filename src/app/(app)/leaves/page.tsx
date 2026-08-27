import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { Plus, Check, X, Warning } from "@/components/icons";

export default async function LeavesPage() {
  await requireAuth();

  const leaves = await db.leave.findMany({
    include: { employee: true },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    pending: leaves.filter((l) => l.status === "PENDING").length,
    approved: leaves.filter((l) => l.status === "APPROVED").length,
    rejected: leaves.filter((l) => l.status === "REJECTED").length,
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
          <h2 className="text-xl font-semibold">Leaves</h2>
          <p className="text-sm text-muted-foreground">Manage leave requests</p>
        </div>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          New Request
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-semibold">{stats.pending}</p>
              </div>
              <Badge variant="warning">{stats.pending}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Approved</p>
                <p className="text-xl font-semibold">{stats.approved}</p>
              </div>
              <Badge variant="success">{stats.approved}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Rejected</p>
                <p className="text-xl font-semibold">{stats.rejected}</p>
              </div>
              <Badge variant="destructive">{stats.rejected}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaves.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No leave requests
              </p>
            ) : (
              leaves.map((leave) => (
                <div
                  key={leave.id}
                  className="flex items-center justify-between rounded-md border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                      {leave.employee.firstName.charAt(0)}
                      {leave.employee.lastName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {leave.employee.firstName} {leave.employee.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {leaveTypeLabels[leave.type]} • {leave.days} day(s) •{" "}
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        leave.status === "PENDING"
                          ? "warning"
                          : leave.status === "APPROVED"
                          ? "success"
                          : "destructive"
                      }
                    >
                      {leave.status}
                    </Badge>
                    {leave.status === "PENDING" && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="text-success hover:bg-success/10">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10">
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
