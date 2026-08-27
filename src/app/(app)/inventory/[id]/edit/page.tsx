"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "@/components/icons";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  code: string;
  parentId: string | null;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    description: "",
    categoryId: "",
    unitPrice: "",
    costPrice: "",
    unit: "pc",
    minStock: "",
  });

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch {
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProduct() {
      try {
        // Try inventory alias first, fallback to products
        let res = await fetch(`/api/inventory/${id}`);
        if (!res.ok) {
          res = await fetch(`/api/products/${id}`);
        }
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        const product = data.product || data;
        setForm({
          name: product.name || "",
          sku: product.sku || "",
          description: product.description || "",
          categoryId: product.categoryId || "",
          unitPrice: product.unitPrice != null ? String(product.unitPrice) : "",
          costPrice: product.costPrice != null ? String(product.costPrice) : "",
          unit: product.unit || "pc",
          minStock: product.minStock != null ? String(product.minStock) : "",
        });
      } catch (error: any) {
        toast.error(error.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Try products endpoint first, fallback to inventory
      let res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          unitPrice: form.unitPrice ? parseFloat(form.unitPrice) : 0,
          costPrice: form.costPrice ? parseFloat(form.costPrice) : 0,
          minStock: form.minStock ? parseInt(form.minStock, 10) : 0,
        }),
      });

      if (!res.ok) {
        // Try inventory alias if products fails
        res = await fetch(`/api/inventory/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            unitPrice: form.unitPrice ? parseFloat(form.unitPrice) : 0,
            costPrice: form.costPrice ? parseFloat(form.costPrice) : 0,
            minStock: form.minStock ? parseInt(form.minStock, 10) : 0,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update product");

      toast.success("Product updated successfully");
      router.push(`/inventory/${id}`);
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
          <Link href={`/inventory/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Product</h1>
            <p className="text-muted-foreground">Update product information</p>
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
        <Link href={`/inventory/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground">Update product information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input name="name" value={form.name} onChange={handleChange} required placeholder="Product name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">SKU *</label>
                <Input name="sku" value={form.sku} onChange={handleChange} required placeholder="Stock keeping unit" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">{loadingCategories ? "Loading..." : "Select category"}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit</label>
                <Input name="unit" value={form.unit} onChange={handleChange} placeholder="e.g. pc, kg, box" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Product description"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit Price *</label>
                <Input type="number" name="unitPrice" step="0.01" min="0" value={form.unitPrice} onChange={handleChange} required placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cost Price *</label>
                <Input type="number" name="costPrice" step="0.01" min="0" value={form.costPrice} onChange={handleChange} required placeholder="0.00" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Stock *</label>
                <Input type="number" name="minStock" min="0" value={form.minStock} onChange={handleChange} required placeholder="0" />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                <Pencil className="h-4 w-4 mr-2" />
                {submitting ? "Updating..." : "Update Product"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
