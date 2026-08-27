import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, hashPassword } from "@/lib/auth";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
  try {
    await requireAuth();

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

    if (!firstName || !lastName || !gender || !birthDate || !hireDate || !departmentId) {
      return NextResponse.json(
        { error: "Missing required fields: firstName, lastName, gender, birthDate, hireDate, departmentId" },
        { status: 400 }
      );
    }

    const employeeNumber = `EMP-${Math.floor(100000 + Math.random() * 900000)}`;
    const tempPassword = randomBytes(8).toString("hex");
    const hashedPassword = await hashPassword(tempPassword);

    const user = await db.user.create({
      data: {
        email: email || `${employeeNumber.toLowerCase()}@prime.local`,
        password: hashedPassword,
        role: "EMPLOYEE",
      },
    });

    const employee = await db.employee.create({
      data: {
        employeeNumber,
        firstName,
        lastName,
        middleName: middleName || null,
        email: email || null,
        phone: phone || null,
        gender,
        birthDate: new Date(birthDate),
        hireDate: new Date(hireDate),
        departmentId,
        position: position || null,
        salary: salary || null,
        sssNumber: sssNumber || null,
        philhealthNumber: philhealthNumber || null,
        pagibigNumber: pagibigNumber || null,
        tinNumber: tinNumber || null,
        address: address || null,
        status: status || "PROBATIONARY",
        userId: user.id,
      },
      include: {
        department: true,
        user: { select: { id: true, email: true, role: true } },
      },
    });

    return NextResponse.json({ employee, tempPassword }, { status: 201 });
  } catch (error) {
    console.error("Create employee error:", error);
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}
