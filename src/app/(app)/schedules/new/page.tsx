"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "@/components/icons";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import toast from "react-hot-toast";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

interface Shift {
  id: string;
  name: string;
}

export default function NewSchedulePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [form, setForm] = useState({
    employeeId: "",
    shiftId: "",
    date: "",
    isRestDay: false,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [empRes, shiftRes] = await Promise.all([
          fetch("/api/employees"),
          fetch("/api/shifts"),
        ]);
        if (empRes.ok) setEmployees(await empRes.json());
        if (shiftRes.ok) setShifts(await shiftRes.json());
      } catch {
        // silently fail
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, []);

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
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create schedule");
      }

      toast.success("Schedule created successfully");
      router.push("/schedules");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/schedules">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create Schedule</h1>
          <p className="text-muted-foreground">Assign a shift schedule to an employee</p>
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
                  <option value="">{loadingData ? "Loading..." : "Select employee"}</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
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
                  <option value="">{loadingData ? "Loading..." : "Select shift"}</option>
                  {shifts.map((shift) => (
                    <option key={shift.id} value={shift.id}>{shift.name}</option>
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

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                <Plus className="h-4 w-4 mr-2" />
                {submitting ? "Creating..." : "Create Schedule"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
