import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { Plus, CaretLeft, CaretRight } from "@/components/icons";
import Link from "next/link";

export default async function SchedulesPage() {
  await requireAuth();

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const schedules = await db.schedule.findMany({
    where: {
      date: { gte: startOfWeek, lte: endOfWeek },
    },
    include: { employee: true, shift: true },
    orderBy: { date: "asc" },
  });

  const shifts = await db.shift.findMany({ orderBy: { startTime: "asc" } });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Schedules</h2>
          <p className="text-sm text-muted-foreground">Manage employee shifts</p>
        </div>
        <Link href="/schedules/new">
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Create
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm">
              <CaretLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-sm font-medium">
              {startOfWeek.toLocaleDateString("en-PH", { month: "short", day: "numeric" })} -{" "}
              {endOfWeek.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
            </h3>
            <Button variant="outline" size="sm">
              <CaretRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 divide-x divide-border">
            {weekDays.map((day, index) => (
              <div key={index} className="min-h-[300px]">
                <div
                  className={`border-b border-border p-2 text-center ${
                    day.toDateString() === today.toDateString()
                      ? "bg-secondary"
                      : ""
                  }`}
                >
                  <p className="text-[10px] text-muted-foreground">
                    {day.toLocaleDateString("en-PH", { weekday: "short" })}
                  </p>
                  <p className="text-sm font-medium">{day.getDate()}</p>
                </div>
                <div className="space-y-1 p-1">
                  {schedules
                    .filter((s) => new Date(s.date).toDateString() === day.toDateString())
                    .map((schedule) => (
                      <div
                        key={schedule.id}
                        className={`rounded p-1 text-[10px] ${
                          schedule.isRestDay
                            ? "bg-secondary text-muted-foreground"
                            : "bg-foreground text-background"
                        }`}
                      >
                        <p className="font-medium">
                          {schedule.employee.firstName} {schedule.employee.lastName.charAt(0)}.
                        </p>
                        <p>{schedule.shift.startTime}-{schedule.shift.endTime}</p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
