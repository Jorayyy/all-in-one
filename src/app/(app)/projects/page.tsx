import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, Badge, Button, ProgressBar, Input } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/format";
import { Plus } from "@/components/icons";
import Link from "next/link";

type SearchParams = Promise<{ q?: string; status?: string; page?: string }>;

export default async function ProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAuth();
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const status = params.status || "";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const perPage = 10;

  const where: Record<string, unknown> = { deletedAt: null };
  if (q) {
    (where as Record<string, unknown>).OR = [
      { name: { contains: q, mode: "insensitive" as const } },
      { code: { contains: q, mode: "insensitive" as const } },
    ];
  }
  if (status) (where as Record<string, unknown>).status = status;

  const [total, projects] = await Promise.all([
    db.project.count({ where: where as never }),
    db.project.findMany({
      where: where as never,
      include: { customer: true, employees: { include: { employee: true } }, tasks: true },
      orderBy: { createdAt: "desc" },
      take: perPage,
      skip: (page - 1) * perPage,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const statusVariant: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
    PLANNING: "secondary",
    IN_PROGRESS: "default",
    ON_HOLD: "warning",
    COMPLETED: "success",
    CANCELLED: "destructive",
  };

  const buildQuery = (nextPage: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (status) sp.set("status", status);
    if (nextPage > 1) sp.set("page", String(nextPage));
    const qs = sp.toString();
    return qs ? `?${qs}` : "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Projects</h2>
          <p className="text-sm text-muted-foreground">{total} projects</p>
        </div>
        <Link href="/projects/new">
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <form method="GET" className="flex flex-wrap items-center gap-3">
            <Input name="q" placeholder="Search name or code..." defaultValue={q} className="h-9 w-full max-w-xs" />
            <select name="status" defaultValue={status} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Status</option>
              <option value="PLANNING">PLANNING</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="ON_HOLD">ON_HOLD</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <Button type="submit" size="sm">Search</Button>
            {(q || status) && <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">Clear</Link>}
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <p className="col-span-full py-8 text-center text-sm text-muted-foreground">No projects found</p>
        ) : (
          projects.map((project) => {
            const completedTasks = project.tasks.filter((t) => t.status === "DONE").length;
            const totalTasks = project.tasks.length;
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            return (
              <Card key={project.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground">{project.code}</p>
                      <h3 className="text-sm font-medium">{project.name}</h3>
                    </div>
                    <Badge variant={statusVariant[project.status]}>{project.status.replace("_", " ")}</Badge>
                  </div>
                  <div className="mb-3 space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span>{project.customer.name}</span></div>
                    {project.budget && <div className="flex justify-between"><span className="text-muted-foreground">Budget</span><span>{formatCurrency(Number(project.budget))}</span></div>}
                    <div className="flex justify-between"><span className="text-muted-foreground">Tasks</span><span>{completedTasks}/{totalTasks}</span></div>
                  </div>
                  <ProgressBar value={progress} className="mb-2" />
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{Math.round(progress)}% complete</span>
                    {project.endDate && <span>Due {formatDate(project.endDate)}</span>}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Page {page} of {totalPages} (total {total})</span>
        <div className="flex gap-2">
          {page > 1 ? <Link href={`/projects${buildQuery(page - 1)}`}><Button variant="outline" size="sm">Prev</Button></Link> : <Button variant="outline" size="sm" disabled>Prev</Button>}
          {page < totalPages ? <Link href={`/projects${buildQuery(page + 1)}`}><Button variant="outline" size="sm">Next</Button></Link> : <Button variant="outline" size="sm" disabled>Next</Button>}
        </div>
      </div>
    </div>
  );
}
