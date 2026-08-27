"use server";

import { db } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateProjectCode } from "@/lib/utils";
import { ProjectStatus } from "@prisma/client";

interface CreateProjectInput {
  name: string;
  code?: string;
  description?: string;
  customerId: string;
  startDate?: Date | string;
  endDate?: Date | string;
  budget?: number;
  address?: string;
  status?: ProjectStatus;
}

export async function createProject(input: CreateProjectInput) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"]);

  if (!input.name?.trim()) throw new Error("Project name is required");
  if (!input.customerId) throw new Error("Customer is required");

  const code = input.code?.trim() || generateProjectCode(input.name);

  const existingCode = await db.project.findUnique({ where: { code } });
  if (existingCode) throw new Error("Project code already exists");

  const project = await db.project.create({
    data: {
      name: input.name.trim(),
      code: code.toUpperCase(),
      description: input.description,
      customerId: input.customerId,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
      budget: input.budget ? String(input.budget) : null,
      address: input.address,
      status: input.status || "PLANNING",
    },
    include: { customer: true },
  });

  revalidatePath("/projects");
  return project;
}

export async function updateProject(id: string, input: Partial<CreateProjectInput>) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"]);

  const project = await db.project.update({
    where: { id },
    data: {
      name: input.name?.trim(),
      description: input.description,
      customerId: input.customerId,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      budget: input.budget ? String(input.budget) : undefined,
      address: input.address,
      status: input.status,
    },
    include: { customer: true },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return project;
}

export async function updateProjectStatus(id: string, status: ProjectStatus) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"]);

  const project = await db.project.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return project;
}

export async function deleteProject(id: string) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"]);

  await db.project.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/projects");
  return { success: true };
}

export async function getProjectById(id: string) {
  await requireAuth();
  return db.project.findUnique({
    where: { id },
    include: {
      customer: true,
      employees: { include: { employee: true } },
      tasks: { orderBy: { createdAt: "desc" } },
      invoices: { orderBy: { createdAt: "desc" } },
      timeEntries: { orderBy: { date: "desc" }, take: 20 },
    },
  });
}

export async function getProjectsForSelect() {
  await requireAuth();
  return db.project.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, code: true, status: true },
    orderBy: { name: "asc" },
  });
}