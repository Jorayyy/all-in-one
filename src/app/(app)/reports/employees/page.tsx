import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Input, Button, Badge } from "@/components/ui";
import { Users } from "@/components/icons";
import Link from "next/link";
import { ExportCsvButton } from "@/components/reports/export-csv-button";

function ReportFilters({ q, from, to }: { q?: string; from?: string; to?: string }) {
  return (
    <form method="GET" className="flex flex-wrap items-end gap-3">
      <div className="min-w-[200px] flex-1">
        <label className="text-xs font-medium text-muted-foreground">Search</label>
        <input
          type="text"
          name="q"
          defaultValue={q || ""}
          placeholder="Name or employee #"
          className="mt-1 flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
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
      {(q || from || to) && (
        <Link href="/reports/employees">
          <Button type="button" size="sm" variant="ghost">
            Clear
          </Button>
        </Link>
      )}
    </form>
  );
}

export default async function EmployeesReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; from?: string; to?: string }>;
}) {
  await requireAuth();
  const params = searchParams ? await searchParams : {};
  const q = params.q?.trim() || "";
  const from = params.from || "";
  const to = params.to || "";

  const where: any = { deletedAt: null };
  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { employeeNumber: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }
  if (from || to) {
    where.hireDate = {};
    if (from) where.hireDate.gte = new Date(from);
    if (to) where.hireDate.lte = new Date(to);
  }

  const employees = await db.employee.findMany({
    where,
    include: { department: true, location: true },
    orderBy: { employeeNumber: "asc" },
    take: 1000,
  });

  const statusBreakdown = employees.reduce((acc: Record<string, number>, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {});

  const exportData = employees.map((e) => ({
    employeeNumber: e.employeeNumber,
    firstName: e.firstName,
    lastName: e.lastName,
    email: e.email || "",
    phone: e.phone || "",
    department: e.department?.name || "",
    position: e.position || "",
    status: e.status,
    hireDate: e.hireDate ? new Date(e.hireDate).toISOString().slice(0, 10) : "",
    salary: e.salary ? String(e.salary) : "",
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Employee Report</h2>
          <p className="text-sm text-muted-foreground">
            {employees.length} employees • {Object.keys(statusBreakdown).length} statuses
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/reports">
            <Button variant="outline" size="sm">
              Back
            </Button>
          </Link>
          <ExportCsvButton data={exportData} filename="employees-report.csv" label="Export CSV" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Employees</p>
            <p className="text-2xl font-bold">{employees.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Regular</p>
            <p className="text-2xl font-bold">{statusBreakdown["REGULAR"] || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Probationary</p>
            <p className="text-2xl font-bold">{statusBreakdown["PROBATIONARY"] || 0}</p>
          </CardContent>
        </Card>
      </div>

      {Object.keys(statusBreakdown).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="mb-2 text-sm font-medium">Status Breakdown</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusBreakdown).map(([status, count]) => (
                <Badge key={status} variant="secondary">
                  {status}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportFilters q={q} from={from} to={to} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 font-medium text-muted-foreground">Employee #</th>
                  <th className="pb-3 font-medium text-muted-foreground">Name</th>
                  <th className="pb-3 font-medium text-muted-foreground">Department</th>
                  <th className="pb-3 font-medium text-muted-foreground">Position</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground">Hire Date</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.id} className="border-b border-border">
                    <td className="py-3 font-mono text-xs">{e.employeeNumber}</td>
                    <td className="py-3 font-medium">
                      {e.firstName} {e.lastName}
                    </td>
                    <td className="py-3 text-muted-foreground">{e.department?.name || "-"}</td>
                    <td className="py-3 text-muted-foreground">{e.position || "-"}</td>
                    <td className="py-3">
                      <Badge variant="outline">{e.status}</Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {e.hireDate ? new Date(e.hireDate).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No employees found
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
