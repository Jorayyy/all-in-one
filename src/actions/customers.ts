"use server";

import { db } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface CreateCustomerInput {
  name: string;
  type?: string;
  email?: string;
  phone?: string;
  address?: string;
  tinNumber?: string;
  contactPerson?: string;
  notes?: string;
}

export async function createCustomer(input: CreateCustomerInput) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"]);

  if (!input.name?.trim()) throw new Error("Name is required");

  const customer = await db.customer.create({
    data: {
      name: input.name.trim(),
      type: input.type || "RESIDENTIAL",
      email: input.email,
      phone: input.phone,
      address: input.address,
      tinNumber: input.tinNumber,
      contactPerson: input.contactPerson,
      notes: input.notes,
    },
  });

  revalidatePath("/customers");
  return customer;
}

export async function updateCustomer(id: string, input: Partial<CreateCustomerInput>) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"]);

  const customer = await db.customer.update({
    where: { id },
    data: {
      name: input.name?.trim(),
      type: input.type,
      email: input.email,
      phone: input.phone,
      address: input.address,
      tinNumber: input.tinNumber,
      contactPerson: input.contactPerson,
      notes: input.notes,
    },
  });

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  return customer;
}

export async function deleteCustomer(id: string) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"]);

  await db.customer.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/customers");
  return { success: true };
}

export async function getCustomerById(id: string) {
  await requireAuth();
  return db.customer.findUnique({
    where: { id },
    include: {
      projects: { orderBy: { createdAt: "desc" } },
      invoices: { orderBy: { createdAt: "desc" }, take: 10 },
      tickets: { orderBy: { createdAt: "desc" }, take: 10 },
      quotations: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
}

export async function getCustomersForSelect() {
  await requireAuth();
  return db.customer.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, type: true },
    orderBy: { name: "asc" },
  });
}