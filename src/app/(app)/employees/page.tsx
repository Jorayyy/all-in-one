import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, Button, Badge, Input } from "@/components/ui";
import { formatDate, fullName, getInitials } from "@/lib/format";
import Link from "next/link";
import { Plus, MagnifyingGlass, Funnel, Download } from "@/components/icons";

export default async function EmployeesPage() {
  await requireAuth();

  const employees = await db.employee.findMany({
    where: { deletedAt: null },
    include: {
      department: true,
      location: true,
    },
    orderBy: { employeeNumber: "asc" },
  });

  const statusVariant: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
    PROBATIONARY: "warning",
    REGULAR: "success",
    CONTRACTUAL: "secondary",
    RESIGNED: "destructive",
    TERMINATED: "destructive",
    AWOL: "destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Employees</h2>
          <p className="text-sm text-muted-foreground">
            {employees.length} total employees
          </p>
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
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search employees..."
                className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <Button variant="outline" size="sm">
              <Funnel className="mr-1.5 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-4 w-4" />
              Export
            </Button>
          </div>

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
                {employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-border transition-colors hover:bg-muted/50"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar initials={getInitials(employee.firstName, employee.lastName)} />
                        <div>
                          <p className="font-medium">
                            {fullName(employee.firstName, employee.lastName, employee.middleName)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {employee.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground">{employee.employeeNumber}</td>
                    <td className="py-3 text-muted-foreground">{employee.department.name}</td>
                    <td className="py-3 text-muted-foreground">{employee.position || "-"}</td>
                    <td className="py-3">
                      <Badge variant={statusVariant[employee.status]}>
                        {employee.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatDate(employee.hireDate)}
                    </td>
                    <td className="py-3">
                      <Link
                        href={`/employees/${employee.id}`}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        View
                      </Link>
                    </td>
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

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium text-muted-foreground">
      {initials}
    </div>
  );
}
