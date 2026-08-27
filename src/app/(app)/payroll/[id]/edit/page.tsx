"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "@/components/icons";
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import toast from "react-hot-toast";

export default function EditPayPeriodPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    async function fetchPeriod() {
      try {
        let res = await fetch(`/api/pay-periods/${id}`);
        if (!res.ok) {
          res = await fetch(`/api/payroll/${id}`);
        }
        if (!res.ok) throw new Error("Failed to fetch pay period");
        const data = await res.json();
        const period = data.payPeriod || data.period || data;

        setForm({
          startDate: period.startDate ? new Date(period.startDate).toISOString().slice(0, 10) : "",
          endDate: period.endDate ? new Date(period.endDate).toISOString().slice(0, 10) : "",
        });
      } catch (error: any) {
        toast.error(error.message || "Failed to load pay period");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchPeriod();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let res = await fetch(`/api/pay-periods/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      // fallback to /api/payroll
      if (!res.ok && res.status === 404) {
        res = await fetch(`/api/payroll/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update pay period");
      }

      toast.success("Pay period updated successfully");
      router.push(`/payroll/${id}`);
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
        <Link href={`/payroll/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Pay Period</h1>
          <p className="text-muted-foreground">Update pay period dates</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pay Period Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="flex justify-end gap-2">
              <Link href={`/payroll/${id}`}>
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
