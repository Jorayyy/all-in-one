"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "@/components/icons";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import toast from "react-hot-toast";

export default function CreateEmployeePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    gender: "",
    birthDate: "",
    hireDate: "",
    departmentId: "",
    position: "",
    salary: "",
    sssNumber: "",
    philhealthNumber: "",
    pagibigNumber: "",
    tinNumber: "",
    address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const body = {
        ...form,
        salary: form.salary ? parseFloat(form.salary) : undefined,
        status: "PROBATIONARY",
      };

      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create employee");
      }

      toast.success("Employee created successfully");
      router.push("/employees");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/employees">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create Employee</h1>
          <p className="text-muted-foreground">Add a new employee to the system</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name *</label>
                <Input name="firstName" value={form.firstName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name *</label>
                <Input name="lastName" value={form.lastName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Middle Name</label>
                <Input name="middleName" value={form.middleName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input type="email" name="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone *</label>
                <Input name="phone" value={form.phone} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender *</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Birth Date</label>
                <Input type="date" name="birthDate" value={form.birthDate} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hire Date *</label>
                <Input type="date" name="hireDate" value={form.hireDate} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department ID</label>
                <Input name="departmentId" value={form.departmentId} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Position *</label>
                <Input name="position" value={form.position} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Salary</label>
                <Input type="number" name="salary" value={form.salary} onChange={handleChange} min="0" step="0.01" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">SSS Number</label>
                <Input name="sssNumber" value={form.sssNumber} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">PhilHealth Number</label>
                <Input name="philhealthNumber" value={form.philhealthNumber} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pag-IBIG Number</label>
                <Input name="pagibigNumber" value={form.pagibigNumber} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">TIN Number</label>
                <Input name="tinNumber" value={form.tinNumber} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                <Plus className="h-4 w-4 mr-2" />
                {submitting ? "Creating..." : "Create Employee"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
