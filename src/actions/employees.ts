"use server";

import { db } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { hashPassword, generateEmployeeNumber } from "@/lib/utils";
import { Role, EmploymentStatus, Gender, MaritalStatus } from "@prisma/client";

interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  gender: Gender;
  birthDate: Date | string;
  hireDate: Date | string;
  departmentId: string;
  position?: string;
  salary?: number;
  sssNumber?: string;
  philhealthNumber?: string;
  pagibigNumber?: string;
  tinNumber?: string;
  address?: string;
  status?: EmploymentStatus;
}

export async function createEmployee(input: CreateEmployeeInput) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR"]);

  const existingEmail = await db.user.findUnique({ where: { email: input.email } });
  if (existingEmail) throw new Error("Email already in use");

  const tempPassword = Math.random().toString(36).slice(-10);
  const hashedPassword = await hashPassword(tempPassword);

  const employeeNumber = await generateEmployeeNumber();

  const user = await db.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      role: "EMPLOYEE",
    },
  });

  const employee = await db.employee.create({
    data: {
      employeeNumber,
      firstName: input.firstName,
      lastName: input.lastName,
      middleName: input.middleName,
      email: input.email,
      phone: input.phone,
      gender: input.gender,
      birthDate: new Date(input.birthDate),
      hireDate: new Date(input.hireDate),
      departmentId: input.departmentId,
      position: input.position,
      salary: input.salary ? String(input.salary) : null,
      sssNumber: input.sssNumber,
      philhealthNumber: input.philhealthNumber,
      pagibigNumber: input.pagibigNumber,
      tinNumber: input.tinNumber,
      address: input.address,
      status: input.status || "PROBATIONARY",
      userId: user.id,
    },
    include: { department: true, location: true },
  });

  revalidatePath("/employees");
  return { employee, tempPassword };
}

export async function updateEmployee(id: string, input: Partial<CreateEmployeeInput>) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR"]);

  const employee = await db.employee.update({
    where: { id },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      middleName: input.middleName,
      email: input.email,
      phone: input.phone,
      gender: input.gender,
      birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
      hireDate: input.hireDate ? new Date(input.hireDate) : undefined,
      departmentId: input.departmentId,
      position: input.position,
      salary: input.salary ? String(input.salary) : undefined,
      sssNumber: input.sssNumber,
      philhealthNumber: input.philhealthNumber,
      pagibigNumber: input.pagibigNumber,
      tinNumber: input.tinNumber,
      address: input.address,
      status: input.status,
    },
    include: { department: true, location: true, user: true },
  });

  if (input.email && employee.userId && input.email !== employee.user?.email) {
    await db.user.update({
      where: { id: employee.userId },
      data: { email: input.email },
    });
  }

  revalidatePath("/employees");
  revalidatePath(`/employees/${id}`);
  return employee;
}

export async function deleteEmployee(id: string) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR"]);

  const employee = await db.employee.findUnique({ where: { id }, include: { user: true } });
  if (!employee) throw new Error("Employee not found");

  await db.employee.update({
    where: { id },
    data: { deletedAt: new Date(), status: "RESIGNED" },
  });

  if (employee.userId) {
    await db.user.update({
      where: { id: employee.userId },
      data: { isActive: false },
    });
  }

  revalidatePath("/employees");
  return { success: true };
}

export async function getEmployeeById(id: string) {
  await requireAuth();
  return db.employee.findUnique({
    where: { id },
    include: {
      department: true,
      location: true,
      user: true,
      attendance: { take: 10, orderBy: { date: "desc" } },
      leaves: { take: 10, orderBy: { createdAt: "desc" } },
      schedules: { take: 10, orderBy: { date: "desc" }, include: { shift: true } },
      payrollRecords: { take: 10, orderBy: { createdAt: "desc" } },
      projects: { include: { project: true } },
      tasks: { take: 10, orderBy: { createdAt: "desc" } },
      assignedTickets: { take: 10, orderBy: { createdAt: "desc" } },
      assets: true,
    },
  });
}

export async function getDepartmentsForSelect() {
  await requireAuth();
  return db.department.findMany({
    select: { id: true, name: true, code: true },
    orderBy: { name: "asc" },
  });
}

export async function getEmployeesForSelect() {
  await requireAuth();
  return db.employee.findMany({
    where: { deletedAt: null, status: { not: "RESIGNED" } },
    select: { id: true, firstName: true, lastName: true, employeeNumber: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
}