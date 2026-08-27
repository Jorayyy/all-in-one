import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

export async function generateEmployeeNumber(): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2);
  const count = await prisma.employee.count();
  const next = String(count + 1).padStart(4, "0");
  return `EMP${year}${next}`;
}

export function generateTicketNumber(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TK${year}${random}`;
}

export function generateProjectCode(name: string): string {
  const prefix = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${random}`;
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV${year}${month}${random}`;
}

export function generateQuotationNumber(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `QTE${year}${random}`;
}

export function formatDateForInput(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

export function formatDateTimeForInput(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().slice(0, 16);
}