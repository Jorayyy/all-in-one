"use server";

import { db } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { calculatePayroll } from "@/lib/payroll/ph";

interface CreatePayPeriodInput {
  startDate: Date | string;
  endDate: Date | string;
}

export async function createPayPeriod(input: CreatePayPeriodInput) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "PAYROLL", "HR"]);

  if (!input.startDate || !input.endDate) throw new Error("Start and end dates required");

  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);
  if (endDate < startDate) throw new Error("End date must be after start date");

  const existing = await db.payPeriod.findUnique({
    where: { startDate_endDate: { startDate, endDate } },
  });
  if (existing) throw new Error("Pay period already exists for these dates");

  const payPeriod = await db.payPeriod.create({
    data: { startDate, endDate },
  });

  revalidatePath("/payroll");
  return payPeriod;
}

export async function runPayroll(payPeriodId: string) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "PAYROLL", "HR"]);

  const payPeriod = await db.payPeriod.findUnique({
    where: { id: payPeriodId },
    include: { records: true },
  });
  if (!payPeriod) throw new Error("Pay period not found");
  if (payPeriod.isClosed) throw new Error("Pay period already closed");

  const employees = await db.employee.findMany({
    where: { status: { not: "RESIGNED" }, deletedAt: null },
    include: { department: true },
  });

  const records = [];
  for (const emp of employees) {
    const existingRecord = await db.payrollRecord.findUnique({
      where: { employeeId_payPeriodId: { employeeId: emp.id, payPeriodId } },
    });
    if (existingRecord) continue;

    const baseSalary = emp.salary ? Number(emp.salary) : 0;
    const daysWorked = 26;

    const payroll = calculatePayroll(baseSalary, 0, 0, daysWorked, 26);

    const record = await db.payrollRecord.create({
      data: {
        employeeId: emp.id,
        payPeriodId,
        basicPay: String(payroll.basicPay),
        allowances: "0",
        overtime: "0",
        deductions: String(payroll.totalDeductions),
        sssDeduction: String(payroll.sss.employeeShare),
        philhealthDeduction: String(payroll.philhealth.employeeShare),
        pagibigDeduction: String(payroll.pagibig.employeeShare),
        taxDeduction: String(payroll.tax.monthlyTax),
        netPay: String(payroll.netPay),
      },
    });
    records.push(record);
  }

  revalidatePath("/payroll");
  return { created: records.length };
}

export async function closePayPeriod(payPeriodId: string) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "PAYROLL", "HR"]);

  const approver = await db.employee.findUnique({ where: { userId: session.user.id } });
  if (!approver) throw new Error("Approver not found");

  const payPeriod = await db.payPeriod.update({
    where: { id: payPeriodId },
    data: { isClosed: true, closedBy: approver.id, closedAt: new Date() },
  });

  revalidatePath("/payroll");
  return payPeriod;
}

export async function getPayPeriodById(id: string) {
  await requireAuth();
  return db.payPeriod.findUnique({
    where: { id },
    include: { records: { include: { employee: true } } },
  });
}