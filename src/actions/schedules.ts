"use server";

import { db } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface CreateScheduleInput {
  employeeId: string;
  shiftId: string;
  date: Date | string;
  isRestDay?: boolean;
}

export async function createSchedule(input: CreateScheduleInput) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"]);

  if (!input.employeeId) throw new Error("Employee is required");
  if (!input.shiftId) throw new Error("Shift is required");
  if (!input.date) throw new Error("Date is required");

  const existingSchedule = await db.schedule.findUnique({
    where: { employeeId_date: { employeeId: input.employeeId, date: new Date(input.date) } },
  });
  if (existingSchedule) throw new Error("Employee already has a schedule for this date");

  const schedule = await db.schedule.create({
    data: {
      employeeId: input.employeeId,
      shiftId: input.shiftId,
      date: new Date(input.date),
      isRestDay: input.isRestDay || false,
    },
    include: { employee: true, shift: true },
  });

  revalidatePath("/schedules");
  return schedule;
}

export async function bulkCreateSchedules(inputs: CreateScheduleInput[]) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"]);

  const results = await Promise.all(
    inputs.map((input) =>
      db.schedule.upsert({
        where: { employeeId_date: { employeeId: input.employeeId, date: new Date(input.date) } },
        create: { ...input, date: new Date(input.date) },
        update: { shiftId: input.shiftId, isRestDay: input.isRestDay || false },
        include: { employee: true, shift: true },
      })
    )
  );

  revalidatePath("/schedules");
  return results;
}

export async function updateSchedule(id: string, input: Partial<CreateScheduleInput>) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"]);

  const schedule = await db.schedule.update({
    where: { id },
    data: {
      employeeId: input.employeeId,
      shiftId: input.shiftId,
      date: input.date ? new Date(input.date) : undefined,
      isRestDay: input.isRestDay,
    },
    include: { employee: true, shift: true },
  });

  revalidatePath("/schedules");
  return schedule;
}

export async function deleteSchedule(id: string) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"]);

  await db.schedule.delete({ where: { id } });

  revalidatePath("/schedules");
  return { success: true };
}

export async function getShiftsForSelect() {
  await requireAuth();
  return db.shift.findMany({
    orderBy: { startTime: "asc" },
    select: { id: true, name: true, startTime: true, endTime: true, isNight: true },
  });
}