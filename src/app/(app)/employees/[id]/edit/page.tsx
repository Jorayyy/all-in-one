"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "@/components/icons";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import toast from "react-hot-toast";

interface Department {
  id: string;
  name: string;
  code: string;
}

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

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
    status: "",
  });

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await fetch("/api/departments");
        const data = await res.json();
        setDepartments(data.departments || []);
      } catch {
        setDepartments([]);
      } finally {
        setLoadingDepartments(false);
      }
    }
    fetchDepartments();
  }, []);

  useEffect(() => {
    async function fetchEmployee() {
      try {
        const res = await fetch(`/api/employees/${id}`);
        if (!res.ok) throw new Error("Failed to fetch employee");
        const data = await res.json();
        const employee = data.employee || data;
        setForm({
          firstName: employee.firstName || "",
          lastName: employee.lastName || "",
          middleName: employee.middleName || "",
          email: employee.email || "",
          phone: employee.phone || "",
          gender: employee.gender || "",
          birthDate: employee.birthDate ? new Date(employee.birthDate).toISOString().split("T")[0] : "",
          hireDate: employee.hireDate ? new Date(employee.hireDate).toISOString().split("T")[0] : "",
          departmentId: employee.departmentId || "",
          position: employee.position || "",
          salary: employee.salary != null ? String(employee.salary) : "",
          sssNumber: employee.sssNumber || "",
          philhealthNumber: employee.philhealthNumber || "",
          pagibigNumber: employee.pagibigNumber || "",
          tinNumber: employee.tinNumber || "",
          address: employee.address || "",
          status: employee.status || "",
        });
      } catch (error: any) {
        toast.error(error.message || "Failed to load employee");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchEmployee();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salary: form.salary ? parseFloat(form.salary) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update employee");

      toast.success("Employee updated successfully");
      router.push(`/employees/${id}`);
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
          <Link href={`/employees/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Employee</h1>
            <p className="text-muted-foreground">Update employee information</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/employees/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Employee</h1>
          <p className="text-muted-foreground">Update employee information</p>
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
                <label className="text-sm font-medium">Department *</label>
                <select
                  name="departmentId"
                  value={form.departmentId}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">{loadingDepartments ? "Loading..." : "Select department"}</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
                  ))}
                </select>
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Status *</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select status</option>
                  <option value="PROBATIONARY">Probationary</option>
                  <option value="REGULAR">Regular</option>
                  <option value="CONTRACTUAL">Contractual</option>
                </select>
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
                <Pencil className="h-4 w-4 mr-2" />
                {submitting ? "Updating..." : "Update Employee"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
