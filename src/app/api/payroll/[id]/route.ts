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

    const payPeriod = await db.payPeriod.findUnique({
      where: { id },
      include: {
        records: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                employeeNumber: true,
                position: true,
                department: { select: { name: true } },
                                salary: true,
              },
            },
          },
          orderBy: { employee: { firstName: "asc" } },
        },
      },
    });

    if (!payPeriod) {
      return NextResponse.json({ error: "Pay period not found" }, { status: 404 });
    }

    return NextResponse.json({ payPeriod, period: payPeriod });
  } catch (error) {
    console.error("Fetch payroll period error:", error);
    return NextResponse.json({ error: "Failed to fetch payroll period" }, { status: 500 });
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
    const { startDate, endDate } = body;

    const existing = await db.payPeriod.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Pay period not found" }, { status: 404 });
    }
    if (existing.isClosed) {
      return NextResponse.json({ error: "Cannot edit closed pay period" }, { status: 400 });
    }

    const payPeriod = await db.payPeriod.update({
      where: { id },
      data: {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: { records: { include: { employee: true } } },
    });

    return NextResponse.json({ payPeriod });
  } catch (error) {
    console.error("Update payroll period error:", error);
    return NextResponse.json({ error: "Failed to update payroll period" }, { status: 500 });
  }
}
