import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, Button, Badge, Input } from "@/components/ui";
import { formatDate, fullName, getInitials } from "@/lib/format";
import { Plus } from "@/components/icons";
import Link from "next/link";

type SearchParams = Promise<{ q?: string; status?: string; departmentId?: string; page?: string }>;

export default async function EmployeesPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAuth();
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const status = params.status || "";
  const departmentId = params.departmentId || "";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const perPage = 10;

  const where: Record<string, unknown> = { deletedAt: null };
  if (q) {
    (where as Record<string, unknown>).OR = [
      { firstName: { contains: q, mode: "insensitive" as const } },
      { lastName: { contains: q, mode: "insensitive" as const } },
      { email: { contains: q, mode: "insensitive" as const } },
      { employeeNumber: { contains: q, mode: "insensitive" as const } },
    ];
  }
  if (status) (where as Record<string, unknown>).status = status;
  if (departmentId) (where as Record<string, unknown>).departmentId = departmentId;

  const [total, employees, departments] = await Promise.all([
    db.employee.count({ where: where as never }),
    db.employee.findMany({
      where: where as never,
      include: { department: true, location: true },
      orderBy: { employeeNumber: "asc" },
      take: perPage,
      skip: (page - 1) * perPage,
    }),
    db.department.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const statusVariant: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
    PROBATIONARY: "warning",
    REGULAR: "success",
    CONTRACTUAL: "secondary",
    RESIGNED: "destructive",
    TERMINATED: "destructive",
    AWOL: "destructive",
  };

  const buildQuery = (nextPage: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (status) sp.set("status", status);
    if (departmentId) sp.set("departmentId", departmentId);
    if (nextPage > 1) sp.set("page", String(nextPage));
    const qs = sp.toString();
    return qs ? `?${qs}` : "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Employees</h2>
          <p className="text-sm text-muted-foreground">{total} total employees</p>
        </div>
        <Link href="/employees/new">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Employee
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <form method="GET" className="mb-4 flex flex-wrap items-center gap-3">
            <Input
              name="q"
              placeholder="Search name, email, number..."
              defaultValue={q}
              className="h-9 w-full max-w-xs"
            />
            <select
              name="status"
              defaultValue={status}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">All Status</option>
              <option value="PROBATIONARY">PROBATIONARY</option>
              <option value="REGULAR">REGULAR</option>
              <option value="CONTRACTUAL">CONTRACTUAL</option>
              <option value="RESIGNED">RESIGNED</option>
              <option value="TERMINATED">TERMINATED</option>
              <option value="AWOL">AWOL</option>
            </select>
            <select
              name="departmentId"
              defaultValue={departmentId}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <Button type="submit" size="sm">
              Search
            </Button>
            {(q || status || departmentId) && (
              <Link href="/employees" className="text-sm text-muted-foreground hover:text-foreground">
                Clear
              </Link>
            )}
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 font-medium text-muted-foreground">Employee</th>
                  <th className="pb-3 font-medium text-muted-foreground">Number</th>
                  <th className="pb-3 font-medium text-muted-foreground">Department</th>
                  <th className="pb-3 font-medium text-muted-foreground">Position</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground">Hire Date</th>
                  <th className="pb-3 font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.id} className="border-b border-border transition-colors hover:bg-muted/50">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar initials={getInitials(employee.firstName, employee.lastName)} />
                          <div>
                            <p className="font-medium">{fullName(employee.firstName, employee.lastName, employee.middleName)}</p>
                            <p className="text-xs text-muted-foreground">{employee.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground">{employee.employeeNumber}</td>
                      <td className="py-3 text-muted-foreground">{employee.department.name}</td>
                      <td className="py-3 text-muted-foreground">{employee.position || "-"}</td>
                      <td className="py-3">
                        <Badge variant={statusVariant[employee.status]}>{employee.status}</Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">{formatDate(employee.hireDate)}</td>
                      <td className="py-3">
                        <Link href={`/employees/${employee.id}`} className="text-sm text-muted-foreground hover:text-foreground">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Page {page} of {totalPages} (total {total})
            </span>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link href={`/employees${buildQuery(page - 1)}`}>
                  <Button variant="outline" size="sm">Prev</Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled>Prev</Button>
              )}
              {page < totalPages ? (
                <Link href={`/employees${buildQuery(page + 1)}`}>
                  <Button variant="outline" size="sm">Next</Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled>Next</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium text-muted-foreground">
      {initials}
    </div>
  );
}
