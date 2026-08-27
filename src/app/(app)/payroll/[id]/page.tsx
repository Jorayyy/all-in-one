"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Check, Money, Calculator, Eye, CalendarBlank } from "@/components/icons";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import toast from "react-hot-toast";

interface PayrollRecord {
  id: string;
  employeeId: string;
  employee: { id: string; firstName: string; lastName: string; employeeNumber: string; position?: string | null };
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
  closedBy?: string | null;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRun = async () => {
    if (period?.isClosed) {
      toast.error("Pay period is closed");
      return;
    }
    if (period && period.records.length > 0) {
      toast.error("Payroll already has records");
      return;
    }
    setActionLoading("run");
    try {
      let res = await fetch(`/api/pay-periods/${id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      // fallback to payroll alias
      if (!res.ok && res.status === 404) {
        res = await fetch(`/api/payroll/${id}/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to run payroll");
      }
      const data = await res.json().catch(() => ({}));
      toast.success(data.created != null ? `Payroll run completed (${data.created} records)` : "Payroll run completed");
      await fetchPeriod();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const handleClose = async () => {
    setActionLoading("close");
    try {
      let res = await fetch(`/api/pay-periods/${id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok && res.status === 404) {
        res = await fetch(`/api/payroll/${id}/close`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to close period");
      }
      toast.success("Pay period closed");
      await fetchPeriod();
      router.refresh();
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
  const totalAllowances = period.records.reduce((sum, r) => sum + Number(r.allowances || 0), 0);
  const totalOvertime = period.records.reduce((sum, r) => sum + Number(r.overtime || 0), 0);
  const totalDeductions = period.records.reduce(
    (sum, r) =>
      sum +
      Number(r.sssDeduction || 0) +
      Number(r.philhealthDeduction || 0) +
      Number(r.pagibigDeduction || 0) +
      Number(r.taxDeduction || 0),
    0
  );
  const totalEmployees = period.records.length;
  const hasRecords = totalEmployees > 0;
  const runDisabled = period.isClosed || hasRecords || actionLoading === "run";
  const closeDisabled = period.isClosed || actionLoading === "close";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/payroll">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">
                {formatDate(period.startDate)} - {formatDate(period.endDate)}
              </h1>
              <Badge variant={period.isClosed ? "success" : "warning"}>{period.isClosed ? "Closed" : "Open"}</Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {totalEmployees} {totalEmployees === 1 ? "employee" : "employees"} • Total {formatCurrency(totalNet)}
              {period.isClosed && period.closedAt ? ` • Closed ${formatDate(period.closedAt)}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/payroll/${id}/edit`}>
            <Button variant="outline" size="sm" disabled={period.isClosed}>
              <Pencil className="h-4 w-4 mr-1.5" /> Edit
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRun}
            disabled={runDisabled}
            title={
              period.isClosed
                ? "Period is closed"
                : hasRecords
                  ? "Payroll already generated"
                  : "Compute Payroll — SSS/PhilHealth/Pag-IBIG/BIR"
            }
          >
            <Calculator className="h-4 w-4 mr-1.5" />
            {actionLoading === "run" ? "Computing..." : "Compute Payroll (SSS/PhilHealth/Pag-IBIG/BIR)"}
          </Button>
          <Button
            size="sm"
            variant={period.isClosed ? "secondary" : "default"}
            onClick={handleClose}
            disabled={closeDisabled}
          >
            <Check className="h-4 w-4 mr-1.5" />
            {actionLoading === "close" ? "Closing..." : period.isClosed ? "Closed" : "Close Period"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-secondary p-2">
                <CalendarBlank className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Employees</p>
                <p className="text-lg font-semibold">{totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
              <p className="text-xs text-muted-foreground mt-1">
                {period.isClosed ? `Closed ${period.closedAt ? formatDate(period.closedAt) : ""}` : "Open for processing"}
              </p>
              {hasRecords && (
                <p className="text-xs text-muted-foreground">Gross: {formatCurrency(totalBasic + totalAllowances + totalOvertime)} • Deductions: {formatCurrency(totalDeductions)}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payroll Records</CardTitle>
            <span className="text-xs text-muted-foreground">{totalEmployees} records</span>
          </div>
        </CardHeader>
        <CardContent>
           {period.records.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">No records yet. Compute payroll to generate records with SSS/PhilHealth/Pag-IBIG/BIR deductions.</p>
              <Button size="sm" onClick={handleRun} disabled={period.isClosed || actionLoading === "run"}>
                <Calculator className="h-4 w-4 mr-1.5" /> Compute Payroll (SSS/PhilHealth/Pag-IBIG/BIR)
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 font-medium text-muted-foreground">Employee</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">Basic</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">Allowances</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">Overtime</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">SSS</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">PhilHealth</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">Pag-IBIG</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">Tax</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">Net Pay</th>
                    <th className="pb-2 font-medium text-muted-foreground">Status</th>
                    <th className="pb-2 font-medium text-muted-foreground">Payslip</th>
                  </tr>
                </thead>
                <tbody>
                  {period.records.map((record) => (
                    <tr key={record.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3">
                        <Link href={`/payroll/${id}/payslip/${record.employeeId}`} className="hover:underline">
                          <p className="font-medium">
                            {record.employee.firstName} {record.employee.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{record.employee.employeeNumber}</p>
                        </Link>
                      </td>
                      <td className="py-3 text-right">{formatCurrency(Number(record.basicPay))}</td>
                      <td className="py-3 text-right">{formatCurrency(Number(record.allowances || 0))}</td>
                      <td className="py-3 text-right">{formatCurrency(Number(record.overtime || 0))}</td>
                      <td className="py-3 text-right">{formatCurrency(Number(record.sssDeduction || 0))}</td>
                      <td className="py-3 text-right">{formatCurrency(Number(record.philhealthDeduction || 0))}</td>
                      <td className="py-3 text-right">{formatCurrency(Number(record.pagibigDeduction || 0))}</td>
                      <td className="py-3 text-right">{formatCurrency(Number(record.taxDeduction || 0))}</td>
                      <td className="py-3 text-right font-medium">{formatCurrency(Number(record.netPay))}</td>
                      <td className="py-3">
                        <Badge variant={record.isPaid ? "success" : "warning"}>{record.isPaid ? "Paid" : "Pending"}</Badge>
                      </td>
                      <td className="py-3">
                        <Link href={`/payroll/${id}/payslip/${record.employeeId}`}>
                          <Button variant="ghost" size="sm" className="h-7 px-2">
                            <Eye className="h-3.5 w-3.5 mr-1" /> View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {period.records.length > 0 && (
                  <tfoot>
                    <tr className="border-t border-border font-semibold bg-muted/20">
                      <td className="py-2">Total ({totalEmployees})</td>
                      <td className="py-2 text-right">{formatCurrency(totalBasic)}</td>
                      <td className="py-2 text-right">{formatCurrency(totalAllowances)}</td>
                      <td className="py-2 text-right">{formatCurrency(totalOvertime)}</td>
                      <td className="py-2 text-right" colSpan={4}>
                        {formatCurrency(totalDeductions)}
                      </td>
                      <td className="py-2 text-right">{formatCurrency(totalNet)}</td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
