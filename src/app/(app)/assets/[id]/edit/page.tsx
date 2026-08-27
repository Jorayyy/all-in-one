"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "@/components/icons";
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import toast from "react-hot-toast";

interface Location {
  id: string;
  name: string;
  code: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
}

export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    serialNumber: "",
    purchaseDate: "",
    purchaseCost: "",
    status: "AVAILABLE",
    locationId: "",
    assigneeId: "",
    nextMaintenance: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [assetRes, locationsRes, employeesRes] = await Promise.all([
          fetch(`/api/assets/${id}`),
          fetch("/api/locations"),
          fetch("/api/employees-list"),
        ]);

        if (!assetRes.ok) throw new Error("Failed to fetch asset");
        const assetData = await assetRes.json();
        const asset = assetData.asset || assetData;

        setForm({
          name: asset.name || "",
          code: asset.code || "",
          description: asset.description || "",
          serialNumber: asset.serialNumber || "",
          purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().slice(0, 10) : "",
          purchaseCost: asset.purchaseCost != null ? String(asset.purchaseCost) : "",
          status: asset.status || "AVAILABLE",
          locationId: asset.locationId || "",
          assigneeId: asset.assigneeId || "",
          nextMaintenance: asset.nextMaintenance ? new Date(asset.nextMaintenance).toISOString().slice(0, 10) : "",
        });

        if (locationsRes.ok) {
          const locData = await locationsRes.json();
          setLocations(locData.locations || locData || []);
        }

        if (employeesRes.ok) {
          const empData = await employeesRes.json();
          setEmployees(empData.employees || empData || []);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load asset");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/assets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          purchaseCost: form.purchaseCost ? Number(form.purchaseCost) : null,
          purchaseDate: form.purchaseDate || null,
          nextMaintenance: form.nextMaintenance || null,
          locationId: form.locationId || null,
          assigneeId: form.assigneeId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update asset");
      }

      toast.success("Asset updated successfully");
      router.push("/assets");
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
              <div className="h-24 w-full animate-pulse rounded bg-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/assets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Asset</h1>
          <p className="text-muted-foreground">Update asset information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asset Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input name="name" value={form.name} onChange={handleChange} required placeholder="Asset name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Code *</label>
                <Input name="code" value={form.code} onChange={handleChange} required placeholder="Asset code" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Serial Number</label>
                <Input name="serialNumber" value={form.serialNumber} onChange={handleChange} placeholder="Serial number" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Purchase Cost</label>
                <Input type="number" name="purchaseCost" step="0.01" min="0" value={form.purchaseCost} onChange={handleChange} placeholder="0.00" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Asset description"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Purchase Date</label>
                <Input type="date" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Next Maintenance</label>
                <Input type="date" name="nextMaintenance" value={form.nextMaintenance} onChange={handleChange} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status *</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="IN_USE">In Use</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="RETIRED">Retired</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <select
                  name="locationId"
                  value={form.locationId}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Assignee</label>
              <select
                name="assigneeId"
                value={form.assigneeId}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Unassigned</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <Link href="/assets">
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
