import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();

    const payPeriods = await db.payPeriod.findMany({
      include: {
        records: { include: { employee: true } },
      },
      orderBy: { startDate: "desc" },
      take: 20,
    });

    return NextResponse.json({ payPeriods });
  } catch (error) {
    console.error("Fetch pay periods error:", error);
    return NextResponse.json({ error: "Failed to fetch pay periods" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();

    const body = await request.json();
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields: startDate, endDate" },
        { status: 400 }
      );
    }

    const payPeriod = await db.payPeriod.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    return NextResponse.json({ payPeriod }, { status: 201 });
  } catch (error: any) {
    console.error("Create pay period error:", error);
    // handle unique constraint
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Pay period already exists for these dates" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create pay period" },
      { status: 500 }
    );
  }
}
