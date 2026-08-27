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

export default function NewLeavePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  const [form, setForm] = useState({
    employeeId: "",
    type: "",
    startDate: "",
    endDate: "",
    days: "",
    reason: "",
  });

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await fetch("/api/employees");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setEmployees(data);
      } catch {
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    }
    fetchEmployees();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          days: Number(form.days),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create leave request");
      }

      toast.success("Leave request created successfully");
      router.push("/leaves");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/leaves">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create Leave Request</h1>
          <p className="text-muted-foreground">Submit a new leave request</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Details</CardTitle>
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
                  <option value="">{loadingEmployees ? "Loading..." : "Select employee"}</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Leave Type *</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select type</option>
                  <option value="VL">Vacation Leave</option>
                  <option value="SL">Sick Leave</option>
                  <option value="SPL">Special Leave</option>
                  <option value="MATERNITY">Maternity</option>
                  <option value="PATERNITY">Paternity</option>
                  <option value="BEREAVEMENT">Bereavement</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date *</label>
                <Input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date *</label>
                <Input type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Days *</label>
                <Input type="number" name="days" min="1" value={form.days} onChange={handleChange} required placeholder="0" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                rows={4}
                placeholder="Reason for leave"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                <Plus className="h-4 w-4 mr-2" />
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
