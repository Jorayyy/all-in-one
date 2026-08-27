import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { Plus, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export default async function SchedulesPage() {
  await requireAuth();

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const schedules = await db.schedule.findMany({
    where: {
      date: {
        gte: startOfWeek,
        lte: endOfWeek,
      },
    },
    include: {
      employee: true,
      shift: true,
    },
    orderBy: { date: "asc" },
  });

  const shifts = await db.shift.findMany({
    orderBy: { startTime: "asc" },
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Schedules</h2>
          <p className="text-gray-500">Manage employee shifts and schedules</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Schedule
        </Button>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold">
              {startOfWeek.toLocaleDateString("en-PH", {
                month: "long",
                day: "numeric",
              })}{" "}
              -{" "}
              {endOfWeek.toLocaleDateString("en-PH", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h3>
            <Button variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 divide-x divide-gray-200">
            {weekDays.map((day, index) => (
              <div key={index} className="min-h-[400px]">
                <div
                  className={`border-b p-2 text-center ${
                    day.toDateString() === today.toDateString()
                      ? "bg-blue-50 text-blue-600"
                      : "bg-gray-50"
                  }`}
                >
                  <p className="text-xs text-gray-500">
                    {day.toLocaleDateString("en-PH", { weekday: "short" })}
                  </p>
                  <p className="text-lg font-semibold">{day.getDate()}</p>
                </div>
                <div className="space-y-1 p-1">
                  {schedules
                    .filter(
                      (s) =>
                        new Date(s.date).toDateString() === day.toDateString()
                    )
                    .map((schedule) => (
                      <div
                        key={schedule.id}
                        className={`rounded p-1 text-xs ${
                          schedule.isRestDay
                            ? "bg-gray-100 text-gray-500"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        <p className="font-medium">
                          {schedule.employee.firstName}{" "}
                          {schedule.employee.lastName.charAt(0)}.
                        </p>
                        <p>
                          {schedule.shift.startTime} - {schedule.shift.endTime}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shifts */}
      <Card>
        <CardHeader>
          <CardTitle>Available Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {shifts.map((shift) => (
              <div
                key={shift.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{shift.name}</p>
                  <p className="text-sm text-gray-500">
                    {shift.startTime} - {shift.endTime}
                  </p>
                </div>
                {shift.isNight && (
                  <Badge variant="secondary">Night Shift</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
