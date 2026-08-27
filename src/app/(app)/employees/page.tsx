import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from "@/components/ui";
import { formatDate, fullName, getInitials } from "@/lib/format";
import Link from "next/link";
import { Plus, Search, Filter, Download } from "lucide-react";

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

  const statusColors: Record<string, string> = {
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
          <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
          <p className="text-gray-500">{employees.length} total employees</p>
        </div>
        <Link href="/employees/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-500">Employee</th>
                  <th className="pb-3 font-medium text-gray-500">Number</th>
                  <th className="pb-3 font-medium text-gray-500">Department</th>
                  <th className="pb-3 font-medium text-gray-500">Position</th>
                  <th className="pb-3 font-medium text-gray-500">Location</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500">Hire Date</th>
                  <th className="pb-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-800">
                          {getInitials(employee.firstName, employee.lastName)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {fullName(employee.firstName, employee.lastName, employee.middleName)}
                          </p>
                          <p className="text-gray-500">{employee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-gray-600">{employee.employeeNumber}</td>
                    <td className="py-4 text-gray-600">{employee.department.name}</td>
                    <td className="py-4 text-gray-600">{employee.position || "-"}</td>
                    <td className="py-4 text-gray-600">{employee.location?.name || "-"}</td>
                    <td className="py-4">
                      <Badge variant={statusColors[employee.status] as any}>
                        {employee.status}
                      </Badge>
                    </td>
                    <td className="py-4 text-gray-600">{formatDate(employee.hireDate)}</td>
                    <td className="py-4">
                      <Link
                        href={`/employees/${employee.id}`}
                        className="text-blue-600 hover:text-blue-700"
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
