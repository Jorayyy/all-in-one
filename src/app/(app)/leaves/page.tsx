import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { Plus } from "@/components/icons";
import { LeaveActions } from "@/components/leaves/leave-actions";
import Link from "next/link";

type SearchParams = Promise<{ status?: string; type?: string; employeeId?: string; page?: string }>;

export default async function LeavesPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAuth();
  const params = await searchParams;
  const status = params.status || "";
  const type = params.type || "";
  const employeeId = params.employeeId || "";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const perPage = 10;

  const where: Record<string, unknown> = {};
  if (status) (where as Record<string, unknown>).status = status;
  if (type) (where as Record<string, unknown>).type = type;
  if (employeeId) (where as Record<string, unknown>).employeeId = employeeId;

  const [total, leaves, employees] = await Promise.all([
    db.leave.count({ where: where as never }),
    db.leave.findMany({
      where: where as never,
      include: { employee: true },
      orderBy: { createdAt: "desc" },
      take: perPage,
      skip: (page - 1) * perPage,
    }),
    db.employee.findMany({ where: { deletedAt: null }, select: { id: true, firstName: true, lastName: true }, orderBy: { firstName: "asc" } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  // stats for all filtered? Use total counts across filtered set for display, but original showed all. Keep global stats.
  const allLeaves = await db.leave.findMany({ select: { status: true } });
  const stats = {
    pending: allLeaves.filter((l) => l.status === "PENDING").length,
    approved: allLeaves.filter((l) => l.status === "APPROVED").length,
    rejected: allLeaves.filter((l) => l.status === "REJECTED").length,
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

  const buildQuery = (nextPage: number) => {
    const sp = new URLSearchParams();
    if (status) sp.set("status", status);
    if (type) sp.set("type", type);
    if (employeeId) sp.set("employeeId", employeeId);
    if (nextPage > 1) sp.set("page", String(nextPage));
    const qs = sp.toString();
    return qs ? `?${qs}` : "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Leaves</h2>
          <p className="text-sm text-muted-foreground">Manage leave requests</p>
        </div>
        <Link href="/leaves/new">
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New Request
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Pending</p><p className="text-xl font-semibold">{stats.pending}</p></div><Badge variant="warning">{stats.pending}</Badge></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Approved</p><p className="text-xl font-semibold">{stats.approved}</p></div><Badge variant="success">{stats.approved}</Badge></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Rejected</p><p className="text-xl font-semibold">{stats.rejected}</p></div><Badge variant="destructive">{stats.rejected}</Badge></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
          <form method="GET" className="flex flex-wrap items-center gap-3 pt-2">
            <select name="status" defaultValue={status} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Status</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <select name="type" defaultValue={type} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Types</option>
              <option value="VL">VL</option>
              <option value="SL">SL</option>
              <option value="SPL">SPL</option>
              <option value="MATERNITY">MATERNITY</option>
              <option value="PATERNITY">PATERNITY</option>
              <option value="BEREAVEMENT">BEREAVEMENT</option>
              <option value="OTHER">OTHER</option>
            </select>
            <select name="employeeId" defaultValue={employeeId} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Employees</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
              ))}
            </select>
            <Button type="submit" size="sm">Search</Button>
            {(status || type || employeeId) && <Link href="/leaves" className="text-sm text-muted-foreground hover:text-foreground">Clear</Link>}
          </form>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaves.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No leave requests</p>
            ) : (
              leaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between rounded-md border border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                      {leave.employee.firstName.charAt(0)}{leave.employee.lastName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{leave.employee.firstName} {leave.employee.lastName}</p>
                      <p className="text-xs text-muted-foreground">
                        {leaveTypeLabels[leave.type] || leave.type} • {leave.days} day(s) • {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={leave.status === "PENDING" ? "warning" : leave.status === "APPROVED" ? "success" : "destructive"}>{leave.status}</Badge>
                    {leave.status === "PENDING" && <LeaveActions leaveId={leave.id} status={leave.status} />}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Page {page} of {totalPages} (total {total})</span>
            <div className="flex gap-2">
              {page > 1 ? <Link href={`/leaves${buildQuery(page - 1)}`}><Button variant="outline" size="sm">Prev</Button></Link> : <Button variant="outline" size="sm" disabled>Prev</Button>}
              {page < totalPages ? <Link href={`/leaves${buildQuery(page + 1)}`}><Button variant="outline" size="sm">Next</Button></Link> : <Button variant="outline" size="sm" disabled>Next</Button>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
