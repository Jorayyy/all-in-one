import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { Calendar, Download, Filter, Clock } from "lucide-react";

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
    include: {
      employee: true,
      location: true,
    },
    orderBy: [{ date: "desc" }, { employee: { employeeNumber: "asc" } }],
  });

  const stats = {
    present: attendance.filter((a) => a.status === "PRESENT").length,
    late: attendance.filter((a) => a.status === "LATE").length,
    absent: attendance.filter((a) => a.status === "ABSENT").length,
    onLeave: attendance.filter((a) => a.status === "ON_LEAVE").length,
  };

  const statusColors: Record<string, string> = {
    PRESENT: "success",
    LATE: "warning",
    ABSENT: "destructive",
    ON_LEAVE: "secondary",
    REST_DAY: "outline",
    HOLIDAY: "info",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance</h2>
          <p className="text-gray-500">
            {new Date().toLocaleDateString("en-PH", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2 text-green-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Present Today</p>
                <p className="text-2xl font-bold">{stats.present}</p>
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
                <p className="text-sm text-gray-500">Late Today</p>
                <p className="text-2xl font-bold">{stats.late}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-2 text-red-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Absent Today</p>
                <p className="text-2xl font-bold">{stats.absent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">On Leave</p>
                <p className="text-2xl font-bold">{stats.onLeave}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Attendance Records</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-500">Employee</th>
                  <th className="pb-3 font-medium text-gray-500">Date</th>
                  <th className="pb-3 font-medium text-gray-500">Clock In</th>
                  <th className="pb-3 font-medium text-gray-500">Clock Out</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500">Location</th>
                </tr>
              </thead>
              <tbody>
                {attendance.slice(0, 50).map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3">
                      <p className="font-medium">
                        {record.employee.firstName} {record.employee.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {record.employee.employeeNumber}
                      </p>
                    </td>
                    <td className="py-3 text-gray-600">{formatDate(record.date)}</td>
                    <td className="py-3 text-gray-600">
                      {record.clockIn
                        ? new Date(record.clockIn).toLocaleTimeString("en-PH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td className="py-3 text-gray-600">
                      {record.clockOut
                        ? new Date(record.clockOut).toLocaleTimeString("en-PH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td className="py-3">
                      <Badge variant={statusColors[record.status] as any}>
                        {record.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-gray-600">{record.location?.name || "-"}</td>
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
