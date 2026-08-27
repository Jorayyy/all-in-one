"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardContent } from "@/components/ui";
import { Clock, CheckCircle } from "@/components/icons";
import toast from "react-hot-toast";
import { clockIn, clockOut, getTodayAttendance } from "@/actions/attendance";

type AttendanceRecord = {
  id: string;
  date: string | Date;
  clockIn: string | Date | null;
  clockOut: string | Date | null;
  status: string;
} | null;

export default function ClockWidget() {
  const [attendance, setAttendance] = useState<AttendanceRecord>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Live current time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch today's attendance via API on mount
  // Alternative: can use server action getTodayAttendance() directly
  useEffect(() => {
    async function fetchToday() {
      try {
        // Primary: fetch via API route
        const res = await fetch("/api/attendance/today");
        if (res.ok) {
          const data = await res.json();
          setAttendance(data.attendance ?? null);
        } else {
          // Fallback: try server action directly
          try {
            const direct = await getTodayAttendance();
            setAttendance(direct as AttendanceRecord);
          } catch {
            // ignore
          }
        }
      } catch {
        // Fallback to server action if fetch fails
        try {
          const direct = await getTodayAttendance();
          setAttendance(direct as AttendanceRecord);
        } catch (err) {
          console.error("Failed to fetch attendance", err);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchToday();
  }, []);

  const handleClockIn = async () => {
    setActionLoading(true);
    try {
      // Primary: POST /api/attendance/clock-in
      const res = await fetch("/api/attendance/clock-in", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to clock in");

      setAttendance(data.attendance ?? data);
      toast.success("Clocked in successfully");

      // Alternative server action usage:
      // const result = await clockIn();
      // setAttendance(result as AttendanceRecord);
      // toast.success("Clocked in successfully");
    } catch (error) {
      // Fallback: try server action directly
      try {
        const result = await clockIn();
        setAttendance(result as AttendanceRecord);
        toast.success("Clocked in successfully");
        return;
      } catch (actionError) {
        toast.error(
          actionError instanceof Error
            ? actionError.message
            : error instanceof Error
              ? error.message
              : "Failed to clock in"
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    try {
      // Primary: POST /api/attendance/clock-out
      const res = await fetch("/api/attendance/clock-out", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to clock out");

      setAttendance(data.attendance ?? data);
      toast.success("Clocked out successfully");

      // Alternative server action usage:
      // const result = await clockOut();
      // setAttendance(result as AttendanceRecord);
      // toast.success("Clocked out successfully");
    } catch (error) {
      // Fallback: try server action directly
      try {
        const result = await clockOut();
        setAttendance(result as AttendanceRecord);
        toast.success("Clocked out successfully");
        return;
      } catch (actionError) {
        toast.error(
          actionError instanceof Error
            ? actionError.message
            : error instanceof Error
              ? error.message
              : "Failed to clock out"
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  const isClockedIn = !!attendance?.clockIn;
  const isClockedOut = !!attendance?.clockOut;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Today&apos;s Attendance</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {currentTime.toLocaleTimeString("en-PH", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentTime.toLocaleDateString("en-PH", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            {!loading && attendance && (
              <div className="pt-1 text-xs text-muted-foreground">
                {isClockedIn && (
                  <span>
                    Clocked in:{" "}
                    {new Date(attendance.clockIn as string | Date).toLocaleTimeString("en-PH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
                {isClockedOut && (
                  <span className="ml-3">
                    Clocked out:{" "}
                    {new Date(attendance.clockOut as string | Date).toLocaleTimeString("en-PH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
                {attendance.status && (
                  <span className="ml-3 font-medium">Status: {attendance.status}</span>
                )}
              </div>
            )}
            {loading && (
              <p className="text-xs text-muted-foreground">Loading attendance...</p>
            )}
          </div>

          <div className="flex items-center">
            {loading ? (
              <Button disabled variant="outline">
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Loading
              </Button>
            ) : !isClockedIn ? (
              <Button onClick={handleClockIn} disabled={actionLoading} className="min-w-[140px]">
                <Clock className="mr-2 h-4 w-4" />
                {actionLoading ? "Clocking in..." : "Clock In"}
              </Button>
            ) : !isClockedOut ? (
              <Button onClick={handleClockOut} disabled={actionLoading} variant="outline" className="min-w-[140px]">
                <Clock className="mr-2 h-4 w-4" />
                {actionLoading ? "Clocking out..." : "Clock Out"}
              </Button>
            ) : (
              <div className="flex items-center gap-2 rounded-md border border-success/20 bg-success/10 px-4 py-2 text-sm font-medium text-success">
                <CheckCircle className="h-4 w-4" />
                Completed
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { ClockWidget };
