"use server";

import { db } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface CreateProductInput {
  name: string;
  sku: string;
  description?: string;
  categoryId: string;
  unitPrice: number;
  costPrice: number;
  unit?: string;
  minStock?: number;
}

export async function createProduct(input: CreateProductInput) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"]);

  if (!input.name?.trim()) throw new Error("Product name is required");
  if (!input.sku?.trim()) throw new Error("SKU is required");
  if (!input.categoryId) throw new Error("Category is required");
  if (input.unitPrice == null || input.unitPrice < 0) throw new Error("Valid unit price required");
  if (input.costPrice == null || input.costPrice < 0) throw new Error("Valid cost price required");

  const existingSku = await db.product.findUnique({ where: { sku: input.sku.trim() } });
  if (existingSku) throw new Error("SKU already exists");

  const product = await db.product.create({
    data: {
      name: input.name.trim(),
      sku: input.sku.trim().toUpperCase(),
      description: input.description,
      categoryId: input.categoryId,
      unitPrice: String(input.unitPrice),
      costPrice: String(input.costPrice),
      unit: input.unit || "pc",
      minStock: input.minStock || 0,
    },
    include: { category: true },
  });

  revalidatePath("/inventory");
  return product;
}

export async function updateProduct(id: string, input: Partial<CreateProductInput>) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"]);

  if (input.sku) {
    const existingSku = await db.product.findFirst({
      where: { sku: input.sku.trim(), NOT: { id } },
    });
    if (existingSku) throw new Error("SKU already exists");
  }

  const product = await db.product.update({
    where: { id },
    data: {
      name: input.name?.trim(),
      sku: input.sku?.trim().toUpperCase(),
      description: input.description,
      categoryId: input.categoryId,
      unitPrice: input.unitPrice != null ? String(input.unitPrice) : undefined,
      costPrice: input.costPrice != null ? String(input.costPrice) : undefined,
      unit: input.unit,
      minStock: input.minStock,
    },
    include: { category: true },
  });

  revalidatePath("/inventory");
  revalidatePath(`/inventory/${id}`);
  return product;
}

export async function deleteProduct(id: string) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"]);

  await db.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/inventory");
  return { success: true };
}

export async function getProductById(id: string) {
  await requireAuth();
  return db.product.findUnique({
    where: { id },
    include: {
      category: true,
      stocks: { include: { location: true } },
      movements: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
}

export async function getCategoriesForSelect() {
  await requireAuth();
  return db.category.findMany({
    select: { id: true, name: true, code: true, parentId: true },
    orderBy: { name: "asc" },
  });
}