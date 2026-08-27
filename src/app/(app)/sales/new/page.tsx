"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "@/components/icons";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import toast from "react-hot-toast";

interface Customer {
  id: string;
  name: string;
  type: string;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  const [form, setForm] = useState({
    customerId: "",
    number: "",
    date: new Date().toISOString().slice(0, 10),
    dueDate: "",
    subtotal: "",
    tax: "",
    discount: "",
    total: "",
    notes: "",
    status: "DRAFT",
  });

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch("/api/customers");
        const data = await res.json();
        setCustomers(data.customers || []);
      } catch {
        setCustomers([]);
      } finally {
        setLoadingCustomers(false);
      }
    }
    fetchCustomers();
  }, []);

  // Auto-calc total when subtotal/tax/discount change
  useEffect(() => {
    const sub = Number(form.subtotal) || 0;
    const t = Number(form.tax) || 0;
    const d = Number(form.discount) || 0;
    const calc = sub + t - d;
    // Only auto-update if user hasn't manually diverged too far or if total is empty/derived
    // We always recompute to keep it in sync; user can still override by typing after
    if (form.subtotal !== "" || form.tax !== "" || form.discount !== "") {
      setForm((prev) => ({ ...prev, total: calc ? String(calc) : prev.total }));
    }
  }, [form.subtotal, form.tax, form.discount]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        customerId: form.customerId,
        number: form.number || undefined,
        date: form.date || undefined,
        dueDate: form.dueDate || undefined,
        subtotal: Number(form.subtotal),
        tax: Number(form.tax || 0),
        discount: Number(form.discount || 0),
        total: Number(form.total),
        notes: form.notes || undefined,
        status: form.status,
      };

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create invoice");
      }

      toast.success("Invoice created successfully");
      router.push("/sales");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/sales">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create Invoice</h1>
          <p className="text-muted-foreground">Add a new invoice to the system</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
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
                    <option key={cust.id} value={cust.id}>
                      {cust.name} ({cust.type})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Invoice Number</label>
                <Input
                  name="number"
                  value={form.number}
                  onChange={handleChange}
                  placeholder="INV-..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date *</label>
                <Input type="date" name="date" value={form.date} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subtotal *</label>
                <Input
                  type="number"
                  name="subtotal"
                  step="0.01"
                  min="0"
                  value={form.subtotal}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tax</label>
                <Input
                  type="number"
                  name="tax"
                  step="0.01"
                  min="0"
                  value={form.tax}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Discount</label>
                <Input
                  type="number"
                  name="discount"
                  step="0.01"
                  min="0"
                  value={form.discount}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Total *</label>
                <Input
                  type="number"
                  name="total"
                  step="0.01"
                  min="0"
                  value={form.total}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">Auto-calculated as subtotal + tax − discount (editable)</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Additional notes..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                <Plus className="h-4 w-4 mr-2" />
                {submitting ? "Creating..." : "Create Invoice"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
