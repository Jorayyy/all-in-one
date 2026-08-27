import { db } from "./db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";

const SESSION_COOKIE = "prime_session";
const SESSION_TTL = 12 * 60 * 60 * 1000; // 12 hours

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "HR" | "PAYROLL" | "MANAGER" | "EMPLOYEE";

export const HR_ROLES: UserRole[] = ["ADMIN", "HR", "SUPER_ADMIN"];
export const PAYROLL_ROLES: UserRole[] = ["PAYROLL", "ADMIN", "SUPER_ADMIN"];
export const MANAGEMENT_ROLES: UserRole[] = ["MANAGER", "ADMIN", "SUPER_ADMIN"];
export const SYSTEM_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN"];

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL);

  await db.session.create({
    data: {
      token: tokenHash,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL / 1000,
    path: "/",
  });

  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await db.session.findUnique({
    where: { token: tokenHash },
    include: {
      user: {
        include: {
          employee: {
            include: {
              department: true,
              location: true,
            },
          },
        },
      },
    },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } });
    return null;
  }

  return session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(roles: UserRole[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role)) {
    redirect("/unauthorized");
  }
  return session;
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    const tokenHash = hashToken(token);
    await db.session.deleteMany({ where: { token: tokenHash } });
  }

  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}

export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

export function isHR(role: UserRole): boolean {
  return HR_ROLES.includes(role);
}

export function isPayroll(role: UserRole): boolean {
  return PAYROLL_ROLES.includes(role);
}

export function isManagement(role: UserRole): boolean {
  return MANAGEMENT_ROLES.includes(role);
}

export function isSystem(role: UserRole): boolean {
  return SYSTEM_ROLES.includes(role);
}
