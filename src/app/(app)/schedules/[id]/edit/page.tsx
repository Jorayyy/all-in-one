"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "@/components/icons";
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import toast from "react-hot-toast";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
}

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isNight: boolean;
}

export default function EditSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  const [form, setForm] = useState({
    employeeId: "",
    shiftId: "",
    date: "",
    isRestDay: false,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [scheduleRes, employeesRes, shiftsRes] = await Promise.all([
          fetch(`/api/schedules/${id}`),
          fetch("/api/employees-list"),
          fetch("/api/shifts"),
        ]);

        if (!scheduleRes.ok) throw new Error("Failed to fetch schedule");
        const scheduleData = await scheduleRes.json();
        const schedule = scheduleData.schedule || scheduleData;

        setForm({
          employeeId: schedule.employeeId || "",
          shiftId: schedule.shiftId || "",
          date: schedule.date ? new Date(schedule.date).toISOString().slice(0, 10) : "",
          isRestDay: Boolean(schedule.isRestDay),
        });

        if (employeesRes.ok) {
          const empData = await employeesRes.json();
          setEmployees(empData.employees || empData || []);
        }

        if (shiftsRes.ok) {
          const shiftData = await shiftsRes.json();
          setShifts(shiftData.shifts || shiftData || []);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load schedule");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/schedules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update schedule");
      }

      toast.success("Schedule updated successfully");
      router.push("/schedules");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-16 animate-pulse rounded-md bg-secondary" />
          <div className="space-y-2">
            <div className="h-6 w-32 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-48 animate-pulse rounded bg-secondary" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-10 w-full animate-pulse rounded bg-secondary" />
              <div className="h-10 w-full animate-pulse rounded bg-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/schedules">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Schedule</h1>
          <p className="text-muted-foreground">Update shift assignment</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Employee *</label>
                <select
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Shift *</label>
                <select
                  name="shiftId"
                  value={form.shiftId}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select shift</option>
                  {shifts.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.name} ({shift.startTime} - {shift.endTime}){shift.isNight ? " (Night)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date *</label>
                <Input type="date" name="date" value={form.date} onChange={handleChange} required />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isRestDay"
                    checked={form.isRestDay}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="text-sm font-medium">Rest Day</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Link href="/schedules">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={submitting}>
                <Pencil className="h-4 w-4 mr-2" />
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
