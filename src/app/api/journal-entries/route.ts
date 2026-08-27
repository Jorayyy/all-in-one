import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();
    const entries = await db.journalEntry.findMany({
      include: { accounts: { include: { account: true } } },
      orderBy: { date: "desc" },
      take: 50,
    });
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Fetch journal entries error:", error);
    return NextResponse.json({ error: "Failed to fetch journal entries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();

    const body = await request.json();
    const { date, description, reference, lines } = body;

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    if (!lines || !Array.isArray(lines) || lines.length < 2) {
      return NextResponse.json({ error: "At least 2 lines are required" }, { status: 400 });
    }

    for (const line of lines) {
      if (!line.accountId) {
        return NextResponse.json({ error: "Each line must have an account" }, { status: 400 });
      }
    }

    const totalDebit = lines.reduce((sum: number, l: any) => sum + Number(l.debit || 0), 0);
    const totalCredit = lines.reduce((sum: number, l: any) => sum + Number(l.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json(
        { error: `Debits (${totalDebit.toFixed(2)}) must equal credits (${totalCredit.toFixed(2)})` },
        { status: 400 }
      );
    }

    const entry = await db.journalEntry.create({
      data: {
        date: date ? new Date(date) : new Date(),
        description,
        reference: reference || null,
        accounts: {
          create: lines.map((line: any) => ({
            accountId: line.accountId,
            debit: Number(line.debit || 0),
            credit: Number(line.credit || 0),
          })),
        },
      },
      include: { accounts: { include: { account: true } } },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("Create journal entry error:", error);
    return NextResponse.json({ error: "Failed to create journal entry" }, { status: 500 });
  }
}
