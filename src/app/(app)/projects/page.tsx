import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, ProgressBar } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/format";
import { Plus, Filter, FolderKanban, Clock, CheckCircle } from "lucide-react";

export default async function ProjectsPage() {
  await requireAuth();

  const projects = await db.project.findMany({
    where: { deletedAt: null },
    include: {
      customer: true,
      employees: {
        include: { employee: true },
      },
      tasks: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: projects.length,
    planning: projects.filter((p) => p.status === "PLANNING").length,
    inProgress: projects.filter((p) => p.status === "IN_PROGRESS").length,
    completed: projects.filter((p) => p.status === "COMPLETED").length,
  };

  const statusColors: Record<string, string> = {
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
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-gray-500">{projects.length} total projects</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                <FolderKanban className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gray-100 p-2 text-gray-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Planning</p>
                <p className="text-2xl font-bold">{stats.planning}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-2 text-yellow-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const completedTasks = project.tasks.filter(
            (t) => t.status === "DONE"
          ).length;
          const totalTasks = project.tasks.length;
          const progress =
            totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

          return (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500">{project.code}</p>
                    <h3 className="font-semibold">{project.name}</h3>
                  </div>
                  <Badge variant={statusColors[project.status] as any}>
                    {project.status.replace("_", " ")}
                  </Badge>
                </div>

                {project.description && (
                  <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                    {project.description}
                  </p>
                )}

                <div className="mb-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Customer</span>
                    <span>{project.customer.name}</span>
                  </div>
                  {project.budget && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Budget</span>
                      <span>{formatCurrency(Number(project.budget))}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tasks</span>
                    <span>
                      {completedTasks}/{totalTasks}
                    </span>
                  </div>
                </div>

                <ProgressBar value={progress} className="mb-2" />

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{Math.round(progress)}% complete</span>
                  {project.endDate && (
                    <span>Due {formatDate(project.endDate)}</span>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {project.employees.slice(0, 3).map((pe) => (
                      <div
                        key={pe.id}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800 ring-2 ring-white"
                      >
                        {pe.employee.firstName.charAt(0)}
                        {pe.employee.lastName.charAt(0)}
                      </div>
                    ))}
                  </div>
                  {project.employees.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{project.employees.length - 3} more
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
