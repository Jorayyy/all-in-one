import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { Clock, Download, Funnel, CheckCircle, XCircle, Warning } from "phosphor-react";

export default async function AttendancePage() {
  await requireAuth();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await db.attendance.findMany({
    where: {
      date: {
        gte: new Date(today.getFullYear(), today.getMonth(), 1),
        lte: today,
      },
    },
    include: { employee: true },
    orderBy: [{ date: "desc" }, { employee: { employeeNumber: "asc" } }],
  });

  const stats = {
    present: attendance.filter((a) => a.status === "PRESENT").length,
    late: attendance.filter((a) => a.status === "LATE").length,
    absent: attendance.filter((a) => a.status === "ABSENT").length,
  };

  const statusVariant: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
    PRESENT: "success",
    LATE: "warning",
    ABSENT: "destructive",
    ON_LEAVE: "default",
    REST_DAY: "secondary",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Attendance</h2>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-PH", { month: "long", year: "numeric" })}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-1.5 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-success/10 p-2 text-success">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Present</p>
                <p className="text-xl font-semibold">{stats.present}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-warning/10 p-2 text-warning">
                <Warning className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Late</p>
                <p className="text-xl font-semibold">{stats.late}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-destructive/10 p-2 text-destructive">
                <XCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Absent</p>
                <p className="text-xl font-semibold">{stats.absent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Records</CardTitle>
            <Button variant="outline" size="sm">
              <Funnel className="mr-1.5 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 font-medium text-muted-foreground">Employee</th>
                  <th className="pb-3 font-medium text-muted-foreground">Date</th>
                  <th className="pb-3 font-medium text-muted-foreground">Clock In</th>
                  <th className="pb-3 font-medium text-muted-foreground">Clock Out</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.slice(0, 50).map((record) => (
                  <tr key={record.id} className="border-b border-border">
                    <td className="py-3">
                      <p className="font-medium">
                        {record.employee.firstName} {record.employee.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.employee.employeeNumber}
                      </p>
                    </td>
                    <td className="py-3 text-muted-foreground">{formatDate(record.date)}</td>
                    <td className="py-3 text-muted-foreground">
                      {record.clockIn
                        ? new Date(record.clockIn).toLocaleTimeString("en-PH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {record.clockOut
                        ? new Date(record.clockOut).toLocaleTimeString("en-PH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td className="py-3">
                      <Badge variant={statusVariant[record.status]}>
                        {record.status}
                      </Badge>
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
