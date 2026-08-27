"use client";

import { Button } from "@/components/ui";
import { Download } from "@/components/icons";

interface ExportCsvButtonProps {
  data: Record<string, any>[];
  filename: string;
  label?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

function toCsvValue(value: any): string {
  if (value === null || value === undefined) return "";
  let str = String(value);
  // Escape quotes, commas, newlines
  if (str.includes('"') || str.includes(",") || str.includes("\n")) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

export function ExportCsvButton({
  data,
  filename,
  label = "Export CSV",
  variant = "outline",
  size = "sm",
  className,
}: ExportCsvButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      // still download header-only or empty
      const blob = new Blob([""], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.map(toCsvValue).join(","),
      ...data.map((row) => headers.map((h) => toCsvValue(row[h])).join(",")),
    ];
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant={variant as any} size={size as any} onClick={handleExport} className={className}>
      <Download className="mr-1.5 h-4 w-4" />
      {label}
    </Button>
  );
}

export default ExportCsvButton;
