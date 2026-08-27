import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";
import { ExportCsvButton } from "@/components/reports/export-csv-button";

function ReportFilters({ from, to }: { from?: string; to?: string }) {
  return (
    <form method="GET" className="flex flex-wrap items-end gap-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground">From</label>
        <input
          type="date"
          name="from"
          defaultValue={from || ""}
          className="mt-1 flex h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">To</label>
        <input
          type="date"
          name="to"
          defaultValue={to || ""}
          className="mt-1 flex h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <Button type="submit" size="sm" variant="outline">
        Filter
      </Button>
      {(from || to) && (
        <Link href="/reports/sales">
          <Button type="button" size="sm" variant="ghost">
            Clear
          </Button>
        </Link>
      )}
    </form>
  );
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
  PENDING: "warning",
  PARTIAL: "warning",
  PAID: "success",
  OVERDUE: "destructive",
  CANCELLED: "destructive",
  DRAFT: "secondary",
};

export default async function SalesReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string; to?: string }>;
}) {
  await requireAuth();
  const params = searchParams ? await searchParams : {};
  const from = params.from || "";
  const to = params.to || "";

  const where: any = {};
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);
  }

  const invoices = await db.invoice.findMany({
    where,
    include: { customer: true },
    orderBy: { date: "desc" },
    take: 1000,
  });

  const statusTotals: Record<string, { count: number; total: number; paid: number }> = {};
  let totalRevenue = 0;
  let totalOutstanding = 0;
  for (const inv of invoices) {
    if (!statusTotals[inv.status]) statusTotals[inv.status] = { count: 0, total: 0, paid: 0 };
    statusTotals[inv.status].count++;
    statusTotals[inv.status].total += Number(inv.total);
    statusTotals[inv.status].paid += Number(inv.amountPaid);
    if (inv.status === "PAID") totalRevenue += Number(inv.total);
    if (inv.status === "PENDING" || inv.status === "PARTIAL" || inv.status === "OVERDUE") {
      totalOutstanding += Number(inv.total) - Number(inv.amountPaid);
    }
  }

  // Revenue by customer
  const byCustomer: Record<string, { total: number; count: number; paid: number }> = {};
  for (const inv of invoices) {
    const name = inv.customer.name;
    if (!byCustomer[name]) byCustomer[name] = { total: 0, count: 0, paid: 0 };
    byCustomer[name].total += Number(inv.total);
    byCustomer[name].paid += Number(inv.amountPaid);
    byCustomer[name].count++;
  }
  const sortedCustomers = Object.entries(byCustomer).sort((a, b) => b[1].total - a[1].total);

  const exportData = invoices.map((inv) => ({
    number: inv.number,
    customer: inv.customer.name,
    date: new Date(inv.date).toISOString().slice(0, 10),
    dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().slice(0, 10) : "",
    subtotal: String(inv.subtotal),
    tax: String(inv.tax),
    discount: String(inv.discount),
    total: String(inv.total),
    amountPaid: String(inv.amountPaid),
    balance: String(Number(inv.total) - Number(inv.amountPaid)),
    status: inv.status,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Sales Report</h2>
          <p className="text-sm text-muted-foreground">
            {invoices.length} invoices • {formatCurrency(totalRevenue)} revenue
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/reports">
            <Button variant="outline" size="sm">
              Back
            </Button>
          </Link>
          <ExportCsvButton data={exportData} filename="sales-report.csv" label="Export CSV" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Revenue (Paid)</p>
            <p className="text-lg font-bold text-success">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Outstanding</p>
            <p className="text-lg font-bold text-warning">{formatCurrency(totalOutstanding)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Invoices</p>
            <p className="text-2xl font-bold">{invoices.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice Status Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground">Count</th>
                  <th className="pb-3 font-medium text-muted-foreground">Total</th>
                  <th className="pb-3 font-medium text-muted-foreground">Amount Paid</th>
                  <th className="pb-3 font-medium text-muted-foreground">Balance</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(statusTotals).map(([status, v]) => (
                  <tr key={status} className="border-b border-border">
                    <td className="py-3">
                      <Badge variant={(statusVariant[status] as any) || "secondary"}>{status}</Badge>
                    </td>
                    <td className="py-3">{v.count}</td>
                    <td className="py-3">{formatCurrency(v.total)}</td>
                    <td className="py-3">{formatCurrency(v.paid)}</td>
                    <td className="py-3">{formatCurrency(v.total - v.paid)}</td>
                  </tr>
                ))}
                {Object.keys(statusTotals).length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No invoices
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue by Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 font-medium text-muted-foreground">Customer</th>
                  <th className="pb-3 font-medium text-muted-foreground">Invoices</th>
                  <th className="pb-3 font-medium text-muted-foreground">Total</th>
                  <th className="pb-3 font-medium text-muted-foreground">Paid</th>
                  <th className="pb-3 font-medium text-muted-foreground">Balance</th>
                </tr>
              </thead>
              <tbody>
                {sortedCustomers.map(([name, v]) => (
                  <tr key={name} className="border-b border-border">
                    <td className="py-3 font-medium">{name}</td>
                    <td className="py-3">{v.count}</td>
                    <td className="py-3">{formatCurrency(v.total)}</td>
                    <td className="py-3">{formatCurrency(v.paid)}</td>
                    <td className="py-3">{formatCurrency(v.total - v.paid)}</td>
                  </tr>
                ))}
                {sortedCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportFilters from={from} to={to} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 font-medium text-muted-foreground">Number</th>
                  <th className="pb-3 font-medium text-muted-foreground">Customer</th>
                  <th className="pb-3 font-medium text-muted-foreground">Date</th>
                  <th className="pb-3 font-medium text-muted-foreground">Total</th>
                  <th className="pb-3 font-medium text-muted-foreground">Paid</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 200).map((inv) => (
                  <tr key={inv.id} className="border-b border-border">
                    <td className="py-3 font-mono text-xs">{inv.number}</td>
                    <td className="py-3 text-muted-foreground">{inv.customer.name}</td>
                    <td className="py-3 text-muted-foreground">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="py-3">{formatCurrency(Number(inv.total))}</td>
                    <td className="py-3">{formatCurrency(Number(inv.amountPaid))}</td>
                    <td className="py-3">
                      <Badge variant={(statusVariant[inv.status] as any) || "secondary"}>{inv.status}</Badge>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No invoices
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
