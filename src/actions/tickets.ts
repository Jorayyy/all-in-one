"use server";

import { db } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateTicketNumber } from "@/lib/utils";
import { TicketStatus, TicketPriority, TicketCategory } from "@prisma/client";

interface CreateTicketInput {
  title: string;
  description?: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  customerId: string;
  assigneeId?: string;
  dueDate?: Date | string;
}

export async function createTicket(input: CreateTicketInput) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"]);

  if (!input.title?.trim()) throw new Error("Title is required");
  if (!input.customerId) throw new Error("Customer is required");

  const sessionEmployee = await db.employee.findUnique({
    where: { userId: session.user.id },
  });

  if (!sessionEmployee) throw new Error("Your account is not linked to an employee record");

  const ticket = await db.serviceTicket.create({
    data: {
      number: generateTicketNumber(),
      title: input.title.trim(),
      description: input.description,
      category: input.category || "OTHER",
      priority: input.priority || "MEDIUM",
      customerId: input.customerId,
      creatorId: sessionEmployee.id,
      assigneeId: input.assigneeId || null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      status: "OPEN",
    },
    include: { customer: true, assignee: true, creator: true },
  });

  revalidatePath("/tickets");
  return ticket;
}

export async function updateTicket(id: string, input: Partial<CreateTicketInput>) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"]);

  const ticket = await db.serviceTicket.update({
    where: { id },
    data: {
      title: input.title?.trim(),
      description: input.description,
      category: input.category,
      priority: input.priority,
      customerId: input.customerId,
      assigneeId: input.assigneeId,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    },
    include: { customer: true, assignee: true },
  });

  revalidatePath("/tickets");
  revalidatePath(`/tickets/${id}`);
  return ticket;
}

export async function updateTicketStatus(id: string, status: TicketStatus) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"]);

  const updateData: any = { status };
  if (status === "RESOLVED") updateData.resolvedAt = new Date();
  if (status === "CLOSED") updateData.closedAt = new Date();

  const ticket = await db.serviceTicket.update({
    where: { id },
    data: updateData,
    include: { customer: true, assignee: true },
  });

  revalidatePath("/tickets");
  revalidatePath(`/tickets/${id}`);
  return ticket;
}

export async function deleteTicket(id: string) {
  const session = await requireAuth();
  await requireRole(["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"]);

  await db.serviceTicket.delete({ where: { id } });

  revalidatePath("/tickets");
  return { success: true };
}

export async function getTicketById(id: string) {
  await requireAuth();
  return db.serviceTicket.findUnique({
    where: { id },
    include: {
      customer: true,
      creator: true,
      assignee: true,
      project: true,
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: true },
      },
    },
  });
}

export async function addTicketComment(ticketId: string, content: string) {
  const session = await requireAuth();
  const employee = await db.employee.findUnique({ where: { userId: session.user.id } });
  if (!employee) throw new Error("Employee record not found");

  const comment = await db.ticketComment.create({
    data: { ticketId, authorId: employee.id, content },
    include: {
      author: true,
    },
  });

  revalidatePath(`/tickets/${ticketId}`);
  return comment;
}

export async function getTicketsForSelect() {
  await requireAuth();
  return db.serviceTicket.findMany({
    select: { id: true, number: true, title: true, status: true, priority: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}