"use server";

import { db } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { AssetStatus } from "@prisma/client";

interface CreateAssetInput {
  name: string;
  code: string;
  description?: string;
  serialNumber?: string;
  purchaseDate?: Date | string;
  purchaseCost?: number;
  status?: AssetStatus;
  locationId?: string;
  assigneeId?: string;
  nextMaintenance?: Date | string;
}

export async function createAsset(input: CreateAssetInput) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"]);

  if (!input.name?.trim()) throw new Error("Asset name is required");
  if (!input.code?.trim()) throw new Error("Asset code is required");

  const existingCode = await db.asset.findUnique({ where: { code: input.code.trim() } });
  if (existingCode) throw new Error("Asset code already exists");

  const asset = await db.asset.create({
    data: {
      name: input.name.trim(),
      code: input.code.trim().toUpperCase(),
      description: input.description,
      serialNumber: input.serialNumber,
      purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : null,
      purchaseCost: input.purchaseCost ? String(input.purchaseCost) : null,
      status: input.status || "AVAILABLE",
      locationId: input.locationId || null,
      assigneeId: input.assigneeId || null,
      nextMaintenance: input.nextMaintenance ? new Date(input.nextMaintenance) : null,
    },
    include: { location: true, assignee: true },
  });

  revalidatePath("/assets");
  return asset;
}

export async function updateAsset(id: string, input: Partial<CreateAssetInput>) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"]);

  if (input.code) {
    const existingCode = await db.asset.findFirst({
      where: { code: input.code.trim(), NOT: { id } },
    });
    if (existingCode) throw new Error("Asset code already exists");
  }

  const asset = await db.asset.update({
    where: { id },
    data: {
      name: input.name?.trim(),
      code: input.code?.trim().toUpperCase(),
      description: input.description,
      serialNumber: input.serialNumber,
      purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : undefined,
      purchaseCost: input.purchaseCost != null ? String(input.purchaseCost) : undefined,
      status: input.status,
      locationId: input.locationId,
      assigneeId: input.assigneeId,
      nextMaintenance: input.nextMaintenance ? new Date(input.nextMaintenance) : undefined,
    },
    include: { location: true, assignee: true },
  });

  revalidatePath("/assets");
  revalidatePath(`/assets/${id}`);
  return asset;
}

export async function deleteAsset(id: string) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"]);

  await db.asset.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/assets");
  return { success: true };
}

export async function getAssetById(id: string) {
  await requireAuth();
  return db.asset.findUnique({
    where: { id },
    include: {
      location: true,
      assignee: true,
      maintenanceLogs: { orderBy: { date: "desc" } },
    },
  });
}