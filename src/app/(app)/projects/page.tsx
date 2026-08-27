import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, Badge, Button, ProgressBar } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/format";
import { Plus, Folder } from "@/components/icons";
import Link from "next/link";

export default async function ProjectsPage() {
  await requireAuth();

  const projects = await db.project.findMany({
    where: { deletedAt: null },
    include: {
      customer: true,
      employees: { include: { employee: true } },
      tasks: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const statusVariant: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
    PLANNING: "secondary",
    IN_PROGRESS: "default",
    ON_HOLD: "warning",
    COMPLETED: "success",
    CANCELLED: "destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Projects</h2>
          <p className="text-sm text-muted-foreground">{projects.length} projects</p>
        </div>
        <Link href="/projects/new">
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
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
                  <Badge variant={statusVariant[project.status]}>
                    {project.status.replace("_", " ")}
                  </Badge>
                </div>

                <div className="mb-3 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer</span>
                    <span>{project.customer.name}</span>
                  </div>
                  {project.budget && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Budget</span>
                      <span>{formatCurrency(Number(project.budget))}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tasks</span>
                    <span>{completedTasks}/{totalTasks}</span>
                  </div>
                </div>

                <ProgressBar value={progress} className="mb-2" />

                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{Math.round(progress)}% complete</span>
                  {project.endDate && <span>Due {formatDate(project.endDate)}</span>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
