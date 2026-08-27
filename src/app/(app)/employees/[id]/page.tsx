import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { formatDate, fullName, getInitials, formatCurrency } from "@/lib/format";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash, Envelope, Phone, MapPin } from "@/components/icons";

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
        <div className="flex items-center gap-3">
          <Link href="/employees" className="rounded-md p-1.5 hover:bg-secondary">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-xl font-semibold">
              {fullName(employee.firstName, employee.lastName, employee.middleName)}
            </h2>
            <p className="text-sm text-muted-foreground">{employee.employeeNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Pencil className="mr-1.5 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" size="sm">
            <Trash className="mr-1.5 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-lg font-semibold">
                {getInitials(employee.firstName, employee.lastName)}
              </div>
              <h3 className="mt-3 text-lg font-semibold">
                {fullName(employee.firstName, employee.lastName, employee.middleName, employee.suffix)}
              </h3>
              <p className="text-sm text-muted-foreground">{employee.position}</p>
              <Badge variant={statusVariant[employee.status]} className="mt-2">
                {employee.status}
              </Badge>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Envelope className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{employee.email || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{employee.phone || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{employee.address || "-"}</span>
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
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="text-sm font-medium">{employee.department.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">{employee.location?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hire Date</p>
                  <p className="text-sm font-medium">{formatDate(employee.hireDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Regularized</p>
                  <p className="text-sm font-medium">
                    {employee.regularizedDate ? formatDate(employee.regularizedDate) : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Salary</p>
                  <p className="text-sm font-medium">
                    {employee.salary ? formatCurrency(Number(employee.salary)) : "-"}
                  </p>
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
                  <p className="text-xs text-muted-foreground">SSS</p>
                  <p className="text-sm font-medium">{employee.sssNumber || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">PhilHealth</p>
                  <p className="text-sm font-medium">{employee.philhealthNumber || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">PAG-IBIG</p>
                  <p className="text-sm font-medium">{employee.pagibigNumber || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">TIN</p>
                  <p className="text-sm font-medium">{employee.tinNumber || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {employee.attendance.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No attendance records
                </p>
              ) : (
                <div className="space-y-2">
                  {employee.attendance.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between rounded-md border border-border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{formatDate(record.date)}</p>
                        <p className="text-xs text-muted-foreground">
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
