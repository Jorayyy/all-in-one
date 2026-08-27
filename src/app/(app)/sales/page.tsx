import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/format";
import { Plus, Money, Clock, TrendUp } from "@/components/icons";

export default async function SalesPage() {
  await requireAuth();

  const invoices = await db.invoice.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const stats = {
    revenue: invoices
      .filter((i) => i.status === "PAID")
      .reduce((sum, i) => sum + Number(i.total), 0),
    pending: invoices
      .filter((i) => i.status === "PENDING" || i.status === "PARTIAL")
      .reduce((sum, i) => sum + (Number(i.total) - Number(i.amountPaid)), 0),
  };

  const statusVariant: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
    DRAFT: "secondary",
    PENDING: "warning",
    PARTIAL: "warning",
    PAID: "success",
    OVERDUE: "destructive",
    CANCELLED: "destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Sales & Invoicing</h2>
          <p className="text-sm text-muted-foreground">Manage quotations and invoices</p>
        </div>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-success/10 p-2 text-success">
                <Money className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-xl font-semibold">{formatCurrency(stats.revenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-warning/10 p-2 text-warning">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-semibold">{formatCurrency(stats.pending)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
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
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-border">
                    <td className="py-3 font-medium">{invoice.number}</td>
                    <td className="py-3 text-muted-foreground">{invoice.customer.name}</td>
                    <td className="py-3 text-muted-foreground">{formatDate(invoice.date)}</td>
                    <td className="py-3">{formatCurrency(Number(invoice.total))}</td>
                    <td className="py-3">
                      <Badge variant={statusVariant[invoice.status]}>
                        {invoice.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
