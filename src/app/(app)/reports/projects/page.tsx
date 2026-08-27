import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
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
        <Link href="/reports/projects">
          <Button type="button" size="sm" variant="ghost">
            Clear
          </Button>
        </Link>
      )}
    </form>
  );
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
  PLANNING: "secondary",
  IN_PROGRESS: "default",
  ON_HOLD: "warning",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

export default async function ProjectsReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string; to?: string }>;
}) {
  await requireAuth();
  const params = searchParams ? await searchParams : {};
  const from = params.from || "";
  const to = params.to || "";

  const where: any = { deletedAt: null };
  if (from || to) {
    where.startDate = {};
    if (from) where.startDate.gte = new Date(from);
    if (to) where.startDate.lte = new Date(to);
  }

  const projects = await db.project.findMany({
    where,
    include: { customer: true, tasks: true, employees: true },
    orderBy: { createdAt: "desc" },
    take: 1000,
  });

  const byStatus: Record<string, number> = {};
  let totalBudget = 0;
  let totalActual = 0;
  for (const p of projects) {
    byStatus[p.status] = (byStatus[p.status] || 0) + 1;
    if (p.budget) totalBudget += Number(p.budget);
    if (p.actualCost) totalActual += Number(p.actualCost);
  }

  const exportData = projects.map((p) => ({
    code: p.code,
    name: p.name,
    customer: p.customer.name,
    status: p.status,
    startDate: p.startDate ? new Date(p.startDate).toISOString().slice(0, 10) : "",
    endDate: p.endDate ? new Date(p.endDate).toISOString().slice(0, 10) : "",
    budget: p.budget ? String(p.budget) : "",
    actualCost: p.actualCost ? String(p.actualCost) : "",
    variance: p.budget && p.actualCost ? String(Number(p.budget) - Number(p.actualCost)) : "",
    tasks: p.tasks.length,
    completedTasks: p.tasks.filter((t) => t.status === "DONE").length,
    teamSize: p.employees.length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Project Report</h2>
          <p className="text-sm text-muted-foreground">
            {projects.length} projects • {formatCurrency(totalBudget)} budget
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/reports">
            <Button variant="outline" size="sm">
              Back
            </Button>
          </Link>
          <ExportCsvButton data={exportData} filename="projects-report.csv" label="Export CSV" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Projects</p>
            <p className="text-2xl font-bold">{projects.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Budget</p>
            <p className="text-lg font-bold">{formatCurrency(totalBudget)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Actual</p>
            <p className="text-lg font-bold">{formatCurrency(totalActual)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Variance</p>
            <p className={`text-lg font-bold ${totalBudget - totalActual >= 0 ? "text-success" : "text-destructive"}`}>
              {formatCurrency(totalBudget - totalActual)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="mb-2 text-sm font-medium">Projects by Status</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(byStatus).map(([status, count]) => (
              <Badge key={status} variant={(statusVariant[status] as any) || "secondary"}>
                {status.replace("_", " ")}: {count}
              </Badge>
            ))}
            {Object.keys(byStatus).length === 0 && <span className="text-sm text-muted-foreground">No data</span>}
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
          <CardTitle className="text-base">Budget vs Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 font-medium text-muted-foreground">Code</th>
                  <th className="pb-3 font-medium text-muted-foreground">Project</th>
                  <th className="pb-3 font-medium text-muted-foreground">Customer</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground">Budget</th>
                  <th className="pb-3 font-medium text-muted-foreground">Actual</th>
                  <th className="pb-3 font-medium text-muted-foreground">Variance</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const variance = p.budget && p.actualCost ? Number(p.budget) - Number(p.actualCost) : null;
                  return (
                    <tr key={p.id} className="border-b border-border">
                      <td className="py-3 font-mono text-xs">{p.code}</td>
                      <td className="py-3 font-medium">{p.name}</td>
                      <td className="py-3 text-muted-foreground">{p.customer.name}</td>
                      <td className="py-3">
                        <Badge variant={(statusVariant[p.status] as any) || "secondary"}>{p.status}</Badge>
                      </td>
                      <td className="py-3">{p.budget ? formatCurrency(Number(p.budget)) : "-"}</td>
                      <td className="py-3">{p.actualCost ? formatCurrency(Number(p.actualCost)) : "-"}</td>
                      <td className={`py-3 ${variance !== null && variance < 0 ? "text-destructive" : variance !== null ? "text-success" : ""}`}>
                        {variance !== null ? formatCurrency(variance) : "-"}
                      </td>
                    </tr>
                  );
                })}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No projects
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
          <CardTitle className="text-base">All Projects Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 font-medium text-muted-foreground">Project</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground">Tasks</th>
                  <th className="pb-3 font-medium text-muted-foreground">Team</th>
                  <th className="pb-3 font-medium text-muted-foreground">Start</th>
                  <th className="pb-3 font-medium text-muted-foreground">End</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-b border-border">
                    <td className="py-3 font-medium">
                      {p.name} <span className="text-xs text-muted-foreground">({p.code})</span>
                    </td>
                    <td className="py-3">
                      <Badge variant={(statusVariant[p.status] as any) || "secondary"}>{p.status}</Badge>
                    </td>
                    <td className="py-3">
                      {p.tasks.filter((t) => t.status === "DONE").length}/{p.tasks.length}
                    </td>
                    <td className="py-3">{p.employees.length}</td>
                    <td className="py-3 text-muted-foreground">{p.startDate ? new Date(p.startDate).toLocaleDateString() : "-"}</td>
                    <td className="py-3 text-muted-foreground">{p.endDate ? new Date(p.endDate).toLocaleDateString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
