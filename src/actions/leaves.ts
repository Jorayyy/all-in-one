"use server";

import { db } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { LeaveType, LeaveStatus } from "@prisma/client";

interface CreateLeaveInput {
  employeeId: string;
  type: LeaveType;
  startDate: Date | string;
  endDate: Date | string;
  days: number;
  reason: string;
}

export async function createLeave(input: CreateLeaveInput) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER", "EMPLOYEE"]);

  if (!input.employeeId) throw new Error("Employee is required");
  if (!input.type) throw new Error("Leave type is required");
  if (!input.startDate || !input.endDate) throw new Error("Start and end dates required");
  if (input.days <= 0) throw new Error("Days must be positive");
  if (!input.reason?.trim()) throw new Error("Reason is required");

  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);
  if (endDate < startDate) throw new Error("End date must be after start date");

  const existingLeave = await db.leave.findFirst({
    where: {
      employeeId: input.employeeId,
      status: { in: ["PENDING", "APPROVED"] },
      OR: [
        { startDate: { lte: endDate }, endDate: { gte: startDate } },
      ],
    },
  });
  if (existingLeave) throw new Error("Employee has overlapping leave request");

  const leave = await db.leave.create({
    data: {
      employeeId: input.employeeId,
      type: input.type,
      startDate,
      endDate,
      days: input.days,
      reason: input.reason.trim(),
      status: "PENDING",
    },
    include: { employee: true },
  });

  revalidatePath("/leaves");
  return leave;
}

export async function updateLeave(id: string, input: Partial<CreateLeaveInput>) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"]);

  const leave = await db.leave.update({
    where: { id },
    data: {
      employeeId: input.employeeId,
      type: input.type,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      days: input.days,
      reason: input.reason?.trim(),
    },
    include: { employee: true },
  });

  revalidatePath("/leaves");
  revalidatePath(`/leaves/${id}`);
  return leave;
}

export async function updateLeaveStatus(id: string, status: LeaveStatus, remarks?: string) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"]);

  const approver = await db.employee.findUnique({ where: { userId: session.user.id } });
  if (!approver) throw new Error("Approver not found");

  const leave = await db.leave.update({
    where: { id },
    data: {
      status,
      approvedBy: approver.id,
      approvedAt: new Date(),
      remarks,
    },
    include: { employee: { include: { user: true } } },
  });

  revalidatePath("/leaves");
  revalidatePath(`/leaves/${id}`);
  return leave;
}

export async function deleteLeave(id: string) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"]);

  await db.leave.delete({ where: { id } });

  revalidatePath("/leaves");
  return { success: true };
}

export async function getLeaveById(id: string) {
  await requireAuth();
  return db.leave.findUnique({
    where: { id },
    include: { employee: { include: { department: true, user: true } } },
  });
}