export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatDateOnly(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-PH").format(n);
}

export function formatPercentage(n: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "percent",
    minimumFractionDigits: 1,
  }).format(n / 100);
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function fullName(
  firstName: string,
  lastName: string,
  middleName?: string | null,
  suffix?: string | null
): string {
  const parts = [firstName];
  if (middleName) parts.push(`${middleName.charAt(0)}.`);
  parts.push(lastName);
  if (suffix) parts.push(suffix);
  return parts.join(" ");
}

export function generateEmployeeNumber(index: number): string {
  return `EMP${String(index).padStart(4, "0")}`;
}

export function generateCode(prefix: string, index: number): string {
  return `${prefix}${String(index).padStart(4, "0")}`;
}
