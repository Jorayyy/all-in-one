import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const users = await db.user.findMany({
      select: { id: true, email: true, role: true, isActive: true, createdAt: true, employee: { select: { firstName: true, lastName: true, employeeNumber: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Fetch users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const { userId, role, isActive } = body;
    if (!userId || !role) return NextResponse.json({ error: "userId and role required" }, { status: 400 });
    const user = await db.user.update({
      where: { id: userId },
      data: {
        role: role as any,
        ...(typeof isActive === "boolean" ? { isActive } : {}),
      },
    });
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
