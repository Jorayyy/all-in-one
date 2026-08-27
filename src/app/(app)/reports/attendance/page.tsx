import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import Link from "next/link";
import { ExportCsvButton } from "@/components/reports/export-csv-button";

function ReportFilters({ from, to }: { from?: string; to?: string }) {
  return (
    <form method="GET" className="flex flex-wrap items-end gap-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground">From</label>
        <input
          type="date"
          name="from"
          defaultValue={from || ""}
          className="mt-1 flex h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">To</label>
        <input
          type="date"
          name="to"
          defaultValue={to || ""}
          className="mt-1 flex h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <Button type="submit" size="sm" variant="outline">
        Filter
      </Button>
      {(from || to) && (
        <Link href="/reports/attendance">
          <Button type="button" size="sm" variant="ghost">
            Clear
          </Button>
        </Link>
      )}
    </form>
  );
}

export default async function AttendanceReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string; to?: string }>;
}) {
  await requireAuth();
  const params = searchParams ? await searchParams : {};
  const from = params.from || "";
  const to = params.to || "";

  const where: any = {};
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);
  }

  const attendances = await db.attendance.findMany({
    where,
    include: { employee: { select: { employeeNumber: true, firstName: true, lastName: true } } },
    orderBy: { date: "desc" },
    take: 1000,
  });

  const grouped = attendances.reduce((acc: Record<string, number>, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  // Monthly breakdown
  const monthly: Record<string, Record<string, number>> = {};
  for (const a of attendances) {
    const key = new Date(a.date).toISOString().slice(0, 7); // YYYY-MM
    if (!monthly[key]) monthly[key] = {};
    monthly[key][a.status] = (monthly[key][a.status] || 0) + 1;
    monthly[key]["_total"] = (monthly[key]["_total"] || 0) + 1;
  }
  const sortedMonths = Object.keys(monthly).sort().reverse();

  const exportData = attendances.map((a) => ({
    date: new Date(a.date).toISOString().slice(0, 10),
    employeeNumber: a.employee.employeeNumber,
    name: `${a.employee.firstName} ${a.employee.lastName}`,
    status: a.status,
    clockIn: a.clockIn ? new Date(a.clockIn).toLocaleString() : "",
    clockOut: a.clockOut ? new Date(a.clockOut).toLocaleString() : "",
  }));

  const total = attendances.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Attendance Report</h2>
          <p className="text-sm text-muted-foreground">Monthly attendance summary • {total} records</p>
        </div>
        <div className="flex gap-2">
          <Link href="/reports">
            <Button variant="outline" size="sm">
              Back
            </Button>
          </Link>
          <ExportCsvButton data={exportData} filename="attendance-report.csv" label="Export CSV" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Records</p>
            <p className="text-2xl font-bold">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Present</p>
            <p className="text-2xl font-bold text-success">{grouped["PRESENT"] || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Absent</p>
            <p className="text-2xl font-bold text-destructive">{grouped["ABSENT"] || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Late</p>
            <p className="text-2xl font-bold text-warning">{grouped["LATE"] || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="mb-2 text-sm font-medium">Grouped by Status</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(grouped).map(([status, count]) => (
              <Badge key={status} variant="secondary">
                {status}: {count}
              </Badge>
            ))}
            {Object.keys(grouped).length === 0 && (
              <span className="text-sm text-muted-foreground">No data</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportFilters from={from} to={to} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 font-medium text-muted-foreground">Month</th>
                  <th className="pb-3 font-medium text-muted-foreground">Total</th>
                  <th className="pb-3 font-medium text-muted-foreground">Present</th>
                  <th className="pb-3 font-medium text-muted-foreground">Absent</th>
                  <th className="pb-3 font-medium text-muted-foreground">Late</th>
                  <th className="pb-3 font-medium text-muted-foreground">On Leave</th>
                  <th className="pb-3 font-medium text-muted-foreground">Other</th>
                </tr>
              </thead>
              <tbody>
                {sortedMonths.map((m) => (
                  <tr key={m} className="border-b border-border">
                    <td className="py-3 font-medium">{m}</td>
                    <td className="py-3">{monthly[m]["_total"] || 0}</td>
                    <td className="py-3">{monthly[m]["PRESENT"] || 0}</td>
                    <td className="py-3">{monthly[m]["ABSENT"] || 0}</td>
                    <td className="py-3">{monthly[m]["LATE"] || 0}</td>
                    <td className="py-3">{monthly[m]["ON_LEAVE"] || 0}</td>
                    <td className="py-3">
                      {(monthly[m]["UNDERTIME"] || 0) + (monthly[m]["HOLIDAY"] || 0) + (monthly[m]["REST_DAY"] || 0)}
                    </td>
                  </tr>
                ))}
                {sortedMonths.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No attendance records
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 font-medium text-muted-foreground">Date</th>
                  <th className="pb-3 font-medium text-muted-foreground">Employee</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground">Clock In</th>
                  <th className="pb-3 font-medium text-muted-foreground">Clock Out</th>
                </tr>
              </thead>
              <tbody>
                {attendances.slice(0, 100).map((a) => (
                  <tr key={a.id} className="border-b border-border">
                    <td className="py-3">{new Date(a.date).toLocaleDateString()}</td>
                    <td className="py-3 font-medium">
                      {a.employee.firstName} {a.employee.lastName} ({a.employee.employeeNumber})
                    </td>
                    <td className="py-3">
                      <Badge variant="outline">{a.status}</Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">{a.clockIn ? new Date(a.clockIn).toLocaleTimeString() : "-"}</td>
                    <td className="py-3 text-muted-foreground">{a.clockOut ? new Date(a.clockOut).toLocaleTimeString() : "-"}</td>
                  </tr>
                ))}
                {attendances.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No records
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
