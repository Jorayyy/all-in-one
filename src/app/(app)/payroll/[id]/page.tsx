"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Check, Money, Calculator } from "@/components/icons";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import toast from "react-hot-toast";

interface PayrollRecord {
  id: string;
  employeeId: string;
  employee: { id: string; firstName: string; lastName: string; employeeNumber: string };
  basicPay: number | string;
  allowances: number | string;
  overtime: number | string;
  deductions: number | string;
  sssDeduction: number | string;
  philhealthDeduction: number | string;
  pagibigDeduction: number | string;
  taxDeduction: number | string;
  netPay: number | string;
  isPaid: boolean;
}

interface PayPeriod {
  id: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  closedAt?: string | null;
  records: PayrollRecord[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);
}

function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-PH", { year: "numeric", month: "long", day: "numeric" }).format(d);
}

export default function PayPeriodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PayPeriod | null>(null);
  const [actionLoading, setActionLoading] = useState<"run" | "close" | null>(null);

  const fetchPeriod = async () => {
    try {
      // Try pay-periods first, then payroll fallback
      let res = await fetch(`/api/pay-periods/${id}`);
      if (!res.ok) {
        res = await fetch(`/api/payroll/${id}`);
      }
      if (!res.ok) throw new Error("Failed to fetch pay period");
      const data = await res.json();
      const p = data.payPeriod || data.period || data;
      setPeriod(p);
    } catch (error: any) {
      toast.error(error.message || "Failed to load pay period");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPeriod();
  }, [id]);

  const handleRun = async () => {
    setActionLoading("run");
    try {
      const res = await fetch(`/api/pay-periods/${id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to run payroll");
      }
      toast.success("Payroll run completed");
      await fetchPeriod();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const handleClose = async () => {
    setActionLoading("close");
    try {
      const res = await fetch(`/api/pay-periods/${id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to close period");
      }
      toast.success("Pay period closed");
      await fetchPeriod();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-16 animate-pulse rounded-md bg-secondary" />
          <div className="space-y-2">
            <div className="h-6 w-48 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="h-32 animate-pulse rounded bg-secondary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!period) {
    return (
      <div className="space-y-6">
        <Link href="/payroll">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-sm text-muted-foreground">Pay period not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalNet = period.records.reduce((sum, r) => sum + Number(r.netPay), 0);
  const totalBasic = period.records.reduce((sum, r) => sum + Number(r.basicPay), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/payroll">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">
                {formatDate(period.startDate)} - {formatDate(period.endDate)}
              </h1>
              <Badge variant={period.isClosed ? "success" : "warning"}>{period.isClosed ? "Closed" : "Open"}</Badge>
            </div>
            <p className="text-muted-foreground text-sm">{period.records.length} employees • Total {formatCurrency(totalNet)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/payroll/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-1.5" /> Edit
            </Button>
          </Link>
          <Button size="sm" variant="outline" onClick={handleRun} disabled={period.isClosed || actionLoading === "run"}>
            <Calculator className="h-4 w-4 mr-1.5" />
            {actionLoading === "run" ? "Running..." : "Run Payroll"}
          </Button>
          <Button size="sm" variant={period.isClosed ? "secondary" : "default"} onClick={handleClose} disabled={period.isClosed || actionLoading === "close"}>
            <Check className="h-4 w-4 mr-1.5" />
            {actionLoading === "close" ? "Closing..." : period.isClosed ? "Closed" : "Close Period"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-secondary p-2">
                <Money className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Basic</p>
                <p className="text-lg font-semibold">{formatCurrency(totalBasic)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-success/10 p-2 text-success">
                <Money className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Net Pay</p>
                <p className="text-lg font-semibold">{formatCurrency(totalNet)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground">Period</p>
              <p className="text-sm font-medium">
                {formatDate(period.startDate)} - {formatDate(period.endDate)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{period.isClosed ? `Closed ${period.closedAt ? formatDate(period.closedAt) : ""}` : "Open for processing"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
        </CardHeader>
        <CardContent>
          {period.records.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">No records yet. Run payroll to generate records.</p>
              <Button size="sm" onClick={handleRun} disabled={period.isClosed || actionLoading === "run"}>
                <Calculator className="h-4 w-4 mr-1.5" /> Run Payroll
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 font-medium text-muted-foreground">Employee</th>
                    <th className="pb-2 font-medium text-muted-foreground">Basic</th>
                    <th className="pb-2 font-medium text-muted-foreground">Allowances</th>
                    <th className="pb-2 font-medium text-muted-foreground">Overtime</th>
                    <th className="pb-2 font-medium text-muted-foreground">Deductions</th>
                    <th className="pb-2 font-medium text-muted-foreground">Net Pay</th>
                    <th className="pb-2 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {period.records.map((record) => {
                    const deductions =
                      Number(record.sssDeduction || 0) +
                      Number(record.philhealthDeduction || 0) +
                      Number(record.pagibigDeduction || 0) +
                      Number(record.taxDeduction || 0) +
                      Number(record.deductions || 0);
                    return (
                      <tr key={record.id} className="border-b border-border/50">
                        <td className="py-3">
                          <p className="font-medium">
                            {record.employee.firstName} {record.employee.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{record.employee.employeeNumber}</p>
                        </td>
                        <td className="py-3">{formatCurrency(Number(record.basicPay))}</td>
                        <td className="py-3">{formatCurrency(Number(record.allowances || 0))}</td>
                        <td className="py-3">{formatCurrency(Number(record.overtime || 0))}</td>
                        <td className="py-3">{formatCurrency(deductions)}</td>
                        <td className="py-3 font-medium">{formatCurrency(Number(record.netPay))}</td>
                        <td className="py-3">
                          <Badge variant={record.isPaid ? "success" : "warning"}>{record.isPaid ? "Paid" : "Pending"}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
