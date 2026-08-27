import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Tabs } from "@/components/ui";
import { formatDate, fullName, getInitials, formatCurrency } from "@/lib/format";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin } from "lucide-react";

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;

  const employee = await db.employee.findUnique({
    where: { id },
    include: {
      department: true,
      location: true,
      attendance: {
        orderBy: { date: "desc" },
        take: 10,
      },
      leaves: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!employee) {
    notFound();
  }

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
        <div className="flex items-center gap-4">
          <Link
            href="/employees"
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {fullName(employee.firstName, employee.lastName, employee.middleName)}
            </h2>
            <p className="text-gray-500">{employee.employeeNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-800">
                {getInitials(employee.firstName, employee.lastName)}
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                {fullName(employee.firstName, employee.lastName, employee.middleName, employee.suffix)}
              </h3>
              <p className="text-gray-500">{employee.position}</p>
              <Badge variant={statusColors[employee.status] as any} className="mt-2">
                {employee.status}
              </Badge>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{employee.email || "-"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{employee.phone || "-"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{employee.address || "-"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{employee.department.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{employee.location?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hire Date</p>
                  <p className="font-medium">{formatDate(employee.hireDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Regularized Date</p>
                  <p className="font-medium">
                    {employee.regularizedDate ? formatDate(employee.regularizedDate) : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Salary</p>
                  <p className="font-medium">
                    {employee.salary ? formatCurrency(Number(employee.salary)) : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Employee Number</p>
                  <p className="font-medium">{employee.employeeNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Government IDs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">SSS Number</p>
                  <p className="font-medium">{employee.sssNumber || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">PhilHealth Number</p>
                  <p className="font-medium">{employee.philhealthNumber || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">PAG-IBIG Number</p>
                  <p className="font-medium">{employee.pagibigNumber || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">TIN Number</p>
                  <p className="font-medium">{employee.tinNumber || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Attendance */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {employee.attendance.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No attendance records</p>
              ) : (
                <div className="space-y-2">
                  {employee.attendance.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{formatDate(record.date)}</p>
                        <p className="text-sm text-gray-500">
                          {record.clockIn ? new Date(record.clockIn).toLocaleTimeString() : "-"} -{" "}
                          {record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : "-"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          record.status === "PRESENT"
                            ? "success"
                            : record.status === "LATE"
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
