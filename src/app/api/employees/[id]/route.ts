import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const employee = await db.employee.findUnique({
      where: { id },
      include: {
        department: true,
        user: { select: { id: true, email: true, role: true } },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ employee });
  } catch (error) {
    console.error("Fetch employee error:", error);
    return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const {
      firstName,
      lastName,
      middleName,
      email,
      phone,
      gender,
      birthDate,
      hireDate,
      departmentId,
      position,
      salary,
      sssNumber,
      philhealthNumber,
      pagibigNumber,
      tinNumber,
      address,
      status,
    } = body;

    const existing = await db.employee.findUnique({ where: { id }, include: { user: true } });
    if (!existing) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const employee = await db.employee.update({
      where: { id },
      data: {
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        middleName: middleName ?? null,
        email: email ?? null,
        phone: phone ?? null,
        gender: gender ?? undefined,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        hireDate: hireDate ? new Date(hireDate) : undefined,
        departmentId: departmentId ?? undefined,
        position: position ?? null,
        salary: salary != null && salary !== "" ? String(salary) : null,
        sssNumber: sssNumber ?? null,
        philhealthNumber: philhealthNumber ?? null,
        pagibigNumber: pagibigNumber ?? null,
        tinNumber: tinNumber ?? null,
        address: address ?? null,
        status: status ?? undefined,
      },
      include: {
        department: true,
        user: { select: { id: true, email: true, role: true } },
      },
    });

    if (email && existing.userId && email !== existing.user?.email) {
      await db.user.update({
        where: { id: existing.userId },
        data: { email },
      });
    }

    return NextResponse.json({ employee });
  } catch (error) {
    console.error("Update employee error:", error);
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const employee = await db.employee.findUnique({ where: { id }, include: { user: true } });
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete employee error:", error);
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}
