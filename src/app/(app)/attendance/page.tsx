import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { Download, CheckCircle, XCircle, Warning } from "@/components/icons";
import ClockWidget from "@/components/attendance/clock-widget";
import Link from "next/link";

type SearchParams = Promise<{ status?: string; date?: string; employeeId?: string; page?: string }>;

export default async function AttendancePage({ searchParams }: { searchParams: SearchParams }) {
  await requireAuth();
  const params = await searchParams;
  const status = params.status || "";
  const dateFilter = params.date || "";
  const employeeId = params.employeeId || "";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const perPage = 20;

  const where: Record<string, unknown> = {};
  // default month filter if no date and no other filters? Preserve original behavior but allow override.
  if (dateFilter) {
    const d = new Date(dateFilter);
    if (!isNaN(d.getTime())) {
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      (where as Record<string, unknown>).date = { gte: start, lte: end };
    }
  } else if (!status && !employeeId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    (where as Record<string, unknown>).date = {
      gte: new Date(today.getFullYear(), today.getMonth(), 1),
      lte: today,
    };
  }
  if (status) (where as Record<string, unknown>).status = status;
  if (employeeId) (where as Record<string, unknown>).employeeId = employeeId;

  const [total, attendance, employees] = await Promise.all([
    db.attendance.count({ where: where as never }),
    db.attendance.findMany({
      where: where as never,
      include: { employee: true },
      orderBy: [{ date: "desc" }, { employee: { employeeNumber: "asc" } }],
      take: perPage,
      skip: (page - 1) * perPage,
    }),
    db.employee.findMany({ where: { deletedAt: null }, select: { id: true, firstName: true, lastName: true }, orderBy: { firstName: "asc" } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  // stats for filtered set
  const allForStats = await db.attendance.findMany({ where: where as never, select: { status: true } });
  const stats = {
    present: allForStats.filter((a) => a.status === "PRESENT").length,
    late: allForStats.filter((a) => a.status === "LATE").length,
    absent: allForStats.filter((a) => a.status === "ABSENT").length,
  };

  const statusVariant: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
    PRESENT: "success",
    LATE: "warning",
    ABSENT: "destructive",
    ON_LEAVE: "default",
    REST_DAY: "secondary",
  };

  const buildQuery = (nextPage: number) => {
    const sp = new URLSearchParams();
    if (status) sp.set("status", status);
    if (dateFilter) sp.set("date", dateFilter);
    if (employeeId) sp.set("employeeId", employeeId);
    if (nextPage > 1) sp.set("page", String(nextPage));
    const qs = sp.toString();
    return qs ? `?${qs}` : "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Attendance</h2>
          <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("en-PH", { month: "long", year: "numeric" })}</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-1.5 h-4 w-4" />
          Export
        </Button>
      </div>

      <ClockWidget />

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-md bg-success/10 p-2 text-success"><CheckCircle className="h-4 w-4" /></div><div><p className="text-xs text-muted-foreground">Present</p><p className="text-xl font-semibold">{stats.present}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-md bg-warning/10 p-2 text-warning"><Warning className="h-4 w-4" /></div><div><p className="text-xs text-muted-foreground">Late</p><p className="text-xl font-semibold">{stats.late}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-md bg-destructive/10 p-2 text-destructive"><XCircle className="h-4 w-4" /></div><div><p className="text-xs text-muted-foreground">Absent</p><p className="text-xl font-semibold">{stats.absent}</p></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3">
            <CardTitle>Records</CardTitle>
            <form method="GET" className="flex flex-wrap items-center gap-3">
              <select name="status" defaultValue={status} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">All Status</option>
                <option value="PRESENT">PRESENT</option>
                <option value="LATE">LATE</option>
                <option value="ABSENT">ABSENT</option>
                <option value="ON_LEAVE">ON_LEAVE</option>
                <option value="REST_DAY">REST_DAY</option>
                <option value="UNDERTIME">UNDERTIME</option>
                <option value="HOLIDAY">HOLIDAY</option>
              </select>
              <Input name="date" type="date" defaultValue={dateFilter} className="h-9 w-auto" />
              <select name="employeeId" defaultValue={employeeId} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">All Employees</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                ))}
              </select>
              <Button type="submit" size="sm">Search</Button>
              {(status || dateFilter || employeeId) && <Link href="/attendance" className="text-sm text-muted-foreground hover:text-foreground">Clear</Link>}
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 font-medium text-muted-foreground">Employee</th>
                  <th className="pb-3 font-medium text-muted-foreground">Date</th>
                  <th className="pb-3 font-medium text-muted-foreground">Clock In</th>
                  <th className="pb-3 font-medium text-muted-foreground">Clock Out</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">No records found</td></tr>
                ) : (
                  attendance.map((record) => (
                    <tr key={record.id} className="border-b border-border">
                      <td className="py-3">
                        <p className="font-medium">{record.employee.firstName} {record.employee.lastName}</p>
                        <p className="text-xs text-muted-foreground">{record.employee.employeeNumber}</p>
                      </td>
                      <td className="py-3 text-muted-foreground">{formatDate(record.date)}</td>
                      <td className="py-3 text-muted-foreground">{record.clockIn ? new Date(record.clockIn).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                      <td className="py-3 text-muted-foreground">{record.clockOut ? new Date(record.clockOut).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                      <td className="py-3"><Badge variant={statusVariant[record.status] || "secondary"}>{record.status}</Badge></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Page {page} of {totalPages} (total {total})</span>
            <div className="flex gap-2">
              {page > 1 ? <Link href={`/attendance${buildQuery(page - 1)}`}><Button variant="outline" size="sm">Prev</Button></Link> : <Button variant="outline" size="sm" disabled>Prev</Button>}
              {page < totalPages ? <Link href={`/attendance${buildQuery(page + 1)}`}><Button variant="outline" size="sm">Next</Button></Link> : <Button variant="outline" size="sm" disabled>Next</Button>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
