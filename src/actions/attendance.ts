"use server";

import { db } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { AttendanceStatus } from "@prisma/client";

interface ClockInOutInput {
  employeeId?: string;
  locationId?: string;
  ipAddress?: string;
}

export async function clockIn(input: ClockInOutInput = {}) {
  const session = await requireAuth();
  const employee = input.employeeId
    ? await db.employee.findUnique({ where: { id: input.employeeId } })
    : await db.employee.findUnique({ where: { userId: session.user.id } });

  if (!employee) throw new Error("Employee not found");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let attendance = await db.attendance.findUnique({
    where: { employeeId_date: { employeeId: employee.id, date: today } },
  });

  if (attendance?.clockIn) throw new Error("Already clocked in today");

  const now = new Date();
  const shift = await db.schedule.findUnique({
    where: { employeeId_date: { employeeId: employee.id, date: today } },
    include: { shift: true },
  });

  let status: AttendanceStatus = "PRESENT";
  if (shift?.shift) {
    const shiftStart = new Date(today);
    const [h, m] = shift.shift.startTime.split(":").map(Number);
    shiftStart.setHours(h, m, 0, 0);
    if (now > shiftStart) status = "LATE";
  }

  if (attendance) {
    attendance = await db.attendance.update({
      where: { id: attendance.id },
      data: { clockIn: now, status, locationId: input.locationId, ipAddress: input.ipAddress },
    });
  } else {
    attendance = await db.attendance.create({
      data: { employeeId: employee.id, date: today, clockIn: now, status, locationId: input.locationId, ipAddress: input.ipAddress },
    });
  }

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
  return attendance;
}

export async function clockOut(input: ClockInOutInput = {}) {
  const session = await requireAuth();
  const employee = input.employeeId
    ? await db.employee.findUnique({ where: { id: input.employeeId } })
    : await db.employee.findUnique({ where: { userId: session.user.id } });

  if (!employee) throw new Error("Employee not found");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await db.attendance.findUnique({
    where: { employeeId_date: { employeeId: employee.id, date: today } },
  });

  if (!attendance) throw new Error("Not clocked in today");
  if (attendance.clockOut) throw new Error("Already clocked out today");

  const updated = await db.attendance.update({
    where: { id: attendance.id },
    data: { clockOut: new Date(), locationId: input.locationId, ipAddress: input.ipAddress },
  });

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
  return updated;
}

export async function getTodayAttendance() {
  const session = await requireAuth();
  const employee = await db.employee.findUnique({ where: { userId: session.user.id } });
  if (!employee) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return db.attendance.findUnique({
    where: { employeeId_date: { employeeId: employee.id, date: today } },
  });
}