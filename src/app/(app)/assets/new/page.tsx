"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "@/components/icons";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import toast from "react-hot-toast";

interface Location {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

export default function NewAssetPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingData, setLoadingData] = useState(true);

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
        const [locRes, empRes] = await Promise.all([
          fetch("/api/locations"),
          fetch("/api/employees"),
        ]);
        if (locRes.ok) setLocations(await locRes.json());
        if (empRes.ok) setEmployees(await empRes.json());
      } catch {
        // silently fail
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          purchaseCost: Number(form.purchaseCost),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create asset");
      }

      toast.success("Asset created successfully");
      router.push("/assets");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/assets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create Asset</h1>
          <p className="text-muted-foreground">Register a new company asset</p>
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
                <label className="text-sm font-medium">Purchase Cost *</label>
                <Input type="number" name="purchaseCost" step="0.01" min="0" value={form.purchaseCost} onChange={handleChange} required placeholder="0.00" />
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
                <label className="text-sm font-medium">Purchase Date *</label>
                <Input type="date" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} required />
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
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location *</label>
                <select
                  name="locationId"
                  value={form.locationId}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">{loadingData ? "Loading..." : "Select location"}</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
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
                <option value="">{loadingData ? "Loading..." : "Unassigned"}</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                <Plus className="h-4 w-4 mr-2" />
                {submitting ? "Creating..." : "Create Asset"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
