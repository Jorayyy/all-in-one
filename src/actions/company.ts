"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface UpdateCompanyInput {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  tinNumber?: string;
}

export async function updateCompany(input: UpdateCompanyInput) {
  await requireAuth();

  const existing = await db.company.findFirst();
  if (existing) {
    const updated = await db.company.update({
      where: { id: existing.id },
      data: {
        name: input.name ?? existing.name,
        address: input.address ?? undefined,
        phone: input.phone ?? undefined,
        email: input.email ?? undefined,
        website: input.website ?? undefined,
        tinNumber: input.tinNumber ?? undefined,
      },
    });
    revalidatePath("/settings");
    return { success: true, company: updated };
  } else {
    if (!input.name) throw new Error("Company name is required");
    const created = await db.company.create({
      data: {
        name: input.name,
        address: input.address || null,
        phone: input.phone || null,
        email: input.email || null,
        website: input.website || null,
        tinNumber: input.tinNumber || null,
      },
    });
    revalidatePath("/settings");
    return { success: true, company: created };
  }
}

export async function getCompany() {
  await requireAuth();
  return db.company.findFirst();
}

export async function updateUserRole(userId: string, role: string, isActive?: boolean) {
  await requireAuth();
  const user = await db.user.update({
    where: { id: userId },
    data: {
      role: role as any,
      ...(typeof isActive === "boolean" ? { isActive } : {}),
    },
  });
  revalidatePath("/settings");
  return { success: true, user };
}
