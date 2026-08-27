import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await requireAuth();

    const body = await request.json();
    const { name, code, description, customerId, startDate, endDate, budget, address, status } = body;

    if (!name || !code || !customerId) {
      return NextResponse.json(
        { error: "Missing required fields: name, code, customerId" },
        { status: 400 }
      );
    }

    const project = await db.project.create({
      data: {
        name,
        code,
        description: description || null,
        customerId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget: budget || null,
        address: address || null,
        status: status || "PLANNING",
      },
      include: {
        customer: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
