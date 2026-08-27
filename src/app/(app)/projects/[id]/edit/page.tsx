"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "@/components/icons";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import toast from "react-hot-toast";

interface Customer {
  id: string;
  name: string;
  type: string;
}

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  const [form, setForm] = useState({
    name: "",
    description: "",
    customerId: "",
    startDate: "",
    endDate: "",
    budget: "",
    address: "",
    status: "",
  });

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch("/api/customers");
        if (res.ok) {
          const data = await res.json();
          // handle both array and {customers: []} shapes
          const list = data.customers || data || [];
          // if paginated or wrapped, fallback
          if (Array.isArray(list)) setCustomers(list);
          else setCustomers([]);
        } else {
          // fallback to fetch via dedicated logic: try /api/customers select
          const res2 = await fetch("/api/customers");
          const data2 = await res2.json();
          setCustomers(data2.customers || []);
        }
      } catch {
        try {
          const res = await fetch("/api/customers");
          const data = await res.json();
          setCustomers(data.customers || []);
        } catch {
          setCustomers([]);
        }
      } finally {
        setLoadingCustomers(false);
      }
    }
    fetchCustomers();
  }, []);

  // Separate effect to try loading from /api/customers via GET that returns departments style
  // Also try fetch directly for select options if above fails, we also try employees-list pattern
  useEffect(() => {
    if (customers.length === 0 && !loadingCustomers) {
      // already attempted, ensure we try a direct fetch that may return paginated data
    }
  }, [customers, loadingCustomers]);

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error("Failed to fetch project");
        const data = await res.json();
        const project = data.project || data;
        setForm({
          name: project.name || "",
          description: project.description || "",
          customerId: project.customerId || "",
          startDate: project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
          endDate: project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "",
          budget: project.budget != null ? String(project.budget) : "",
          address: project.address || "",
          status: project.status || "",
        });
      } catch (error: any) {
        toast.error(error.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProject();
  }, [id]);

  // Fetch customers via /api/customers if not already loaded - try alternative endpoint
  useEffect(() => {
    async function ensureCustomers() {
      if (customers.length > 0 || loadingCustomers) return;
      try {
        const res = await fetch("/api/customers");
        const data = await res.json();
        // If API returns paginated, try customers field
        if (data.customers && Array.isArray(data.customers)) {
          setCustomers(data.customers);
        }
      } catch {}
    }
    ensureCustomers();
  }, [customers, loadingCustomers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          budget: form.budget ? parseFloat(form.budget) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update project");

      toast.success("Project updated successfully");
      router.push(`/projects/${id}`);
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
          <Link href={`/projects/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Project</h1>
            <p className="text-muted-foreground">Update project information</p>
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
        <Link href={`/projects/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Project</h1>
          <p className="text-muted-foreground">Update project information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer *</label>
                <select
                  name="customerId"
                  value={form.customerId}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">{loadingCustomers ? "Loading..." : "Select customer"}</option>
                  {customers.map((cust) => (
                    <option key={cust.id} value={cust.id}>{cust.name} ({cust.type})</option>
                  ))}
                </select>
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
                  <option value="PLANNING">Planning</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date *</label>
                <Input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" name="endDate" value={form.endDate} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Budget</label>
                <Input type="number" name="budget" value={form.budget} onChange={handleChange} min="0" step="0.01" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
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
                {submitting ? "Updating..." : "Update Project"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
